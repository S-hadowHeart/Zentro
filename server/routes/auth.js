import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register',
  [
    body('username').trim().isLength({ min: 3 }).escape(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Create new user
      const user = new User({
        username,
        password,
        rewards: [
          'Watch 1 anime episode',
          'Read 3 manga chapters',
          'Enjoy a hot cup of tea',
          'Take a 15-min walk',
          'Listen to your favorite song',
          'Learn a new word',
          'Do 5 min stretching',
          'Meditate for 5 minutes'
        ],
        punishments: [
          'Do 10 push-ups',
          'Cold face splash',
          'Clean your desk for 5 minutes',
          'Organize 5 files',
          'Drink a glass of water',
          'Write down 3 things you are grateful for'
        ]
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          rewards: user.rewards,
          punishments: user.punishments,
          settings: {
            pomodoroDuration: user.settings.pomodoroDuration,
            breakDuration: user.settings.breakDuration,
            rewardSystemEnabled: user.settings.rewardSystemEnabled,
            dailyGoal: user.settings.dailyGoal
          }
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login
router.post('/login',
  [
    body('username').trim().escape(),
    body('password').exists()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      // Find user
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          rewards: user.rewards,
          punishments: user.punishments,
          settings: {
            pomodoroDuration: user.settings.pomodoroDuration,
            breakDuration: user.settings.breakDuration,
            rewardSystemEnabled: user.settings.rewardSystemEnabled,
            dailyGoal: user.settings.dailyGoal
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Server /me: req.user.settings.dailyGoal before sending:', req.user.settings.dailyGoal);
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        rewards: req.user.rewards || [],
        punishments: req.user.punishments || [],
        settings: {
          pomodoroDuration: req.user.settings?.pomodoroDuration ?? 25,
          breakDuration: req.user.settings?.breakDuration ?? 5,
          rewardSystemEnabled: req.user.settings?.rewardSystemEnabled ?? true,
          dailyGoal: req.user.settings?.dailyGoal ?? 0
        },
        pomodoroStats: req.user.pomodoroStats || { completed: 0, interrupted: 0, totalDuration: 0 },
        currentStreak: req.user.currentStreak ?? 0,
        longestStreak: req.user.longestStreak ?? 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 