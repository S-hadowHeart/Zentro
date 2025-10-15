import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  dueTime: {
    type: Date,
    default: null
  },
  pomodorosCompleted: {
    type: Number,
    default: 0
  },
  estimatedPomodoros: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for faster queries
taskSchema.index({ user: 1, completed: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task; 