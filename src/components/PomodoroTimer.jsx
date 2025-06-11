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
                setIsBreak(true);
                setTimeLeft(breakDurationRef.current * 60);
                setIsRunning(false); // Ensure break doesn't start until Cherish click
              } else {
                // No rewards, switch to break, but still wait for Cherish click
                setIsBreak(true);
                setTimeLeft(breakDurationRef.current * 60);
                setIsRunning(false); // Ensure break doesn't start until Cherish click
              }
              
              // Update stats in background
              handlePomodoroComplete(focusDurationRef.current);
              // Call onPomodoroEnd with eventType, duration, and user's rewards/punishments
              onPomodoroEndRef.current('completed', focusDurationRef.current, userRef.current.rewards, userRef.current.punishments);
            } else {
              // Break session ended
              setIsBreak(false);
              setTimeLeft(focusDurationRef.current * 60);
              setIsRunning(false);
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
    if (isBreak) {
      setIsRunning(true);
    }
  }, [isBreak]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = useCallback(() => {
    if (!selectedTask && !isBreak) {
      alert('Please select a cultivation to focus on');
      return;
    }
    // This function is strictly for starting a *new* session from full time.
    if (!isBreak) {
      setTimeLeft(currentFocusDuration * 60); // Reset to full duration for cultivation
    } else {
      setTimeLeft(currentBreakDuration * 60); // Reset to full duration for rejuvenation
    }
    setIsRunning(true);
  }, [selectedTask, currentFocusDuration, currentBreakDuration, isBreak]);

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
    setTimeLeft(currentFocusDuration * 60); // Reset to focus duration
  }, [isRunning, isBreak, timeLeft, currentFocusDuration, handlePomodoroInterrupt, userRef.current.rewards, userRef.current.punishments]);

  // Calculate progress based on current mode (focus or break)
  const progress = isBreak 
    ? ((currentBreakDuration * 60 - timeLeft) / (currentBreakDuration * 60)) * 100
    : ((currentFocusDuration * 60 - timeLeft) / (currentFocusDuration * 60)) * 100;

  return (
    <div className="space-y-8 flex flex-col items-center">
      <div className="bg-white/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-emerald-100 space-y-6 flex flex-col items-center">
        {/* Main Timer Display */}
        <div className={`relative w-72 h-72 mx-auto rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ease-in-out
          ${isBreak ? 'bg-lime-100/70 border-lime-300 ring-4 ring-lime-200' : 'bg-emerald-100/70 border-emerald-300 ring-4 ring-emerald-200'} border-4 
          `}>
          <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 100">
            <circle
              className={`${isBreak ? 'text-lime-200' : 'text-emerald-200'}`}
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            <circle
              className={`${isBreak ? 'text-lime-500' : 'text-emerald-500'} transition-all duration-700 ease-out`}
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={2 * Math.PI * 45 * (100 - progress) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className={`absolute text-6xl font-extrabold ${isBreak ? 'text-lime-700' : 'text-emerald-700'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="text-center text-gray-700 text-xl font-medium animate-fade-in">
          {isBreak ? 'Take a moment to breathe and rejuvenate your spirit' : selectedTask ? `Cultivating focus on: ${tasks.find(task => task._id === selectedTask)?.title || ''}` : 'Select a cultivation to begin your mindful journey'}
        </div>

        <div className="flex space-x-6 w-full max-w-md">
          {!isRunning ? (
            isBreak ? (
              timeLeft === currentBreakDuration * 60 ? (
                <button
                  onClick={handleStart}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-white font-bold rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center space-x-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-lime-300"
                >
                  <FaPlay className="text-xl" />
                  <span>Begin Rejuvenation</span>
                </button>
              ) : (
                <button
                  onClick={toggleTimer}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-white font-bold rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center space-x-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-lime-300"
                >
                  <FaPlay className="text-xl" />
                  <span>Resume Rejuvenation</span>
                </button>
              )
            ) : (
              timeLeft === currentFocusDuration * 60 ? (
                <button
                  onClick={handleStart}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center space-x-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                >
                  <FaPlay className="text-xl" />
                  <span>Begin Cultivation</span>
                </button>
              ) : (
                <button
                  onClick={toggleTimer}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center space-x-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                >
                  <FaPlay className="text-xl" />
                  <span>Resume Cultivation</span>
                </button>
              )
            )
          ) : (
            <button
              onClick={toggleTimer}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center space-x-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-amber-300"
            >
              <FaPause className="text-xl" />
              <span>Pause Meditation</span>
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-stone-400 to-stone-500 hover:from-stone-500 hover:to-stone-600 text-white font-bold rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center space-x-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-stone-300"
          >
            <FaRedo className="text-xl" />
            <span>Reset Cycle</span>
          </button>
        </div>
      </div>

      {/* Task Selection */}
      <div className="rounded-xl shadow-lg border border-emerald-100 p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Your Path</h3>
        
        <div>
          <label htmlFor="selectTask" className="block text-sm font-medium text-gray-700 mb-1">Choose Your Cultivation:</label>
          <div className="relative">
            <select
              id="selectTask"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="block w-full p-3 border border-emerald-200 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white/90 backdrop-blur-sm pr-8 transition-all duration-300 ease-in-out"
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
  );
}

export default PomodoroTimer; 