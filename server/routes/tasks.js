import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import { auth } from '../middleware/auth.js';
import PomodoroHistory from '../models/PomodoroHistory.js';

const router = express.Router();

// Get all tasks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new task
router.post('/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('estimatedPomodoros').optional().isInt({ min: 1 }).withMessage('Estimated Pomodoros must be a positive integer')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const task = new Task({
        user: req.user._id,
        title: req.body.title,
        dueTime: req.body.dueTime || null,
        estimatedPomodoros: req.body.estimatedPomodoros || 1 // Set estimated Pomodoros, default to 1
      });

      await task.save();
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Toggle task completion status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Increment pomodorosCompleted for a task and potentially mark as completed
router.patch('/:id/pomodoro', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.pomodorosCompleted = (task.pomodorosCompleted || 0) + 1;
    
    // Check if task goal is met to mark as completed
    if (task.estimatedPomodoros && task.pomodorosCompleted >= task.estimatedPomodoros) {
      task.completed = true;
    }

    await task.save();
    
    // Log PomodoroHistory
    const { duration } = req.body; // Get duration from request body
    await PomodoroHistory.create({ user: req.user._id, task: task._id, duration: duration || 25, completedAt: new Date() }); // Save duration, default to 25 mins
    
    res.json(task);
  } catch (error) {
    console.error('Error incrementing pomodoros for task:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 