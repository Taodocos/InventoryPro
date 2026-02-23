import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import IssuedItem from '@/lib/models/IssuedItem';
import Item from '@/lib/models/Item';
import { verifyAuth } from '@/lib/auth';

// GET all issued items
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get user auth info
    const auth = await verifyAuth(req);
    
    let query: any = {};
    
    // If user is not admin, filter by their location
    if (auth && !auth.isAdmin) {
      // Get items from user's location first
      const userItems = await Item.find({ warehouseName: auth.location }).select('_id');
      const itemIds = userItems.map(item => item._id);
      query.itemId = { $in: itemIds };
    }
    
    const issuedItems = await IssuedItem.find(query).sort({ createdAt: -1 });
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
    
    console.log('Issue POST request body:', body);
    
    // Find the item to issue
    const item = await Item.findOne({ itemId: body.itemCode });
    console.log('Found item:', item);
    
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
      unitPrice: item.unitPrice,
      issuedTo: body.issuedTo,
      issueDate: body.issueDate,
      purpose: body.purpose,
      issuedBy: body.issuedBy,
      warehouseLocation: item.warehouseName,
      approvalStatus: 'Pending',
      dateRecorded: body.dateRecorded || new Date(),
      signature: body.signature,
    });

    console.log('Created issued item:', issuedItem);

    // Reduce quantity from item - use updateOne to avoid validation issues
    await Item.updateOne(
      { _id: item._id },
      { 
        $set: { 
          quantity: item.quantity - body.issuedQuantity,
          totalPrice: (item.quantity - body.issuedQuantity) * item.unitPrice
        }
      }
    );

    console.log('Updated item quantity');

    return NextResponse.json(issuedItem, { status: 201 });
  } catch (error: any) {
    console.error('Issue POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to issue item' },
      { status: 500 }
    );
  }
}
