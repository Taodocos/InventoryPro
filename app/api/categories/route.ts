import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { verifyAuth } from '@/lib/auth';

// GET all active categories
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST create new category (admin only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Verify admin access
    const auth = await verifyAuth(req);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can create categories.' },
        { status: 403 }
      );
    }

    const { name, code, description } = await req.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { code: code.toUpperCase() }]
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name or code already exists' },
        { status: 409 }
      );
    }

    const category = new Category({
      name,
      code: code.toUpperCase(),
      description,
      isActive: true
    });

    await category.save();

    return NextResponse.json(
      {
        message: 'Category created successfully',
        category
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
