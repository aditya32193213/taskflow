// middleware.js
// Next.js Edge Middleware — runs before any route renders
// Redirects unauthenticated users away from protected pages
// Redirects authenticated users away from login/register

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_ROUTES = ['/login', '/register'];
const PROTECTED_ROUTES = ['/dashboard'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  // Try to verify token using jose (works in Edge runtime, unlike jsonwebtoken)
  let isValidToken = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      isValidToken = true;
    } catch {
      isValidToken = false;
    }
  }

  // Logged in user tries to visit login/register → send to dashboard
  if (isPublicRoute && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Not logged in user tries to visit protected route → send to login
  if (isProtectedRoute && !isValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Remember where they wanted to go
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to these routes only (not API routes, not static files)
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
