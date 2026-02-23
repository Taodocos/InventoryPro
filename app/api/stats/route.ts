import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/lib/models/Item';
import IssuedItem from '@/lib/models/IssuedItem';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get user auth info
    const auth = await verifyAuth(req);
    
    let query: any = {};
    
    // If user is not admin, filter by their location
    if (auth && !auth.isAdmin) {
      query.warehouseName = auth.location;
    }
    
    const [
      totalItems,
      totalQuantity,
      lowStockItems,
      outOfStockItems,
      totalIssuedRecords,
      activeIssues,
      items,
      issuedItemsValue
    ] = await Promise.all([
      Item.countDocuments(query),
      Item.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: '$quantity' } } }]),
      Item.countDocuments({ ...query, status: 'Low Stock' }),
      Item.countDocuments({ ...query, status: 'Out of Stock' }),
      IssuedItem.countDocuments(),
      IssuedItem.countDocuments({ approvalStatus: 'Pending' }),
      Item.aggregate([{ $match: query }, { $group: { _id: null, totalValue: { $sum: '$totalPrice' } } }]),
      IssuedItem.aggregate([
        { 
          $lookup: {
            from: 'items',
            localField: 'itemId',
            foreignField: '_id',
            as: 'itemDetails'
          }
        },
        { $unwind: '$itemDetails' },
        {
          $group: {
            _id: null,
            totalIssuedValue: {
              $sum: { $multiply: ['$issuedQuantity', '$itemDetails.unitPrice'] }
            }
          }
        }
      ])
    ]);

    return NextResponse.json({
      totalItems,
      totalQuantity: totalQuantity[0]?.total || 0,
      totalValue: items[0]?.totalValue || 0,
      lowStockItems,
      outOfStockItems,
      totalIssuedRecords,
      activeIssues,
      totalIssuedValue: issuedItemsValue[0]?.totalIssuedValue || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
