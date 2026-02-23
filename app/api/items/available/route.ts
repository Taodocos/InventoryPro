import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/lib/models/Item';
import { verifyAuth } from '@/lib/auth';

// GET available items for issue form autocomplete
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get user auth info
    const auth = await verifyAuth(req);
    
    let query: any = { quantity: { $gt: 0 } };
    
    // If user is not admin, filter by their location
    if (auth && !auth.isAdmin) {
      query.warehouseName = auth.location;
    }
    
    const items = await Item.find(query)
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
