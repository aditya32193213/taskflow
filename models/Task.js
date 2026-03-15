// models/Task.js

import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    // Description is stored AES-256-CBC encrypted in the DB.
    // ⚠️ NO maxlength here — encrypted text is ~2x longer than the original
    // (hex encoding + 32-char IV prefix). A 1000-char input becomes ~2049 chars.
    // Validation of the original length happens in the API route before encryption.
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be todo, in-progress, or done',
      },
      default: 'todo',
    },
    // Reference to the User who owns this task — enforces authorization
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index: quickly find all tasks for a user sorted by creation date
TaskSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
