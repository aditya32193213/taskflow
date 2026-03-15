// app/api/auth/login/route.js

import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { signToken, getCookieOptions } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    await connectDB();

    // ── Find user (explicitly select password since it has select: false) ─────
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Use the same error message for both "not found" and "wrong password"
    // This prevents user enumeration attacks (attacker can't tell if email exists)
    if (!user || !(await user.comparePassword(password))) {
      return errorResponse('Invalid email or password', 401);
    }

    // ── Issue JWT ─────────────────────────────────────────────────────────────
    const token = signToken({ id: user._id, email: user.email, name: user.name });
    const response = successResponse({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
    });
    response.cookies.set('token', token, getCookieOptions());

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}
