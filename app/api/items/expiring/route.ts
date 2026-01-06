import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/lib/models/Item';

export async function GET() {
  try {
    await dbConnect();
    
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    // Find items that have expiry date and are either expired or expiring within 3 months
    const expiringItems = await Item.find({
      expiryDate: { $exists: true, $ne: null, $lte: threeMonthsFromNow }
    }).sort({ expiryDate: 1 });

    // Calculate days remaining for each item
    const itemsWithDaysRemaining = expiringItems.map(item => {
      const expiryDate = new Date(item.expiryDate);
      const timeDiff = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      let expiryStatus: 'expired' | 'critical' | 'warning' = 'warning';
      if (daysRemaining <= 0) {
        expiryStatus = 'expired';
      } else if (daysRemaining <= 30) {
        expiryStatus = 'critical';
      }

      return {
        _id: item._id,
        itemId: item.itemId,
        itemName: item.itemName,
        category: item.category,
        quantity: item.quantity,
        unitMeasurement: item.unitMeasurement,
        expiryDate: item.expiryDate,
        daysRemaining,
        expiryStatus
      };
    });

    // Count by status
    const expiredCount = itemsWithDaysRemaining.filter(i => i.expiryStatus === 'expired').length;
    const criticalCount = itemsWithDaysRemaining.filter(i => i.expiryStatus === 'critical').length;
    const warningCount = itemsWithDaysRemaining.filter(i => i.expiryStatus === 'warning').length;

    return NextResponse.json({
      items: itemsWithDaysRemaining,
      summary: {
        total: itemsWithDaysRemaining.length,
        expired: expiredCount,
        critical: criticalCount,
        warning: warningCount
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expiring items' }, { status: 500 });
  }
}
