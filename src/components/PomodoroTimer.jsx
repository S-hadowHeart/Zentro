import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TasksContext';
import { FaPlay, FaPause, FaRedo, FaLeaf, FaSpinner, FaPlusCircle, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function PomodoroTimer({ onPomodoroEnd }) {
  const { user, fetchUser, updateUser } = useAuth();
  const { tasks, fetchTasks, incrementPomodorosForTask } = useTasks();
  const [notification, setNotification] = useState(null);

  // Calculate initial timeLeft based on current user settings (now handled by useEffect)
  // const initialUserPomodoroDuration = user?.settings?.pomodoroDuration || 25;
  const [timeLeft, setTimeLeft] = useState(0); // Initialize to 0

  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const timerRef = useRef(null);

  // Current duration values derived directly from user settings
  const currentFocusDuration = user?.settings?.pomodoroDuration || 25;
  const currentBreakDuration = user?.settings?.breakDuration || 5;

  // Refs for stable callbacks and current user data
  const isBreakRef = useRef(isBreak);
  const focusDurationRef = useRef(currentFocusDuration);
  const breakDurationRef = useRef(currentBreakDuration);
  const onPomodoroEndRef = useRef(onPomodoroEnd);
  const userRef = useRef(user); // New ref for user object

  // Update refs when values change (now reacting to user.settings directly)
  useEffect(() => {
    isBreakRef.current = isBreak;
    focusDurationRef.current = currentFocusDuration;
    breakDurationRef.current = currentBreakDuration;
    onPomodoroEndRef.current = onPomodoroEnd;
    userRef.current = user; // Keep userRef updated with latest user object
  }, [isBreak, currentFocusDuration, currentBreakDuration, onPomodoroEnd, user]);

  // Effect to set initial timeLeft or update it when duration settings change
  useEffect(() => {
    // Only update timeLeft if the timer is not running and it's either 0 (initial state)
    // or explicitly matches the current focus duration (meaning it's reset or paused at full duration)
    if (!isRunning && (timeLeft === 0 || timeLeft === currentFocusDuration * 60)) {
      setTimeLeft(currentFocusDuration * 60);
    }
  }, [currentFocusDuration, isRunning]); // Rerun when focus duration changes or timer state changes to not running

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

  const handlePomodoroComplete = useCallback(async (duration) => {
    try {
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
          duration: duration
        })
      });

      if (statsResponse.ok) {
        const updatedUserStats = await statsResponse.json();
        updateUser(updatedUserStats.user);
      }

      if (selectedTask) {
        await incrementPomodorosForTask(selectedTask, duration);
      }
    } catch (error) {
      console.error('Error during pomodoro complete process:', error);
    }
  }, [selectedTask, updateUser, incrementPomodorosForTask]);

  const handlePomodoroInterrupt = useCallback(async (duration) => {
    try {
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
          duration: duration
        })
      });

      if (statsResponse.ok) {
        const updatedUserStats = await statsResponse.json();
        updateUser(updatedUserStats.user);
      }
    } catch (error) {
      console.error('Error during pomodoro interrupt process:', error);
    }
  }, [updateUser]);

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Hide after 3 seconds
  }, []);

  // Timer effect
  useEffect(() => {
    let intervalId = null;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft <= 0) {
            clearInterval(intervalId);
            
            if (!isBreakRef.current) {
              // Focus session ended - show reward first, then switch to break
              if (userRef.current?.rewards?.length > 0) {
                const randomReward = userRef.current.rewards[Math.floor(Math.random() * userRef.current.rewards.length)];
                showNotification(randomReward, 'reward');
                // Don't start break timer yet - it will start when notification is closed
                setTimeout(() => {
                  setIsBreak(true);
                  setTimeLeft(breakDurationRef.current * 60);
                  setIsRunning(false);
                }, 0);
              } else {
                // No rewards, switch to break immediately
                setTimeout(() => {
                  setIsBreak(true);
                  setTimeLeft(breakDurationRef.current * 60);
                  setIsRunning(true);
                }, 0);
              }
              
              // Update stats in background
              handlePomodoroComplete(focusDurationRef.current);
              // Call onPomodoroEnd with eventType, duration, and user's rewards/punishments
              onPomodoroEndRef.current('completed', focusDurationRef.current, userRef.current.rewards, userRef.current.punishments);
            } else {
              // Break session ended
              setTimeout(() => {
                setIsBreak(false);
                setTimeLeft(focusDurationRef.current * 60);
                setIsRunning(false);
              }, 0);
              // Call onPomodoroEnd for break session end if needed, though usually not for rewards/punishments
              onPomodoroEndRef.current('breakEnded', breakDurationRef.current);
            }
            return 0;
          }
          return prevTimeLeft - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, handlePomodoroComplete]);

  const handleNotificationClose = useCallback(() => {
    setNotification(null);
    // Start the break timer after notification is closed
    if (isBreakRef.current) {
      setIsRunning(true);
    }
  }, []);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = useCallback(() => {
    if (!selectedTask) {
      alert('Please select a cultivation to focus on');
      return;
    }
    // This function is strictly for starting a *new* session from full time.
    setTimeLeft(currentFocusDuration * 60); // Reset to full duration
    setIsRunning(true);
  }, [selectedTask, currentFocusDuration]);

  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const handleReset = useCallback(async () => {
    // If a focus session was running and is being reset, treat it as interrupted
    if (isRunning && !isBreak && timeLeft > 0) {
      const interruptedDuration = currentFocusDuration * 60 - timeLeft; // Use currentFocusDuration
      await handlePomodoroInterrupt(interruptedDuration);
      onPomodoroEndRef.current('interrupted', interruptedDuration, userRef.current.rewards, userRef.current.punishments);
    }
    // Stop the timer
    setIsRunning(false);
    // Reset to initial state, reflecting current settings
    setIsBreak(false);
    setTimeLeft(currentFocusDuration * 60); // Use currentFocusDuration
  }, [isRunning, isBreak, timeLeft, currentFocusDuration, handlePomodoroInterrupt, userRef.current.rewards, userRef.current.punishments]);

  // Calculate progress based on current mode (focus or break)
  const progress = isBreak 
    ? ((currentBreakDuration * 60 - timeLeft) / (currentBreakDuration * 60)) * 100
    : ((currentFocusDuration * 60 - timeLeft) / (currentFocusDuration * 60)) * 100;

  return (
    <div className="space-y-8">
      {/* Simple Notification */}
      {notification && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setNotification(null)}></div>
          <div className={`relative p-8 rounded-xl shadow-2xl transform transition-all duration-300 ease-in-out ${
            notification.type === 'reward' ? 'bg-emerald-500' : 'bg-red-500'
          } text-white max-w-md w-full mx-4`}>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">
                {notification.type === 'reward' ? '🎉 Achievement Unlocked!' : 'Time for Reflection'}
              </h3>
              <p className="text-xl mb-6">{notification.message}</p>
              <button 
                onClick={handleNotificationClose}
                className="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-semibold transition-all duration-300"
              >
                Cherish
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
          {isBreak ? 'Rejuvenation Time' : 'Cultivation Session'}
        </h2>
        <p className="text-gray-600">
          {isBreak ? 'Take a moment to breathe and restore your energy' : 'Stay focused and cultivate your garden'}
        </p>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="text-emerald-100"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="46"
              cx="50"
              cy="50"
            />
            {/* Progress circle */}
            <circle
              className="text-emerald-500 transform -rotate-90 origin-center"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="46"
              cx="50"
              cy="50"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-emerald-600">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex space-x-4">
          {!isRunning && timeLeft === currentFocusDuration * 60 ? (
            <button
              onClick={handleStart}
              className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition duration-300"
            >
              <FaPlay />
              <span>Begin Cultivation</span>
            </button>
          ) : !isRunning && timeLeft < currentFocusDuration * 60 ? (
            <button
              onClick={toggleTimer}
              className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition duration-300"
            >
              <FaPlay />
              <span>Resume Rhythm</span>
            </button>
          ) : (
            <button
              onClick={toggleTimer}
              className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition duration-300"
            >
              <FaPause />
              <span>Pause Rhythm</span>
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-300 text-gray-800 rounded-full shadow-lg hover:bg-gray-400 transition duration-300"
          >
            <FaRedo />
            <span>Reset Cycle</span>
          </button>
        </div>

        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 border border-emerald-100 space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Adjust Rhythm</h3>
          
          <div>
            <label htmlFor="selectTask" className="block text-sm font-medium text-gray-700 mb-1">Select Cultivation:</label>
            <div className="relative">
              <select
                id="selectTask"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white pr-8"
              >
                {tasks.filter(task => !task.completed).length === 0 && (
                  <option value="">No unharvested cultivations</option>
                )}
                {tasks.filter(task => !task.completed).map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            {tasks.filter(task => !task.completed).length === 0 && (
              <p className="mt-2 text-sm text-gray-500 flex items-center space-x-1">
                <span>All cultivations harvested.</span>
                <Link to="/tasks" className="text-emerald-600 hover:underline flex items-center space-x-1">
                  <FaPlusCircle className="w-4 h-4" />
                  <span>Plant a new seed</span>
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PomodoroTimer; 