import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  rewards: [{
    type: String,
    default: []
  }],
  punishments: [{
    type: String,
    default: []
  }],
  pomodoroStats: {
    completed: {
      type: Number,
      default: 0
    },
    skipped: {
      type: Number,
      default: 0
    },
    lastReward: String,
    lastPunishment: String
  },
  settings: {
    pomodoroDuration: {
      type: Number,
      default: 25
    },
    breakDuration: {
      type: Number,
      default: 5
    },
    rewardSystemEnabled: {
      type: Boolean,
      default: true
    },
    dailyGoal: {
      type: Number,
      default: 25 // Default daily goal: 25 minutes
    }
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastStreakUpdate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User; 