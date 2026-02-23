import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/lib/models/Item';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get user auth info
    const auth = await verifyAuth(req);
    
    // Get all locations with their item counts and values
    const locationStats = await Item.aggregate([
      {
        $group: {
          _id: '$warehouseName',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalPrice' },
          inStock: {
            $sum: {
              $cond: [{ $eq: ['$status', 'In Stock'] }, 1, 0]
            }
          },
          lowStock: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Low Stock'] }, 1, 0]
            }
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Out of Stock'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return NextResponse.json(locationStats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch location stats' }, { status: 500 });
  }
}
