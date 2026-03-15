// lib/apiResponse.js
// Centralized response helpers — keeps all API responses in a consistent format

import { NextResponse } from 'next/server';

export function successResponse(data, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function errorResponse(message, status = 400, errors = null) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status }
  );
}
