import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/lib/models/Item';

// GET available items for issue form autocomplete
export async function GET() {
  try {
    await dbConnect();
    const items = await Item.find({ quantity: { $gt: 0 } })
      .select('itemId itemName category quantity')
      .sort({ itemName: 1 });
    
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch available items' },
      { status: 500 }
    );
  }
}
