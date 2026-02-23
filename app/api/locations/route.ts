import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/lib/models/Location';
import { verifyAuth } from '@/lib/auth';

// GET all active locations
export async function GET() {
  try {
    await dbConnect();
    const locations = await Location.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// POST create new location (admin only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Verify admin access
    const auth = await verifyAuth(req);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can create locations.' },
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

    // Check if location already exists
    const existingLocation = await Location.findOne({
      $or: [{ name }, { code: code.toUpperCase() }]
    });

    if (existingLocation) {
      return NextResponse.json(
        { error: 'Location with this name or code already exists' },
        { status: 409 }
      );
    }

    const location = new Location({
      name,
      code: code.toUpperCase(),
      description,
      isActive: true
    });

    await location.save();

    return NextResponse.json(
      {
        message: 'Location created successfully',
        location
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Location creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
