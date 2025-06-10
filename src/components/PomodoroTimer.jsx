import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TasksContext';
import { FaPlay, FaPause, FaRedo, FaLeaf, FaSpinner, FaPlusCircle } from 'react-icons/fa';
import RewardModal from './RewardModal';
import PunishmentModal from './PunishmentModal';
import { Link } from 'react-router-dom';

function PomodoroTimer({ onPomodoroEnd }) {
  const { user, fetchUser, loading: authLoading } = useAuth();
  const { tasks, fetchTasks, loading: tasksLoading } = useTasks();

  // Use user settings for initial durations if available
  const initialFocusDuration = user?.settings?.pomodoroDuration || 25;
  const initialBreakDuration = user?.settings?.breakDuration || 5;

  const [focusDuration, setFocusDuration] = useState(initialFocusDuration);
  const [breakDuration, setBreakDuration] = useState(initialBreakDuration);
  const [timeLeft, setTimeLeft] = useState(initialFocusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [currentReward, setCurrentReward] = useState('');
  const [showPunishmentModal, setShowPunishmentModal] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
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

  // Effect to update time left when durations change or on initial load
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(focusDuration * 60);
    }
  }, [focusDuration, isRunning]);

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
          if (prevTimeLeft <= 0) { // Changed from 1 to 0 for precise timer end
            clearInterval(timerRef.current);
            setIsRunning(false);

            if (!isBreakRef.current) {
              handleCompleteRef.current?.(focusDurationRef.current); // Pass duration for stats
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
    // Reset time left to the current duration if not already running a session
    if (!isBreak) {
      setTimeLeft(focusDuration * 60);
    } else {
      setTimeLeft(breakDuration * 60);
    }

  }, [selectedTask, focusDuration, breakDuration, isBreak]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(focusDuration * 60);
  }, [focusDuration]);

  const progress = ((isBreak ? breakDuration * 60 : focusDuration * 60) - timeLeft) / (isBreak ? breakDuration * 60 : focusDuration * 60) * 100;

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
              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2)}% ${50 + 50 * Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2)}%)`
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
              className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition duration-300"
            >
              <FaPlay />
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition duration-300"
            >
              <FaPause />
              <span>Pause</span>
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-300 text-gray-800 rounded-full shadow-lg hover:bg-gray-400 transition duration-300"
          >
            <FaRedo />
            <span>Reset</span>
          </button>
        </div>

        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 border border-emerald-100 space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Customize Session</h3>
          
          <div>
            <label htmlFor="focusDuration" className="block text-sm font-medium text-gray-700 mb-1">Focus Duration (minutes):</label>
            <input
              type="number"
              id="focusDuration"
              value={focusDuration}
              onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 0))}
              min="1"
              max="60"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="breakDuration" className="block text-sm font-medium text-gray-700 mb-1">Break Duration (minutes):</label>
            <input
              type="number"
              id="breakDuration"
              value={breakDuration}
              onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 0))}
              min="1"
              max="30"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="selectTask" className="block text-sm font-medium text-gray-700 mb-1">Select Cultivation:</label>
            <div className="relative">
              <select
                id="selectTask"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white pr-8"
              >
                {tasks.length === 0 && (
                  <option value="">No cultivations found</option>
                )}
                {tasks.filter(task => !task.completed).map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.title}
                  </option>
                ))}
                 {tasks.filter(task => task.completed).length > 0 && (
                  <optgroup label="Completed Cultivations">
                    {tasks.filter(task => task.completed).map((task) => (
                      <option key={task._id} value={task._id} disabled>
                        {task.title} (Completed)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            {tasks.length === 0 && (
              <p className="mt-2 text-sm text-gray-500 flex items-center space-x-1">
                <span>No cultivations yet.</span>
                <Link to="/tasks" className="text-emerald-600 hover:underline flex items-center space-x-1">
                  <FaPlusCircle className="w-4 h-4" />
                  <span>Add a new one</span>
                </Link>
              </p>
            )}
          </div>
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