import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET all users (admin only)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const auth = await verifyAuth(req);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can view users.' },
        { status: 403 }
      );
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PUT update user (admin only)
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const auth = await verifyAuth(req);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can update users.' },
        { status: 403 }
      );
    }

    const { userId, username, email, location, permissions, isApprover } = await req.json();

    console.log('Received update request:', { userId, username, email, location, permissions, isApprover });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user information
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
      user.username = username;
    }

    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
      user.email = email.toLowerCase();
    }

    if (location) {
      user.location = location;
    }

    // Update permissions if provided
    if (permissions) {
      user.permissions = {
        canRegisterItems: permissions.canRegisterItems || false,
        canIssueItems: permissions.canIssueItems || false,
        canRequestItems: permissions.canRequestItems || false,
        canViewRequests: permissions.canViewRequests || false,
        canManageLocations: permissions.canManageLocations || false,
        canManageCategories: permissions.canManageCategories || false,
        canApproveItems: permissions.canApproveItems || false,
        canViewReports: permissions.canViewReports || false,
      };
    }

    // Update approver status if provided
    if (isApprover !== undefined) {
      user.isApprover = isApprover;
    }

    await user.save();

    console.log('User saved successfully:', {
      id: user._id,
      username: user.username,
      permissions: user.permissions,
      isApprover: user.isApprover,
    });

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          location: user.location,
          isAdmin: user.isAdmin,
          isApprover: user.isApprover,
          permissions: user.permissions,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE user (admin only)
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const auth = await verifyAuth(req);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can delete users.' },
        { status: 403 }
      );
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Prevent deleting the current admin user
    if (userId === auth.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('User delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
