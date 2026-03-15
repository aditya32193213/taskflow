// app/api/tasks/route.js
// GET  /api/tasks  — list tasks with pagination, filtering, search
// POST /api/tasks  — create a new task

import { connectDB } from '@/lib/db';
import Task from '@/models/Task';
import { getUserFromRequest } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/encryption';
import { successResponse, errorResponse } from '@/lib/apiResponse';

// ── GET — List tasks ──────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return errorResponse('Not authenticated', 401);

    await connectDB();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip  = (page - 1) * limit;

    // Filter & search
    const status = searchParams.get('status');  // 'todo' | 'in-progress' | 'done'
    const search = searchParams.get('search');  // title search string

    // Build query — ALWAYS scope to current user (authorization)
    const query = { user: user.id };
    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      query.status = status;
    }
    if (search && search.trim()) {
      // Case-insensitive partial title search
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const [tasks, total] = await Promise.all([
      Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Task.countDocuments(query),
    ]);

    // Decrypt descriptions before sending to client
    const decryptedTasks = tasks.map((task) => ({
      ...task,
      description: decrypt(task.description),
    }));

    return successResponse({
      tasks: decryptedTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ── POST — Create task ────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return errorResponse('Not authenticated', 401);

    const body = await request.json();
    const { title, description, status } = body;

    // Validation
    const errors = {};
    if (!title || title.trim().length === 0) errors.title = 'Title is required';
    if (title && title.trim().length > 100) errors.title = 'Title cannot exceed 100 characters';
    if (status && !['todo', 'in-progress', 'done'].includes(status)) {
      errors.status = 'Status must be todo, in-progress, or done';
    }
    if (Object.keys(errors).length > 0) return errorResponse('Validation failed', 422, errors);

    await connectDB();

    // Encrypt description before storing in DB
    const task = await Task.create({
      title: title.trim(),
      description: description ? encrypt(description.trim()) : '',
      status: status || 'todo',
      user: user.id,
    });

    return successResponse(
      { message: 'Task created', task: { ...task.toObject(), description: description?.trim() || '' } },
      201
    );
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return errorResponse('Internal server error', 500);
  }
}
