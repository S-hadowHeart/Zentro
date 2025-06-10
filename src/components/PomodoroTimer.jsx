import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TasksContext';
import { FaPlay, FaPause, FaRedo, FaLeaf, FaSpinner } from 'react-icons/fa';
import RewardModal from './RewardModal';
import PunishmentModal from './PunishmentModal';

function PomodoroTimer({ onPomodoroEnd }) {
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [currentReward, setCurrentReward] = useState('');
  const [showPunishmentModal, setShowPunishmentModal] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const { user, fetchUser, loading: authLoading } = useAuth();
  const { tasks, fetchTasks, loading: tasksLoading } = useTasks();
  const timerRef = useRef(null);

  // Initialize refs with their initial values
  const isBreakRef = useRef(isBreak);
  const focusDurationRef = useRef(focusDuration);
  const breakDurationRef = useRef(breakDuration);
  const handleCompleteRef = useRef(null);
  const handleInterruptRef = useRef(null);
  const onPomodoroEndRef = useRef(onPomodoroEnd);
  const setIsRunningRef = useRef(setIsRunning);
  const setIsBreakRef = useRef(setIsBreak);

  // Update refs when values change
  useEffect(() => {
    isBreakRef.current = isBreak;
    focusDurationRef.current = focusDuration;
    breakDurationRef.current = breakDuration;
    onPomodoroEndRef.current = onPomodoroEnd;
    setIsRunningRef.current = setIsRunning;
    setIsBreakRef.current = setIsBreak;
  }, [isBreak, focusDuration, breakDuration, onPomodoroEnd, setIsRunning, setIsBreak]);

  // Initial render guard and loading display
  if (authLoading || tasksLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 min-h-[300px]">
        <FaSpinner className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-lg text-gray-700">Cultivating focus, please wait...</p>
      </div>
    );
  }

  // Effect to select a task on initial load or when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const nonCompletedTasks = tasks.filter(task => !task.completed);
      if (nonCompletedTasks.length > 0) {
        setSelectedTask(nonCompletedTasks[0]._id);
      } else {
        setSelectedTask('');
      }
    } else {
      setSelectedTask('');
    }
  }, [tasks]);

  const handleComplete = useCallback(async (duration) => {
    try {
      let randomReward = null;
      if (user?.rewards && user.rewards.length > 0) {
        randomReward = user.rewards[Math.floor(Math.random() * user.rewards.length)];
        setCurrentReward(randomReward);
        setShowRewardModal(true);
      }

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
          duration: duration
        })
      });

      if (statsResponse.ok) {
        await fetchUser(token);
      }

      if (selectedTask) {
        await incrementPomodorosForTask(selectedTask, duration);
      }
    } catch (error) {
      console.error('Error during pomodoro complete process:', error);
    }
  }, [user, selectedTask, fetchUser]);

  const handleInterrupt = useCallback(async (duration) => {
    try {
      let randomPunishment = null;
      if (user?.punishments && user.punishments.length > 0) {
        randomPunishment = user.punishments[Math.floor(Math.random() * user.punishments.length)];
        setCurrentPunishment(randomPunishment);
        setShowPunishmentModal(true);
      }

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
          duration: duration
        })
      });

      if (statsResponse.ok) {
        await fetchUser(token);
      }
    } catch (error) {
      console.error('Error during pomodoro interrupt process:', error);
    }
  }, [user, fetchUser]);

  // Update the refs for the handlers
  useEffect(() => {
    handleCompleteRef.current = handleComplete;
    handleInterruptRef.current = handleInterrupt;
  }, [handleComplete, handleInterrupt]);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);

            if (!isBreakRef.current) {
              handleCompleteRef.current?.(focusDurationRef.current);
              setIsBreak(true);
              return breakDurationRef.current * 60;
            } else {
              setIsBreak(false);
              onPomodoroEndRef.current?.();
              return focusDurationRef.current * 60;
            }
          }
          return prevTimeLeft - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const incrementPomodorosForTask = useCallback(async (taskId, duration) => {
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
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, [fetchTasks]);

  const handleStart = useCallback(() => {
    if (!selectedTask) {
      alert('Please select a cultivation to focus on');
      return;
    }
    setIsRunning(true);
    setIsBreak(false);
  }, [selectedTask]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(focusDuration * 60);
  }, [focusDuration]);

  const progress = ((focusDuration * 60 - timeLeft) / (focusDuration * 60)) * 100;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
          {isBreak ? 'Break Time' : 'Focus Session'}
        </h2>
        <p className="text-gray-600">
          {isBreak ? 'Take a moment to breathe' : 'Stay focused and cultivate your garden'}
        </p>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 rounded-full border-8 border-emerald-100"></div>
          <div
            className="absolute inset-0 rounded-full border-8 border-emerald-500"
            style={{
              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((progress / 100) * 2 * Math.PI)}% ${50 + 50 * Math.sin((progress / 100) * 2 * Math.PI)}%)`
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-emerald-600">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex space-x-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <FaPlay className="inline-block mr-2" />
              Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <FaPause className="inline-block mr-2" />
              Pause
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <FaRedo className="inline-block mr-2" />
            Reset
          </button>
        </div>
      </div>

      <RewardModal
        show={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        reward={currentReward}
      />
      <PunishmentModal
        show={showPunishmentModal}
        onClose={() => setShowPunishmentModal(false)}
        punishment={currentPunishment}
      />
    </div>
  );
}

export default PomodoroTimer; 