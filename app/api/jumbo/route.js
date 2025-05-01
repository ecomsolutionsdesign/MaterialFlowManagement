// app/api/jumbo/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { generateJumboId } from '../../../lib/utils';
import Jumbo from '../../../models/Jumbo';

export async function GET() {
  try {
    await connectToDatabase();
    const jumbos = await Jumbo.find({}).sort({ createdAt: -1 });

    return NextResponse.json(jumbos);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { lineNo, weight, scrapWeight, selectedDate } = await request.json(); // Get selectedDate from the body

    await connectToDatabase();

    // Generate Jumbo ID using the selected date
    const jumboId = await generateJumboId(lineNo, new Date(selectedDate));

    // Create new jumbo
    const jumbo = new Jumbo({
      jumboId,
      lineNo: parseInt(lineNo),
      weight: parseFloat(weight),
      scrapWeight: parseFloat(scrapWeight),
    });

    await jumbo.save();

    return NextResponse.json({ message: 'Jumbo created successfully', jumboId });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}