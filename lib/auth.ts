import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const secretKey = process.env.JWT_SECRET || 'your-secret-key';
const key = new TextEncoder().encode(secretKey);

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value;
}

export async function getUserFromToken(req?: NextRequest) {
  let token;
  
  if (req) {
    token = req.cookies.get('auth-token')?.value;
  } else {
    token = await getTokenFromCookies();
  }
  
  if (!token) return null;
  
  const payload = await verifyToken(token);
  return payload;
}