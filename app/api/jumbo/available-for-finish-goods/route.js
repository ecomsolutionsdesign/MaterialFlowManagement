// app/api/jumbo/available-for-finish-goods/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import RawMaterial from '../../../../models/RawMaterial';
import FinishGoods from '../../../../models/FinishGoods';
import Jumbo from '../../../../models/Jumbo';


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lineNo = searchParams.get('lineNo');
  try {
    await connectToDatabase();

    const jumboQuery = lineNo ? { lineNo: parseInt(lineNo) } : {};
    const jumbos = await Jumbo.find(jumboQuery);
    // Get all jumbo IDs that have a raw material entry
    const jumbosWithRawMaterial = await RawMaterial.distinct('jumboId');

    // Get all jumbo IDs that already have a finish goods entry
    const jumbosWithFinishGoods = await FinishGoods.distinct('jumboId');

    // Find jumbo IDs that are in raw material but not in finish goods
    const availableJumbos = jumbos
            .filter((jumbo) => jumbosWithRawMaterial.includes(jumbo.jumboId))
            .filter((jumbo) => !jumbosWithFinishGoods.includes(jumbo.jumboId));

    // Fetch the actual Jumbo documents for these IDs
    // const availableJumboDetails = await Jumbo.find({
    //   jumboId: { $in: availableJumbos },
    // }).sort({ createdAt: -1 });

    return NextResponse.json(availableJumbos);
  } catch (error) {
    console.error('Error fetching available jumbos for finish goods:', error);
    return NextResponse.json(
      { message: 'Failed to fetch available jumbos for finish goods' },
      { status: 500 }
    );
  }
}