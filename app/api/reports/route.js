// app/api/reports/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Jumbo from '../../../models/Jumbo';
import RawMaterial from '../../../models/RawMaterial';
import FinishGoods from '../../../models/FinishGoods';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const lineNo = searchParams.get('lineNo');

    try {
        await connectToDatabase();

        // Construct queries with lineNo filtering
        const rawMaterialQuery = lineNo ? { 'jumboId': { $regex: new RegExp(`^${lineNo}`), $options: 'i' } } : {}; // Assuming jumboId starts with lineNo
        const finishGoodsQuery = lineNo ? { 'jumboId': { $regex: new RegExp(`^${lineNo}`), $options: 'i' } } : {}; // Assuming jumboId starts with lineNo
        const jumboQuery = lineNo ? { lineNo: parseInt(lineNo) } : {};

        // Fetch data
        const rawMaterialData = await RawMaterial.find(rawMaterialQuery).lean(); // Use .lean() for faster reads
        const finishGoodsData = await FinishGoods.find(finishGoodsQuery).lean(); // Use .lean() for faster reads
        const jumboData = await Jumbo.find(jumboQuery).lean(); // Use .lean() for faster reads

        const reports = [];

        for (const jumbo of jumboData) {
            // Find raw material for this jumbo
            const rawMaterialEntry = rawMaterialData.find(rm => rm.jumboId === jumbo.jumboId);

            // Find finish goods entries for this jumbo
            const finishGoodsEntries = finishGoodsData.filter(fg => fg.jumboId === jumbo.jumboId);

            const rawMaterialWeight = rawMaterialEntry ? rawMaterialEntry.rawMaterialWeight : 0;
            const recycledScrapWeight = rawMaterialEntry ? rawMaterialEntry.scrapWeight : 0;

            const finishGoodsWeight = finishGoodsEntries.reduce(
                (total, entry) => total + (entry.finishGoodsWeight || 0),
                0
            );

            const outputScrapWeight = finishGoodsEntries.reduce(
                (total, entry) => total + (entry.scrapWeight || 0),
                0
            );

            if (rawMaterialEntry || finishGoodsEntries.length > 0) {
                reports.push({
                    jumboId: jumbo.jumboId,
                    lineNo: jumbo.lineNo,
                    rawMaterialWeight,
                    recycledScrapWeight,
                    finishGoodsWeight,
                    outputScrapWeight,
                    finishGoodsId: finishGoodsEntries.map(fg => fg.finishGoodsId).join(', '), // Include Finish Goods IDs
                });
            }
        }

        return NextResponse.json(reports);
    } catch (error) {
        console.error("Error generating report:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}