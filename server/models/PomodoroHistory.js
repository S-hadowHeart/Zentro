import mongoose from 'mongoose';

const pomodoroHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: false },
  completedAt: { type: Date, default: Date.now },
  duration: { type: Number, required: true } // Duration in minutes
});

const PomodoroHistory = mongoose.model('PomodoroHistory', pomodoroHistorySchema);

export default PomodoroHistory; 