// app/api/jumbo/available-for-raw-material/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Jumbo from '../../../../models/Jumbo';
import RawMaterial from '../../../../models/RawMaterial';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
    const lineNo = searchParams.get('lineNo');
  try {
    await connectToDatabase();
    const query = lineNo ? { lineNo: parseInt(lineNo) } : {};
    const jumbos = await Jumbo.find(query).sort({ createdAt: -1 });
    // Get all jumbo IDs that already have a raw material entry
    const rawMaterials = await RawMaterial.find({});
    const existingRawMaterialJumbos = await RawMaterial.distinct('jumboId');

    // Find jumbos whose IDs are NOT in the list of existing raw material jumbos
    // const availableJumbos = await Jumbo.find({
    //   jumboId: { $nin: existingRawMaterialJumbos },
    // }).sort({ createdAt: -1 });

    const availableJumbosForRawMaterial = jumbos.filter(
      (jumbo) => !existingRawMaterialJumbos.includes(jumbo.jumboId)
  );

    return NextResponse.json(availableJumbosForRawMaterial);
  } catch (error) {
    console.error('Error fetching available jumbos:', error);
    return NextResponse.json({ message: 'Failed to fetch available jumbos' }, { status: 500 });
  }
}