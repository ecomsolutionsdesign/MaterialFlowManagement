// app/api/raw-material/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import RawMaterial from '../../../models/RawMaterial';
import Jumbo from '../../../models/Jumbo';

export async function GET() {
  try {
    await connectToDatabase();
    const rawMaterials = await RawMaterial.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(rawMaterials);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const {lineNo, jumboId, rawMaterialWeight, scrapWeight, scrapSources } = await request.json();
    
    await connectToDatabase();
    
    // Check if jumbo exists
    const jumbo = await Jumbo.findOne({ jumboId });
    if (!jumbo) {
      return NextResponse.json({ message: 'Jumbo not found' }, { status: 404 });
    }
    
    // Check if raw material entry already exists for this jumbo
    const existingEntry = await RawMaterial.findOne({ jumboId });
    if (existingEntry) {
      return NextResponse.json(
        { message: 'Raw material entry already exists for this jumbo' },
        { status: 400 }
      );
    }
    
    // Create new raw material entry
    const rawMaterial = new RawMaterial({
      lineNo,
      jumboId,
      rawMaterialWeight: parseFloat(rawMaterialWeight),
      scrapWeight: parseFloat(scrapWeight),
      scrapJumboSources: scrapSources,
    });
    
    await rawMaterial.save();
    
    return NextResponse.json({ message: 'Raw material entry created successfully' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}