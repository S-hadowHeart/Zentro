import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TasksContext';
import { FaPlay, FaPause, FaRedo, FaLeaf } from 'react-icons/fa';

function PomodoroTimer({ onPomodoroEnd }) {
  const [focusDuration, setFocusDuration] = useState(25); // in minutes
  const [breakDuration, setBreakDuration] = useState(5); // in minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [currentReward, setCurrentReward] = useState(''); // To store the reward
  const [showPunishment, setShowPunishment] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState(''); // To store the punishment
  const [activeTaskId, setActiveTaskId] = useState('');
  const { user, fetchUser } = useAuth();
  const { tasks, fetchTasks } = useTasks();
  const timerRef = useRef(null);

  useEffect(() => {
    if (tasks.length > 0 && !activeTaskId) {
      const nonCompletedTasks = tasks.filter(task => !task.completed);
      if (nonCompletedTasks.length > 0) {
        setActiveTaskId(nonCompletedTasks[0]._id);
      }
    } else if (tasks.length === 0) {
      setActiveTaskId('');
    } else if (activeTaskId && !tasks.some(task => task._id === activeTaskId)) {
      const nonCompletedTasks = tasks.filter(task => !task.completed);
      setActiveTaskId(nonCompletedTasks.length > 0 ? nonCompletedTasks[0]._id : '');
    }
  }, [tasks, activeTaskId]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      onPomodoroEnd();
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, handleComplete, onPomodoroEnd]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const incrementPomodorosForTask = async (taskId, duration) => {
    if (!taskId) return;
    try {
      const response = await fetch(`/api/tasks/${taskId}/pomodoro`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ duration })
      });

      if (response.ok) {
        await fetchTasks(); // Refresh tasks after updating pomodoros
      } else {
        console.error('Failed to update task pomodoros');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleComplete = async () => {
    if (!isBreak) {
      try {
        const randomReward = user.rewards[Math.floor(Math.random() * user.rewards.length)];
        setCurrentReward(randomReward);
        setShowReward(true);

        const token = localStorage.getItem('token');
        if (!token) return;

        const statsResponse = await fetch('/api/users/stats', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            completed: true,
            reward: randomReward,
            duration: focusDuration
          })
        });

        if (statsResponse.ok) {
          await fetchUser(token);
        } else {
          console.error('Failed to update user stats');
        }

        if (activeTaskId) {
          await incrementPomodorosForTask(activeTaskId, focusDuration);
        }

        if (onPomodoroEnd) {
          onPomodoroEnd();
        }
      } catch (error) {
        console.error('Error during pomodoro complete process:', error);
      }
    }
    setIsBreak(!isBreak);
    setTimeLeft(isBreak ? focusDuration * 60 : breakDuration * 60);
  };

  const handleInterrupt = async () => {
    if (!isBreak) {
      try {
        const randomPunishment = user.punishments[Math.floor(Math.random() * user.punishments.length)];
        setCurrentPunishment(randomPunishment);
        setShowPunishment(true);

        const token = localStorage.getItem('token');
        if (!token) return;

        const statsResponse = await fetch('/api/users/stats', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            completed: false,
            punishment: randomPunishment,
            duration: focusDuration
          })
        });

        if (statsResponse.ok) {
          await fetchUser(token);
        } else {
          console.error('Failed to update user stats on interrupt');
        }

        if (onPomodoroEnd) {
          onPomodoroEnd();
        }
      } catch (error) {
        console.error('Error during pomodoro interrupt process:', error);
      }
    }
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(focusDuration * 60);
  };

  const handleStart = () => {
    if (!activeTaskId) {
      alert('Please select a cultivation to focus on');
      return;
    }
    setIsRunning(true);
    setIsBreak(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsBreak(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(focusDuration * 60);
  };

  const progress = ((focusDuration * 60 - timeLeft) / (focusDuration * 60)) * 100;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
          Zen Focus Session
        </h2>
        <p className="text-gray-600">Cultivate your inner peace, one moment at a time</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="relative">
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-800">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <select
          value={activeTaskId}
          onChange={(e) => setActiveTaskId(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all duration-300 ease-in-out"
        >
          <option value="">Select a cultivation to focus on...</option>
          {tasks.map((task) => (
            <option key={task._id} value={task._id}>
              {task.title}
            </option>
          ))}
        </select>

        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out flex items-center space-x-2"
            >
              <FaPlay className="w-4 h-4" />
              <span>Begin Flow</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out flex items-center space-x-2"
            >
              <FaPause className="w-4 h-4" />
              <span>Stillness</span>
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-white text-emerald-600 border border-emerald-200 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out flex items-center space-x-2"
          >
            <FaRedo className="w-4 h-4" />
            <span>Restore Calm</span>
          </button>
        </div>
      </div>

      {!activeTaskId && (
        <div className="text-center py-8 bg-white/50 rounded-lg border border-emerald-100">
          <FaLeaf className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-600">Select a cultivation to begin your focus session</p>
        </div>
      )}

      {/* Reward Modal */}
      {showReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-zen-green mb-4">Great job! 🎉</h3>
            <p className="text-gray-700 mb-6">Your reward:</p>
            <p className="text-xl font-semibold text-zen-green mb-6">
              {currentReward}
            </p>
            <button
              onClick={() => setShowReward(false)}
              className="w-full px-4 py-2 bg-zen-green text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Punishment Modal */}
      {showPunishment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-red-500 mb-4">Oops! ��</h3>
            <p className="text-gray-700 mb-6">Your punishment:</p>
            <p className="text-xl font-semibold text-red-500 mb-6">
              {currentPunishment}
            </p>
            <button
              onClick={() => setShowPunishment(false)}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              I'll do it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PomodoroTimer; 