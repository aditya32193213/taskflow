// app/api/tasks/[id]/route.js

import { connectDB } from '@/lib/db';
import Task from '@/models/Task';
import { getUserFromRequest } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/encryption';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import mongoose from 'mongoose';

// Helper: validate ObjectId to prevent injection
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Helper: find task and verify ownership
async function findOwnedTask(taskId, userId) {
  if (!isValidObjectId(taskId)) return null;
  return Task.findOne({ _id: taskId, user: userId });
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const { id } = await params; // ← await params (required in Next.js 15+)
    const user = getUserFromRequest(request);
    if (!user) return errorResponse('Not authenticated', 401);

    await connectDB();
    const task = await findOwnedTask(id, user.id);
    if (!task) return errorResponse('Task not found', 404);

    return successResponse({
      task: { ...task.toObject(), description: decrypt(task.description) },
    });
  } catch (error) {
    console.error('GET /api/tasks/[id] error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ── PUT ───────────────────────────────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const { id } = await params; // ← await params
    const user = getUserFromRequest(request);
    if (!user) return errorResponse('Not authenticated', 401);

    const body = await request.json();
    const { title, description, status } = body;

    // Validation
    const errors = {};
    if (title !== undefined) {
      if (!title || title.trim().length === 0) errors.title = 'Title cannot be empty';
      if (title.trim().length > 100) errors.title = 'Title cannot exceed 100 characters';
    }
    if (status !== undefined && !['todo', 'in-progress', 'done'].includes(status)) {
      errors.status = 'Status must be todo, in-progress, or done';
    }
    if (Object.keys(errors).length > 0) return errorResponse('Validation failed', 422, errors);

    await connectDB();
    const task = await findOwnedTask(id, user.id);
    if (!task) return errorResponse('Task not found', 404);

    // Only update fields that were actually sent
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = encrypt(description.trim());
    if (status !== undefined) task.status = status;

    await task.save();

    return successResponse({
      message: 'Task updated',
      task: {
        ...task.toObject(),
        description: description !== undefined ? description.trim() : decrypt(task.description),
      },
    });
  } catch (error) {
    console.error('PUT /api/tasks/[id] error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // ← await params
    const user = getUserFromRequest(request);
    if (!user) return errorResponse('Not authenticated', 401);

    await connectDB();
    const task = await findOwnedTask(id, user.id);
    if (!task) return errorResponse('Task not found', 404);

    await task.deleteOne();
    return successResponse({ message: 'Task deleted' });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return errorResponse('Internal server error', 500);
  }
}
