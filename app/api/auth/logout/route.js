// app/api/auth/logout/route.js

import { successResponse } from '@/lib/apiResponse';

export async function POST() {
  const response = successResponse({ message: 'Logged out successfully' });
  // Clear the token cookie by setting maxAge to 0
  response.cookies.set('token', '', { maxAge: 0, path: '/' });
  return response;
}
