import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/lib/models/Location';
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// PUT update location (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Verify admin access
    const auth = await verifyAuth(req);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can update locations.' },
        { status: 403 }
      );
    }

    const { name, code, description, isActive } = await req.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if location ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid location ID' },
        { status: 400 }
      );
    }

    // Check if another location has the same name or code
    const existingLocation = await Location.findOne({
      _id: { $ne: id },
      $or: [{ name }, { code: code.toUpperCase() }]
    });

    if (existingLocation) {
      return NextResponse.json(
        { error: 'Location with this name or code already exists' },
        { status: 409 }
      );
    }

    const location = await Location.findByIdAndUpdate(
      id,
      {
        name,
        code: code.toUpperCase(),
        description,
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Location updated successfully',
        location
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Location update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE location (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Verify admin access
    const auth = await verifyAuth(req);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can delete locations.' },
        { status: 403 }
      );
    }

    // Check if location ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid location ID' },
        { status: 400 }
      );
    }

    const location = await Location.findByIdAndDelete(id);

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Location deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Location delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
