import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Request from '@/lib/models/Request';
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// PUT update request status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    const { status } = await req.json();

    if (!status || !['Unseen', 'Seen', 'Approved', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const request = await Request.findById(id);
    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Check location access
    if (!auth.isAdmin && request.location !== auth.location) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only view requests in your location.' },
        { status: 403 }
      );
    }

    request.status = status;
    await request.save();

    return NextResponse.json(request);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update request' },
      { status: 500 }
    );
  }
}

// DELETE request
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    const request = await Request.findById(id);
    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Only allow deletion by requester or admin
    if (!auth.isAdmin && request.requestedByUserId !== auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only delete your own requests.' },
        { status: 403 }
      );
    }

    await Request.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Request deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete request' },
      { status: 500 }
    );
  }
}
