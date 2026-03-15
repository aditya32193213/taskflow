// app/api/auth/register/route.js

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { signToken, getCookieOptions } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // ── Input validation ─────────────────────────────────────────────────────
    const errors = {};
    if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Valid email is required';
    if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (Object.keys(errors).length > 0) {
      return errorResponse('Validation failed', 422, errors);
    }

    await connectDB();

    // ── Check for duplicate email ─────────────────────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse('Email already registered', 409);
    }

    // ── Create user (password hashing happens in the model's pre-save hook) ──
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password });

    // ── Issue JWT and set HTTP-only cookie ────────────────────────────────────
    const token = signToken({ id: user._id, email: user.email, name: user.name });
    const response = successResponse(
      { message: 'Account created successfully', user: { id: user._id, name: user.name, email: user.email } },
      201
    );
    response.cookies.set('token', token, getCookieOptions());

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('Internal server error', 500);
  }
}
