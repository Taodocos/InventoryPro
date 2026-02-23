import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  username: string;
  isAdmin: boolean;
  isApprover: boolean;
  location: string;
}

export async function verifyAuth(req: NextRequest): Promise<AuthPayload | null> {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as AuthPayload;

    return decoded;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get('token')?.value || null;
}
