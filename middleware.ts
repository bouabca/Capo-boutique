import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth'; // or your custom auth logic

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Example: check for a session token (adapt to your auth system)
    // If using next-auth:
    // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    // if (!token) {
    //   return NextResponse.redirect(new URL('/', req.url));
    // }

    // If using a custom cookie/token:
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    // Optionally, validate the token here
  }

  return NextResponse.next();
}




export const config = {
  matcher: ['/admin/:path*'],
}; 