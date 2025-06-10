import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TasksContext';
import { FaPlay, FaPause, FaRedo, FaLeaf, FaSpinner } from 'react-icons/fa';
import RewardModal from './RewardModal';
import PunishmentModal from './PunishmentModal';

function PomodoroTimer({ onPomodoroEnd }) {
  const [focusDuration, setFocusDuration] = useState(25); // in minutes
  const [breakDuration, setBreakDuration] = useState(5); // in minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [currentReward, setCurrentReward] = useState(''); // To store the reward
  const [showPunishmentModal, setShowPunishmentModal] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState(''); // To store the punishment
  const [selectedTask, setSelectedTask] = useState('');
  const { user, fetchUser, loading: authLoading } = useAuth();
  const { tasks, fetchTasks, loading: tasksLoading } = useTasks();
  const timerRef = useRef(null);

  // Refs to hold the latest state values for use inside setInterval callback
  // This prevents needing state variables in useEffect dependencies if they change frequently
  const isBreakRef = useRef(isBreak);
  const focusDurationRef = useRef(focusDuration);
  const breakDurationRef = useRef(breakDuration);

  // Refs to hold the latest function and setter references for use inside setInterval callback
  const handleCompleteRef = useRef();
  const handleInterruptRef = useRef();
  const onPomodoroEndRef = useRef();
  const setIsRunningRef = useRef();
  const setIsBreakRef = useRef();

  // Consolidate all ref updates into a single effect
  useEffect(() => {
    isBreakRef.current = isBreak;
    focusDurationRef.current = focusDuration;
    breakDurationRef.current = breakDuration;
    handleCompleteRef.current = handleComplete;
    handleInterruptRef.current = handleInterrupt;
    onPomodoroEndRef.current = onPomodoroEnd;
    setIsRunningRef.current = setIsRunning;
    setIsBreakRef.current = setIsBreak;
  }, [isBreak, focusDuration, breakDuration, handleComplete, handleInterrupt, onPomodoroEnd, setIsRunning, setIsBreak]);

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
        const newSelectedTaskId = nonCompletedTasks[0]._id;
        // Only update if the value is actually different
        if (selectedTask !== newSelectedTaskId) {
          setSelectedTask(newSelectedTaskId);
        }
      } else { // No non-completed tasks
        if (selectedTask !== '') {
          setSelectedTask('');
        }
      }
    } else { // No tasks at all
      if (selectedTask !== '') {
        setSelectedTask('');
      }
    }
  }, [tasks]); // Removed selectedTask from dependencies

  // handleComplete now only manages side effects (rewards, stats, tasks)
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
      } else {
        console.error('Failed to update user stats');
      }

      if (selectedTask) {
        await incrementPomodorosForTask(selectedTask, duration);
      }
    } catch (error) {
      console.error('Error during pomodoro complete process:', error);
    }
  }, [user, selectedTask, fetchUser, incrementPomodorosForTask]);

  // handleInterrupt now only manages side effects (punishments, stats)
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
      } else {
        console.error('Failed to update user stats on interrupt');
      }
    } catch (error) {
      console.error('Error during pomodoro interrupt process:', error);
    }
  }, [user, fetchUser]);

  // This useEffect manages the countdown interval and session transitions
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft <= 1) {
            clearInterval(timerRef.current); // Stop the current interval
            setIsRunningRef.current(false); // Use ref for setIsRunning

            // Determine if it was a focus or break session that just ended
            if (!isBreakRef.current) {
              // Just finished a focus session
              if (handleCompleteRef.current) {
                handleCompleteRef.current(focusDurationRef.current); // Pass duration for side effect
              }
              setIsBreakRef.current(true); // Use ref for setIsBreak
              return breakDurationRef.current * 60; // Set time for the next session (break)
            } else {
              // Just finished a break session
              setIsBreakRef.current(false); // Use ref for setIsBreak
              if (onPomodoroEndRef.current) {
                onPomodoroEndRef.current(); // Notify Dashboard of full cycle completion
              }
              return focusDurationRef.current * 60; // Set time for the next session (focus)
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
  }, [isRunning]); // Dependencies are now truly stable (only isRunning)

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
        await fetchTasks(); // Refresh tasks after updating pomodoros
      } else {
        console.error('Failed to update task pomodoros');
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
          value={selectedTask}
          onChange={(e) => setSelectedTask(e.target.value)}
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
          {!isRunning && (timeLeft === focusDuration * 60 || timeLeft === 0) ? (
            <button
              onClick={handleStart}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <FaPlay className="w-5 h-5" />
              <span>Start Focus</span>
            </button>
          ) : isRunning ? (
            <button
              onClick={handlePause}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <FaPause className="w-5 h-5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <FaRedo className="w-5 h-5" />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={() => {
              setIsRunning(false);
              setIsBreak(false);
              setTimeLeft(focusDuration * 60);
              if (handleInterruptRef.current) {
                handleInterruptRef.current(focusDuration);
              }
            }}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <FaRedo className="w-5 h-5" />
            <span>Interrupt</span>
          </button>
        </div>
      </div>

      {!selectedTask && (
        <div className="text-center py-8 bg-white/50 rounded-lg border border-emerald-100">
          <FaLeaf className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-600">Select a cultivation to begin your focus session</p>
        </div>
      )}

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