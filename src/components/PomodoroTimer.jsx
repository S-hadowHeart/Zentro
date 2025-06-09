import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TasksContext';

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

  const handleComplete = useCallback(async () => {
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
  }, [isBreak, user.rewards, activeTaskId, focusDuration, breakDuration, onPomodoroEnd, fetchUser, fetchTasks]);

  const handleInterrupt = useCallback(async () => {
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
  }, [isBreak, user.punishments, focusDuration, onPomodoroEnd, fetchUser]);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, handleComplete]);

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(focusDuration * 60);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-zen-green mb-6">Zen Focus Session</h2>
        
        {/* Task Selection */}
        <div className="mb-6 w-full">
          <label htmlFor="task-select" className="block text-sm font-medium text-gray-700 mb-2">
            Present Cultivation
          </label>
          <select
            id="task-select"
            value={activeTaskId}
            onChange={(e) => setActiveTaskId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zen-green focus:border-transparent"
          >
            <option value="">Select a task</option>
            {tasks
              .filter(task => !task.completed)
              .map(task => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
          </select>
        </div>

        {/* Custom Timer Settings */}
        <div className="flex space-x-4 mb-4 justify-center">
          <div>
            <label htmlFor="focusDuration" className="block text-zen-green font-semibold mb-1 text-sm">Zen Duration (min)</label>
            <input
              type="number"
              id="focusDuration"
              value={focusDuration}
              onChange={(e) => setFocusDuration(Number(e.target.value))}
              min="1"
              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-zen-green focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="breakDuration" className="block text-zen-green font-semibold mb-1 text-sm">Reflection (min)</label>
            <input
              type="number"
              id="breakDuration"
              value={breakDuration}
              onChange={(e) => setBreakDuration(Number(e.target.value))}
              min="1"
              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-zen-green focus:border-transparent"
            />
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          {activeTaskId && (
            <p className="text-gray-600 mb-2">{tasks.find(task => task._id === activeTaskId)?.title}</p>
          )}
          <p className="text-7xl font-bold text-zen-green">{formatTime(timeLeft)}</p>
          <p className="text-md text-gray-600">{isBreak ? 'Reflection Time' : 'Cultivation Time'}</p>
        </div>

        {/* Controls */}
        <div className="flex space-x-4">
          {!isRunning && (
            <button
              onClick={() => setIsRunning(true)}
              disabled={!activeTaskId}
              className="px-8 py-3 bg-zen-green text-white rounded-lg font-medium text-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 shadow-md"
            >
              Begin Flow
            </button>
          )}
          {isRunning && (
            <button
              onClick={() => setIsRunning(false)}
              className="px-8 py-3 bg-zen-green text-white rounded-lg font-medium text-lg hover:bg-opacity-90 transition-colors shadow-md"
            >
              Stillness
            </button>
          )}
          <button
            onClick={() => {
              if (!isBreak) {
                handleInterrupt();
              } else {
                resetTimer();
              }
            }}
            className="px-8 py-3 bg-zen-gray text-zen-green rounded-lg font-medium text-lg hover:bg-opacity-90 transition-colors shadow-md"
          >
            Restore Calm
          </button>
        </div>

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
              <h3 className="text-2xl font-bold text-red-500 mb-4">Oops! 😅</h3>
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
    </div>
  );
}

export default PomodoroTimer; 