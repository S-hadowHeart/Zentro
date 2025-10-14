import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TasksContext';
import { FaPlay, FaPause, FaRedo, FaLeaf, FaSpinner, FaPlusCircle, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function PomodoroTimer({ onPomodoroEnd }) {
  const { user, fetchUser, updateUser } = useAuth();
  const { tasks, fetchTasks, incrementPomodorosForTask } = useTasks();
  const [notification, setNotification] = useState(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const timerRef = useRef(null);

  const currentFocusDuration = user?.settings?.pomodoroDuration || 25;
  const currentBreakDuration = user?.settings?.breakDuration || 5;

  const isBreakRef = useRef(isBreak);
  const focusDurationRef = useRef(currentFocusDuration);
  const breakDurationRef = useRef(currentBreakDuration);
  const onPomodoroEndRef = useRef(onPomodoroEnd);
  const userRef = useRef(user);

  useEffect(() => {
    isBreakRef.current = isBreak;
    focusDurationRef.current = currentFocusDuration;
    breakDurationRef.current = currentBreakDuration;
    onPomodoroEndRef.current = onPomodoroEnd;
    userRef.current = user;
  }, [isBreak, currentFocusDuration, currentBreakDuration, onPomodoroEnd, user]);

  useEffect(() => {
    if (!isRunning && (timeLeft === 0 || timeLeft === currentFocusDuration * 60)) {
      setTimeLeft(currentFocusDuration * 60);
    }
  }, [currentFocusDuration, isRunning]);

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
    setTimeout(() => setNotification(null), 3000);
  }, []);

  useEffect(() => {
    let intervalId = null;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft <= 0) {
            clearInterval(intervalId);
            
            if (!isBreakRef.current) {
              if (userRef.current?.rewards?.length > 0) {
                const randomReward = userRef.current.rewards[Math.floor(Math.random() * userRef.current.rewards.length)];
                showNotification(randomReward, 'reward');
                setIsBreak(true);
                setTimeLeft(breakDurationRef.current * 60);
                setIsRunning(false);
              } else {
                setIsBreak(true);
                setTimeLeft(breakDurationRef.current * 60);
                setIsRunning(false);
              }
              
              handlePomodoroComplete(focusDurationRef.current);
              onPomodoroEndRef.current('completed', focusDurationRef.current, userRef.current.rewards, userRef.current.punishments);
            } else {
              setIsBreak(false);
              setTimeLeft(focusDurationRef.current * 60);
              setIsRunning(false);
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
      showNotification('Please select a cultivation to focus on, Gardener.', 'info');
      return;
    }
    if (!isBreak) {
      setTimeLeft(currentFocusDuration * 60);
    } else {
      setTimeLeft(currentBreakDuration * 60);
    }
    setIsRunning(true);
  }, [selectedTask, currentFocusDuration, currentBreakDuration, isBreak, showNotification]);

  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const handleReset = useCallback(async () => {
    if (isRunning && !isBreak && timeLeft > 0) {
      const interruptedDuration = currentFocusDuration * 60 - timeLeft;
      await handlePomodoroInterrupt(interruptedDuration);
      onPomodoroEndRef.current('interrupted', interruptedDuration, userRef.current.rewards, userRef.current.punishments);
    }
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(currentFocusDuration * 60);
  }, [isRunning, isBreak, timeLeft, currentFocusDuration, handlePomodoroInterrupt, userRef.current.rewards, userRef.current.punishments]);

  const progress = isBreak 
    ? ((currentBreakDuration * 60 - timeLeft) / (currentBreakDuration * 60)) * 100
    : ((currentFocusDuration * 60 - timeLeft) / (currentFocusDuration * 60)) * 100;

  return (
    <div className="space-y-4 sm:space-y-8 flex flex-col items-center">
      {notification && (
        <div className={`fixed top-8 left-8 p-4 rounded-lg shadow-xl flex items-center space-x-3 z-50 transition-all duration-300 ease-out transform
          ${notification.type === 'reward' ? 'bg-accent text-white' : notification.type === 'punishment' ? 'bg-danger text-white' : 'bg-primary text-white'}`}>
          <span>{notification.message}</span>
          <button onClick={handleNotificationClose} className="ml-2 text-white/80 hover:text-white focus:outline-none">
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="bg-white/50 backdrop-blur-sm p-4 sm:p-8 rounded-3xl shadow-2xl border border-secondary-light space-y-6 flex flex-col items-center">
        <div className={`relative w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ease-in-out
          ${isBreak ? 'bg-secondary-light/70 border-secondary-light ring-4 ring-secondary' : 'bg-primary-light/70 border-primary-light ring-4 ring-primary'} border-4 
          `}>
          <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 100">
            <circle
              className={`${isBreak ? 'text-secondary-light' : 'text-primary-light'}`}
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            <circle
              className={`${isBreak ? 'text-secondary' : 'text-primary'} transition-all duration-700 ease-out`}
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
          <div className={`absolute text-6xl font-extrabold ${isBreak ? 'text-secondary-dark' : 'text-primary-dark'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="text-center text-text-light text-xl font-medium animate-fade-in">
          {isBreak ? 'Take a moment to breathe and rejuvenate your spirit' : selectedTask ? `Cultivating focus on: ${tasks.find(task => task._id === selectedTask)?.title || ''}` : 'Select a cultivation to begin your mindful journey'}
        </div>

        <div className="flex space-x-6 w-full max-w-md">
          {!isRunning ? (
            isBreak ? (
              timeLeft === currentBreakDuration * 60 ? (
                <button
                  onClick={handleStart}
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary text-white font-bold rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center space-x-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-secondary-light"
                >
                  <FaPlay className="text-lg sm:text-xl" />
                  <span>Begin Rejuvenation</span>
                </button>
              ) : (
                <button
                  onClick={toggleTimer}
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary text-white font-bold rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center space-x-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-secondary-light"
                >
                  <FaPlay className="text-lg sm:text-xl" />
                  <span>Resume Rejuvenation</span>
                </button>
              )
            ) : (
              timeLeft === currentFocusDuration * 60 ? (
                <button
                  onClick={handleStart}
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center space-x-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-primary-light"
                >
                  <FaPlay className="text-lg sm:text-xl" />
                  <span>Begin Cultivation</span>
                </button>
              ) : (
                <button
                  onClick={toggleTimer}
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center space-x-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-primary-light"
                >
                  <FaPlay className="text-lg sm:text-xl" />
                  <span>Resume Cultivation</span>
                </button>
              )
            )
          ) : (
            <button
              onClick={toggleTimer}
              className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-accent to-accent-dark hover:from-accent-dark hover:to-accent text-white font-bold rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center space-x-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-accent-light"
            >
              <FaPause className="text-lg sm:text-xl" />
              <span>Pause</span>
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center space-x-2 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            <FaRedo className="text-lg sm:text-xl" />
            <span>Reset Cycle</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl shadow-lg border border-primary-light p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-text-color mb-4">Select Your Path</h3>
        
        <div>
          <label htmlFor="selectTask" className="block text-sm font-medium text-text-light mb-1">Choose Your Cultivation:</label>
          <div className="relative">
            <select
              id="selectTask"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="block w-full p-3 border border-secondary rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white/90 backdrop-blur-sm pr-8 transition-all duration-300 ease-in-out"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-light">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          {tasks.filter(task => !task.completed).length === 0 && (
            <p className="mt-2 text-sm text-text-light flex items-center space-x-1">
              <span>All cultivations harvested.</span>
              <Link to="/tasks" className="text-primary hover:underline flex items-center space-x-1">
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
