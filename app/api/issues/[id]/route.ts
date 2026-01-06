import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import IssuedItem from '@/lib/models/IssuedItem';

// GET single issued item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const issuedItem = await IssuedItem.findById(id);
    if (!issuedItem) {
      return NextResponse.json({ error: 'Issued item not found' }, { status: 404 });
    }
    return NextResponse.json(issuedItem);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch issued item' }, { status: 500 });
  }
}

// PUT update issued item status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    const issuedItem = await IssuedItem.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!issuedItem) {
      return NextResponse.json({ error: 'Issued item not found' }, { status: 404 });
    }
    return NextResponse.json(issuedItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update issued item' }, { status: 500 });
  }
}
