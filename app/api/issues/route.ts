import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import IssuedItem from '@/lib/models/IssuedItem';
import Item from '@/lib/models/Item';

// GET all issued items
export async function GET() {
  try {
    await dbConnect();
    const issuedItems = await IssuedItem.find({}).sort({ createdAt: -1 });
    return NextResponse.json(issuedItems);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch issued items' },
      { status: 500 }
    );
  }
}

// POST issue an item
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Find the item to issue
    const item = await Item.findOne({ itemId: body.itemCode });
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if enough quantity available
    if (item.quantity < body.issuedQuantity) {
      return NextResponse.json(
        { error: `Insufficient quantity. Available: ${item.quantity}` },
        { status: 400 }
      );
    }

    // Create issued item record
    const issuedItem = await IssuedItem.create({
      itemId: item._id,
      itemCode: item.itemId,
      itemName: item.itemName,
      issuedQuantity: body.issuedQuantity,
      issuedTo: body.issuedTo,
      issueDate: body.issueDate,
      purpose: body.purpose,
      issuedBy: body.issuedBy,
      approvedBy: body.approvedBy,
      dateRecorded: body.dateRecorded || new Date(),
      signature: body.signature,
    });

    // Reduce quantity from item
    item.quantity -= body.issuedQuantity;
    item.totalPrice = item.quantity * item.unitPrice;
    await item.save();

    return NextResponse.json(issuedItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to issue item' },
      { status: 500 }
    );
  }
}
