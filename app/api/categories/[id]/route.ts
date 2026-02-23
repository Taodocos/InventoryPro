import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// PUT update category (admin only)
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
        { error: 'Unauthorized. Only admins can update categories.' },
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

    // Check if category ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if another category has the same name or code
    const existingCategory = await Category.findOne({
      _id: { $ne: id },
      $or: [{ name }, { code: code.toUpperCase() }]
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name or code already exists' },
        { status: 409 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        code: code.toUpperCase(),
        description,
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Category updated successfully',
        category
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Category update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE category (admin only)
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
        { error: 'Unauthorized. Only admins can delete categories.' },
        { status: 403 }
      );
    }

    // Check if category ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Category delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
