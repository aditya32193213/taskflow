// app/api/auth/me/route.js
// Returns the currently logged-in user's info (read from JWT cookie)

import { getUserFromRequest } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(request) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded) return errorResponse('Not authenticated', 401);

    await connectDB();
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return errorResponse('User not found', 404);

    return successResponse({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return errorResponse('Internal server error', 500);
  }
}
