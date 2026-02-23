import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Request from '@/lib/models/Request';
import { verifyAuth } from '@/lib/auth';

// GET all requests (filtered by location for non-admins)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let query: any = {};

    // If user is not admin, show requests from their location (requests made by users in their location)
    if (!auth.isAdmin) {
      query.location = auth.location;
    }

    const requests = await Request.find(query).sort({ createdAt: -1 });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST create new request
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const newRequest = await Request.create({
      ...body,
      requestedBy: auth.username,
      requestedByUserId: auth.userId,
      location: auth.location,
      status: 'Unseen'
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create request' },
      { status: 500 }
    );
  }
}
