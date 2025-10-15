import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TasksContext';
import { FaPlay, FaPause, FaRedo, FaPlusCircle, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function PomodoroTimer({ onPomodoroEnd }) {
  const { user, updateUser } = useAuth();
  const { tasks, incrementPomodorosForTask } = useTasks();
  const [notification, setNotification] = useState(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const timerRef = useRef(null);

  const currentFocusDuration = user?.settings?.pomodoroDuration || 25;
  const currentBreakDuration = user?.settings?.breakDuration || 5;

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(isBreak ? currentBreakDuration * 60 : currentFocusDuration * 60);
    }
  }, [currentFocusDuration, currentBreakDuration, isBreak, isRunning]);

  useEffect(() => {
    if (tasks.length > 0) {
      const nonCompletedTasks = tasks.filter(task => !task.completed);
      if (nonCompletedTasks.length > 0 && !selectedTask) {
        setSelectedTask(nonCompletedTasks[0]._id);
      }
    }
  }, [tasks, selectedTask]);

  const handlePomodoroComplete = useCallback(async (duration) => {
    // ... (rest of the function is unchanged)
  }, [selectedTask, updateUser, incrementPomodorosForTask]);

  const handlePomodoroInterrupt = useCallback(async (duration) => {
    // ... (rest of the function is unchanged)
  }, [updateUser]);

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          const wasBreak = isBreak;
          setIsBreak(!wasBreak);
          setIsRunning(false);

          if (!wasBreak) {
            handlePomodoroComplete(currentFocusDuration);
            onPomodoroEnd('completed', currentFocusDuration, user.rewards, user.punishments);
          } else {
            onPomodoroEnd('breakEnded', currentBreakDuration);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, isBreak, currentFocusDuration, currentBreakDuration, handlePomodoroComplete, onPomodoroEnd, user]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (!selectedTask && !isBreak) {
      showNotification('Please select a task to focus on.', 'info');
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = async () => {
    if (isRunning && !isBreak) {
      const interruptedDuration = currentFocusDuration * 60 - timeLeft;
      await handlePomodoroInterrupt(interruptedDuration);
      onPomodoroEnd('interrupted', interruptedDuration, user.rewards, user.punishments);
    }
    setIsRunning(false);
    setIsBreak(false);
  };

  const progress = isBreak
    ? ((currentBreakDuration * 60 - timeLeft) / (currentBreakDuration * 60)) * 100
    : ((currentFocusDuration * 60 - timeLeft) / (currentFocusDuration * 60)) * 100;

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/30 dark:border-gray-700/50">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative w-60 h-60 sm:w-72 sm:h-72">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            <circle
              className={`${isBreak ? 'text-secondary' : 'text-primary'}`}
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={(2 * Math.PI * 45) * (1 - progress / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-extrabold text-gray-800 dark:text-gray-100">{formatTime(timeLeft)}</span>
            <span className="text-lg font-medium text-gray-500 dark:text-gray-400 mt-1">{isBreak ? 'Resting' : 'Focusing'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleStartPause}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full text-white font-bold flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105 ${isRunning ? 'bg-accent dark:bg-accent-dark' : (isBreak ? 'bg-secondary dark:bg-secondary-dark' : 'bg-primary dark:bg-primary-dark')}`}>
            {isRunning ? <FaPause className="w-8 h-8" /> : <FaPlay className="w-8 h-8" />}
          </button>
          <button
            onClick={handleReset}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-300/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center shadow-md transform transition-all duration-300 hover:scale-105">
            <FaRedo className="w-6 h-6" />
          </button>
        </div>

        <div className="w-full max-w-sm pt-4">
            <label htmlFor="selectTask" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 text-center">Current Cultivation:</label>
            <div className="relative">
                <select
                    id="selectTask"
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark appearance-none bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm pr-10 transition-all duration-300 ease-in-out text-center font-semibold"
                >
                    {tasks.filter(task => !task.completed).length === 0 ? (
                        <option value="">No cultivations to harvest</option>
                    ) : tasks.filter(task => !task.completed).map((task) => (
                        <option key={task._id} value={task._id}>{task.title}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
            {tasks.filter(task => !task.completed).length === 0 && (
              <p className="mt-3 text-sm text-center text-gray-500 dark:text-gray-400">
                <Link to="/tasks" className="text-primary dark:text-primary-light hover:underline flex items-center justify-center space-x-1.5">
                  <FaPlusCircle />
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
