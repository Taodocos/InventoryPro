import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import IssuedItem from '@/lib/models/IssuedItem';
import { verifyAuth } from '@/lib/auth';

// GET all approvals (pending, approved, rejected) for the logged-in approver
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const auth = await verifyAuth(req);
    if (!auth || !auth.isApprover) {
      return NextResponse.json(
        { error: 'Unauthorized. Only approvers can view approvals.' },
        { status: 403 }
      );
    }

    // Get all approvals for items in the approver's location
    const allApprovals = await IssuedItem.find({
      warehouseLocation: auth.location
    }).sort({ createdAt: -1 });

    return NextResponse.json(allApprovals);
  } catch (error) {
    console.error('Failed to fetch approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    );
  }
}
