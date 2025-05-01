// app/api/lines/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Jumbo from '../../../models/Jumbo';

export async function GET() {
    try {
        await connectToDatabase();
        const uniqueLines = await Jumbo.distinct('lineNo').sort();
        return NextResponse.json(uniqueLines);
    } catch (error) {
        console.error('Error fetching unique line numbers:', error);
        return NextResponse.json({ message: 'Failed to fetch production lines' }, { status: 500 });
    }
}