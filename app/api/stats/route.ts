import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/lib/models/Item';
import IssuedItem from '@/lib/models/IssuedItem';

export async function GET() {
  try {
    await dbConnect();
    
    const [
      totalItems,
      totalQuantity,
      lowStockItems,
      outOfStockItems,
      totalIssuedRecords,
      activeIssues,
      items
    ] = await Promise.all([
      Item.countDocuments(),
      Item.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]),
      Item.countDocuments({ status: 'Low Stock' }),
      Item.countDocuments({ status: 'Out of Stock' }),
      IssuedItem.countDocuments(),
      IssuedItem.countDocuments({ status: 'Active' }),
      Item.aggregate([{ $group: { _id: null, totalValue: { $sum: '$totalPrice' } } }])
    ]);

    return NextResponse.json({
      totalItems,
      totalQuantity: totalQuantity[0]?.total || 0,
      totalValue: items[0]?.totalValue || 0,
      lowStockItems,
      outOfStockItems,
      totalIssuedRecords,
      activeIssues
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
