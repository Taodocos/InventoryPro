import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import IssuedItem from '@/lib/models/IssuedItem';
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// PUT approve or reject an issued item
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const auth = await verifyAuth(req);
    if (!auth || !auth.isApprover) {
      return NextResponse.json(
        { error: 'Unauthorized. Only approvers can approve items.' },
        { status: 403 }
      );
    }

    const { approvalStatus, rejectionReason } = await req.json();

    if (!approvalStatus || !['Approved', 'Rejected'].includes(approvalStatus)) {
      return NextResponse.json(
        { error: 'Invalid approval status. Must be Approved or Rejected.' },
        { status: 400 }
      );
    }

    if (approvalStatus === 'Rejected' && !rejectionReason?.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    const issuedItem = await IssuedItem.findById(id);
    if (!issuedItem) {
      return NextResponse.json(
        { error: 'Issued item not found' },
        { status: 404 }
      );
    }

    // Check if the item is in the approver's location
    if (issuedItem.warehouseLocation !== auth.location) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only approve items in your location.' },
        { status: 403 }
      );
    }

    // Check if already approved/rejected
    if (issuedItem.approvalStatus !== 'Pending') {
      return NextResponse.json(
        { error: `Item is already ${issuedItem.approvalStatus.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Update approval status
    issuedItem.approvalStatus = approvalStatus;
    issuedItem.approvedBy = auth.username;
    issuedItem.approvedByUserId = auth.userId;
    issuedItem.approvalDate = new Date();
    
    if (approvalStatus === 'Rejected') {
      issuedItem.rejectionReason = rejectionReason;
    }

    await issuedItem.save();

    return NextResponse.json(
      {
        message: `Item ${approvalStatus.toLowerCase()} successfully`,
        issuedItem
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
