// app/api/finish-goods/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import FinishGoods from '../../../models/FinishGoods';
import Jumbo from '../../../models/Jumbo';
import RawMaterial from '../../../models/RawMaterial';

export async function GET() {
  try {
    await connectToDatabase();
    const finishGoods = await FinishGoods.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(finishGoods);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { lineNo, jumboId, finishGoodsId, finishGoodsWeight, scrapWeight } = await request.json();
    
    await connectToDatabase();
    
    // Check if jumbo exists
    const jumbo = await Jumbo.findOne({ jumboId });
    if (!jumbo) {
      return NextResponse.json({ message: 'Jumbo not found' }, { status: 404 });
    }
    
    // Check if raw material entry exists for this jumbo
    const rawMaterial = await RawMaterial.findOne({ jumboId });
    if (!rawMaterial) {
      return NextResponse.json(
        { message: 'Raw material entry must be created before finish goods' },
        { status: 400 }
      );
    }
    
    // Create new finish goods entry
    const finishGoods = new FinishGoods({
      lineNo,
      jumboId,
      finishGoodsId,
      finishGoodsWeight: parseFloat(finishGoodsWeight),
      scrapWeight: parseFloat(scrapWeight),
    });
    
    await finishGoods.save();
    
    return NextResponse.json({ message: 'Finish goods entry created successfully' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}