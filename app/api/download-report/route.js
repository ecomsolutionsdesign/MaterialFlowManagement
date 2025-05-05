import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Jumbo from '../../../models/Jumbo';
import RawMaterial from '../../../models/RawMaterial';
import FinishGoods from '../../../models/FinishGoods';
import * as XLSX from 'xlsx';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lineNo = searchParams.get('lineNo');
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  if (!lineNo || !startDateParam || !endDateParam) {
    return NextResponse.json({ message: 'Missing lineNo, startDate, or endDate' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);
    endDate.setDate(endDate.getDate() + 1); // Include the end date

    // Construct queries with lineNo and date range filtering
    const rawMaterialQuery = {
      jumboId: { $regex: new RegExp(`^${lineNo}`), $options: 'i' },
      createdAt: { $gte: startDate, $lt: endDate },
    };
    const finishGoodsQuery = {
      jumboId: { $regex: new RegExp(`^${lineNo}`), $options: 'i' },
      createdAt: { $gte: startDate, $lt: endDate },
    };
    const jumboQuery = {
      lineNo: parseInt(lineNo),
      createdAt: { $gte: startDate, $lt: endDate },
    };

    const rawMaterialData = await RawMaterial.find(rawMaterialQuery).lean();
    const finishGoodsData = await FinishGoods.find(finishGoodsQuery).lean();
    const jumboData = await Jumbo.find(jumboQuery).lean();

    const reportData = [];

    for (const jumbo of jumboData) {
      const rawMaterialEntry = rawMaterialData.find(rm => rm.jumboId === jumbo.jumboId);
      const finishGoodsEntries = finishGoodsData.filter(fg => fg.jumboId === jumbo.jumboId);

      const rawMaterialWeight = rawMaterialEntry ? rawMaterialEntry.rawMaterialWeight : 0;
      const recycledScrapWeight = rawMaterialEntry ? rawMaterialEntry.scrapWeight : 0;
      const finishGoodsWeight = finishGoodsEntries.reduce((total, entry) => total + (entry.finishGoodsWeight || 0), 0);
      const outputScrapWeight = finishGoodsEntries.reduce((total, entry) => total + (entry.scrapWeight || 0), 0);
      const finishGoodsIds = finishGoodsEntries.map(fg => fg.finishGoodsId).join(', ');

      const totalInput = rawMaterialWeight + recycledScrapWeight;
      const totalOutput = finishGoodsWeight + outputScrapWeight;
      const difference = totalInput - totalOutput;
      const differencePercentage = totalInput > 0 ? ((difference / totalInput) * 100).toFixed(2) : '0.00';

      reportData.push({
        'Jumbo ID': jumbo.jumboId,
        'Line No': jumbo.lineNo,
        'Raw Material (kg)': rawMaterialWeight.toFixed(2),
        'Recycled Scrap (kg)': recycledScrapWeight.toFixed(2),
        'Total Input (kg)': totalInput.toFixed(2),
        'Finish Goods Serial No.': finishGoodsIds,
        'Finish Goods (kg)': finishGoodsWeight.toFixed(2),
        'Output Scrap (kg)': outputScrapWeight.toFixed(2),
        'Total Output (kg)': totalOutput.toFixed(2),
        'Difference (kg)': difference.toFixed(2),
        'Difference (%)': `${differencePercentage}%`,
        'Created At': jumbo.createdAt.toISOString(),
      });
    }

    if (reportData.length === 0) {
      return NextResponse.json({ message: 'No data found for the selected criteria.' }, { status: 200 });
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(reportData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Production Report');

    // Generate the Excel file as a buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers for file download
    const headers = new Headers({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="production_report_line_${lineNo}_${startDateParam}_to_${endDateParam}.xlsx"`,
    });

    return new NextResponse(excelBuffer, { headers });

  } catch (error) {
    console.error("Error generating Excel report:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}