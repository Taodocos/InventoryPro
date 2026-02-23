import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Verify admin access
    const auth = await verifyAuth(req);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can register users.' },
        { status: 403 }
      );
    }

    const { username, email, password, isAdmin, isApprover, location } = await req.json();

    if (!username || !email || !password || !location) {
      return NextResponse.json(
        { error: 'Username, email, password, and location are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    const user = new User({
      username,
      email,
      password,
      location,
      isAdmin: isAdmin || false,
      isApprover: isApprover || false
    });

    await user.save();

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          location: user.location,
          isAdmin: user.isAdmin,
          isApprover: user.isApprover
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
