import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import PomodoroHistory from '../models/PomodoroHistory.js';

const router = express.Router();

// Update rewards
router.patch('/rewards',
  auth,
  [
    body('rewards').isArray(),
    body('rewards.*').isString().trim().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      req.user.rewards = req.body.rewards;
      await req.user.save();
      res.json({ rewards: req.user.rewards });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update punishments
router.patch('/punishments',
  auth,
  [
    body('punishments').isArray(),
    body('punishments.*').isString().trim().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      req.user.punishments = req.body.punishments;
      await req.user.save();
      res.json({ punishments: req.user.punishments });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update settings
router.patch('/settings',
  auth,
  [
    body('settings.pomodoroDuration').optional().isInt({ min: 1, max: 60 }),
    body('settings.breakDuration').optional().isInt({ min: 1, max: 30 }),
    body('settings.rewardSystemEnabled').optional().isBoolean(),
    body('settings.dailyGoal').optional().isInt({ min: 1 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updates = Object.keys(req.body.settings);
      updates.forEach(update => {
        req.user.settings[update] = req.body.settings[update];
      });
      console.log('Server: Before save, req.user.settings.dailyGoal:', req.user.settings.dailyGoal);
      await req.user.save();
      console.log('Server: After save, req.user.settings.dailyGoal:', req.user.settings.dailyGoal);
      res.json(req.user);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update pomodoro stats and streak logic
router.patch('/stats',
  auth,
  [
    body('completed').isBoolean(),
    body('reward').optional().isString(),
    body('punishment').optional().isString(),
    body('duration').optional().isInt({ min: 1 }) // Add duration validation
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { completed, reward, punishment, duration } = req.body;
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day in UTC

      // Log pomodoro history if completed (regardless of streak logic)
      if (completed && duration) {
        await PomodoroHistory.create({ user: req.user._id, duration: duration, completedAt: new Date() });
      }

      // Calculate total focus time for today
      const startOfDay = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      const todayFocusTimeAggregate = await PomodoroHistory.aggregate([
        { $match: { user: req.user._id, completedAt: { $gte: startOfDay } } },
        { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
      ]);
      const todayFocusTime = todayFocusTimeAggregate.length > 0 ? todayFocusTimeAggregate[0].totalDuration : 0;

      // Determine if daily goal is met
      const dailyGoalMet = todayFocusTime >= (req.user.settings.dailyGoal || 25); // Default to 25 if not set

      if (completed && dailyGoalMet) {
        // Pomodoro completed and daily goal met for today
        req.user.pomodoroStats.completed += 1;
        if (reward) {
          req.user.pomodoroStats.lastReward = reward;
        }

        if (req.user.lastStreakUpdate) {
          const lastUpdate = new Date(req.user.lastStreakUpdate);
          lastUpdate.setHours(0, 0, 0, 0);

          const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Continued streak
            req.user.currentStreak += 1;
          } else if (diffDays > 1) {
            // Streak broken, start new streak
            req.user.currentStreak = 1;
          } else {
            // Same day, streak already accounted for, do nothing
          }
        } else {
          // First completed pomodoro meeting goal, start streak
          req.user.currentStreak = 1;
        }
        req.user.lastStreakUpdate = today; // Update last streak date only if goal met

        // Update longest streak
        if (req.user.currentStreak > req.user.longestStreak) {
          req.user.longestStreak = req.user.currentStreak;
        }

      } else if (!completed) {
        // Pomodoro interrupted/skipped
        req.user.pomodoroStats.skipped += 1;
        if (punishment) {
          req.user.pomodoroStats.lastPunishment = punishment;
        }

        // Check for streak reset if interrupted/skipped
        if (req.user.lastStreakUpdate) {
          const lastUpdate = new Date(req.user.lastStreakUpdate);
          lastUpdate.setHours(0, 0, 0, 0);
          const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays >= 2) { // If it's 2 or more days since last update (goal met or not)
            req.user.currentStreak = 0;
          }
        } else {
          // If no last update and skipped, set streak to 0
          req.user.currentStreak = 0;
        }
      } else if (completed && !dailyGoalMet) {
        // Pomodoro completed but daily goal NOT met
        req.user.pomodoroStats.completed += 1; // Still count as completed session
        if (reward) {
          req.user.pomodoroStats.lastReward = reward;
        }
        
        // Check for streak reset if goal not met on a completed day
        if (req.user.lastStreakUpdate) {
          const lastUpdate = new Date(req.user.lastStreakUpdate);
          lastUpdate.setHours(0, 0, 0, 0);
          const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays >= 2) { // If it's 2 or more days since last update (goal met or not)
            req.user.currentStreak = 0;
          }
        } else {
          // If no last update and goal not met, set streak to 0
          req.user.currentStreak = 0;
        }
      }

      await req.user.save();
      res.json({
        user: req.user // Return the entire user object
      });
    } catch (error) {
      console.error('Error updating pomodoro stats and streak:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get Pomodoro stats for user
router.get('/pomodoro-stats', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())); // Start of current day in UTC
    const startOfWeek = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())); // Start of current week (Sunday) in UTC
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)); // Start of current month in UTC
    
    // Fetch total focus time for the current day for the daily goal check
    const todayFocusTimeAggregate = await PomodoroHistory.aggregate([
      { $match: { user: req.user._id, completedAt: { $gte: startOfDay } } },
      { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
    ]);
    const todayFocusTime = todayFocusTimeAggregate.length > 0 ? todayFocusTimeAggregate[0].totalDuration : 0;

    const allTimeCount = await PomodoroHistory.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
    ]);
    const dailyCount = await PomodoroHistory.aggregate([
      { $match: { user: req.user._id, completedAt: { $gte: startOfDay } } },
      { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
    ]);
    const weeklyCount = await PomodoroHistory.aggregate([
      { $match: { user: req.user._id, completedAt: { $gte: startOfWeek } } },
      { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
    ]);
    const monthlyCount = await PomodoroHistory.aggregate([
      { $match: { user: req.user._id, completedAt: { $gte: startOfMonth } } },
      { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
    ]);

    res.json({
      daily: dailyCount.length > 0 ? dailyCount[0].totalDuration : 0,
      weekly: weeklyCount.length > 0 ? weeklyCount[0].totalDuration : 0,
      monthly: monthlyCount.length > 0 ? monthlyCount[0].totalDuration : 0,
      allTime: allTimeCount.length > 0 ? allTimeCount[0].totalDuration : 0,
      currentStreak: req.user.currentStreak,
      longestStreak: req.user.longestStreak,
      dailyGoal: req.user.settings.dailyGoal || 25, // Return dailyGoal as well
      todayFocusTime: todayFocusTime // Return today's focus time
    });
  } catch (error) {
    console.error('Error fetching pomodoro stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Pomodoro daily history for the last 7 days
router.get('/pomodoro-history/daily', auth, async (req, res) => {
  try {
    const now = new Date();
    const days = 7;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - i));
      const nextDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - i + 1));
      const dailyAggregate = await PomodoroHistory.aggregate([
        { $match: { user: req.user._id, completedAt: { $gte: day, $lt: nextDay } } },
        { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
      ]);
      const count = dailyAggregate.length > 0 ? dailyAggregate[0].totalDuration : 0;
      result.push({ date: day.toISOString().slice(0, 10), count });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 