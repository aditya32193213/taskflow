// lib/auth.js
// JWT creation, verification, and cookie helpers

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '7d';

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in your .env.local file');
}

/**
 * Create a signed JWT containing the user's ID and email
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify and decode a JWT. Returns the payload or throws.
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Returns cookie options for storing the JWT securely.
 * HttpOnly: JS cannot read it (XSS protection)
 * Secure: Only sent over HTTPS (in production)
 * SameSite: CSRF protection
 */
export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: '/',
  };
}

/**
 * Extract and verify JWT from request cookies.
 * Returns decoded payload or null.
 */
export function getUserFromRequest(request) {
  try {
    const cookie = request.cookies.get('token');
    if (!cookie?.value) return null;
    return verifyToken(cookie.value);
  } catch {
    return null;
  }
}
