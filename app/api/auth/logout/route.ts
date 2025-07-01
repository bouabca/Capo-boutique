import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function GET() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // Clear the auth cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  });

  return response;
}