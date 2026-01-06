import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/lib/models/Item';

// GET all items
export async function GET() {
  try {
    await dbConnect();
    const items = await Item.find({}).sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST new item
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Check if itemId already exists
    const existingItem = await Item.findOne({ itemId: body.itemId });
    if (existingItem) {
      return NextResponse.json(
        { error: 'Item ID already exists' },
        { status: 400 }
      );
    }

    const item = await Item.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create item' },
      { status: 500 }
    );
  }
}
