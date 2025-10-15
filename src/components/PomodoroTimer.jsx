import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TasksContext';
import { FaPlay, FaPause, FaRedo, FaSeedling } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function PomodoroTimer({ onPomodoroEnd }) {
  const { user } = useAuth();
  const { tasks, incrementPomodorosForTask } = useTasks();
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const audioRef = useRef(null);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const focusDuration = user?.settings?.pomodoroDuration || 25;
  const breakDuration = user?.settings?.breakDuration || 5;

  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.load();
  }, []);

  useEffect(() => {
    setTimeLeft(isBreak ? breakDuration * 60 : focusDuration * 60);
  }, [focusDuration, breakDuration, isBreak]);

  useEffect(() => {
    const nonCompletedTasks = tasks.filter(task => !task.completed);
    if (nonCompletedTasks.length > 0 && !selectedTask) {
      setSelectedTask(nonCompletedTasks[0]._id);
    }
  }, [tasks, selectedTask]);

  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} - ${isBreak ? 'Resting' : 'Focusing'}`;
    } else {
      document.title = 'Zen Garden';
    }
    return () => { document.title = 'Zen Garden'; };
  }, [timeLeft, isRunning, isBreak]);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current && isAudioUnlocked) {
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  }, [isAudioUnlocked]);

  const showBrowserNotification = useCallback((message) => {
    if (Notification.permission === 'granted') {
      new Notification('Zen Garden', {
        body: message,
        icon: '/leaf-solid.svg',
      });
    }
  }, []);

  const handleSessionEnd = useCallback(async () => {
    const wasBreak = isBreak;
    setIsRunning(false);
    playNotificationSound();

    if (!wasBreak) {
      showBrowserNotification('Focus complete. Time to rest in the garden.');
      const durationInSeconds = focusDuration * 60;
      if(selectedTask) incrementPomodorosForTask(selectedTask, durationInSeconds);
      if (user) {
        onPomodoroEnd('completed', durationInSeconds, user.rewards, user.punishments);
      }
    } else {
      showBrowserNotification('Rest is over. Time to cultivate focus again.');
      onPomodoroEnd('breakEnded', breakDuration * 60);
    }
    
    setIsBreak(!wasBreak);

  }, [isBreak, selectedTask, focusDuration, breakDuration, user, playNotificationSound, showBrowserNotification, incrementPomodorosForTask, onPomodoroEnd]);

  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, handleSessionEnd]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const unlockAudio = () => {
    if (isAudioUnlocked) return;
    audioRef.current.muted = true;
    audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.muted = false;
        setIsAudioUnlocked(true);
    }).catch(e => console.error("Audio unlock failed:", e));
  };

  const handleStartPause = () => {
    if (!selectedTask && !isBreak) {
        alert('Please plant a seed (select a task) to begin cultivation.');
        return;
    }
    unlockAudio();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (isRunning && !isBreak) {
        const interruptedDuration = focusDuration * 60 - timeLeft;
        if (user) {
            onPomodoroEnd('interrupted', interruptedDuration, user.rewards, user.punishments);
        }
    }
    setIsRunning(false);
    setTimeLeft(isBreak ? breakDuration * 60 : focusDuration * 60);
  };

  const handleModeSwitch = () => {
    if (isRunning) return;

    if (!isBreak && timeLeft < focusDuration * 60) {
        const interruptedDuration = focusDuration * 60 - timeLeft;
        if (user) {
            onPomodoroEnd('interrupted', interruptedDuration, user.rewards, user.punishments);
        }
    }
    setIsBreak(prev => !prev);
    setIsRunning(false);
  };
  
  const progress = isBreak
    ? ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100
    : ((focusDuration * 60 - timeLeft) / (focusDuration * 60)) * 100;

    return (
      <div className="bg-zen-sand/50 dark:bg-zen-night/30 backdrop-blur-3xl rounded-[56px] shadow-2xl p-6 sm:p-10 border border-white/60 dark:border-zen-night-light/20">
          <div className="flex flex-col items-center space-y-8">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                  <div className="absolute inset-0 border-[20px] border-black/5 dark:border-white/5 rounded-full shadow-inner"></div>
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle className="text-black/10 dark:text-white/10" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                      <circle
                          className={`${isBreak ? 'text-zen-sky' : 'text-zen-green'}`}
                          strokeWidth="10"
                          strokeDasharray={2 * Math.PI * 45}
                          strokeDashoffset={(2 * Math.PI * 45) * (1 - progress / 100)}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="45" cx="50" cy="50"
                          transform="rotate(-90 50 50)"
                          style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                      />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl sm:text-7xl font-thin text-zen-charcoal dark:text-zen-sand tracking-widest">{formatTime(timeLeft)}</span>
                      <span className="text-lg font-medium text-zen-charcoal/70 dark:text-zen-sand/70 mt-3 tracking-wider">{isBreak ? 'Resting' : 'Focusing'}</span>
                  </div>
              </div>
  
              <div className="flex items-center space-x-6">
                  <button onClick={handleReset} title="Reset Cycle" className="w-20 h-20 rounded-full bg-zen-sand/60 dark:bg-zen-night/50 text-zen-charcoal/70 dark:text-zen-sand/70 flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-zen-sand/80 dark:hover:bg-zen-night/70 backdrop-blur-sm disabled:opacity-50">
                      <FaRedo className="w-6 h-6" />
                  </button>
                  <button onClick={handleStartPause} className={`w-28 h-28 rounded-full text-white font-bold flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-105 ${isRunning ? 'bg-gradient-to-br from-zen-orange to-red-500' : (isBreak ? 'bg-gradient-to-br from-zen-sky to-blue-500' : 'bg-gradient-to-br from-zen-green to-teal-500')}`}>
                      {isRunning ? <FaPause className="w-10 h-10" /> : <FaPlay className="w-10 h-10 ml-2" />}
                  </button>
                  <button onClick={handleModeSwitch} disabled={isRunning} title="Switch Mode" className="w-20 h-20 rounded-full bg-zen-sand/60 dark:bg-zen-night/50 text-zen-charcoal/70 dark:text-zen-sand/70 flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-zen-sand/80 dark:hover:bg-zen-night/70 backdrop-blur-sm disabled:opacity-50">
                      <FaSeedling className="w-6 h-6" />
                  </button>
              </div>
  
              <div className="w-full max-w-xs pt-4">
                  <select
                      id="selectTask"
                      value={selectedTask}
                      onChange={(e) => setSelectedTask(e.target.value)}
                      disabled={isRunning && !isBreak}
                      className="block w-full p-3.5 border border-black/10 dark:border-white/10 rounded-2xl shadow-inner focus:ring-2 focus:ring-zen-green dark:focus:ring-zen-green appearance-none bg-white/5 dark:bg-black/20 backdrop-blur-md pr-10 transition-all duration-300 ease-in-out text-center font-medium text-zen-charcoal dark:text-zen-sand disabled:opacity-60"
                  >
                      {tasks.filter(task => !task.completed).length === 0 ? (
                          <option value="" disabled>Plant a seed in your task list</option>
                      ) : (
                          <>
                          <option value="" disabled>Select a seed to cultivate</option>
                          {tasks.filter(task => !task.completed).map((task) => (
                              <option key={task._id} value={task._id}>{task.title}</option>
                          ))}
                          </>
                      )}
                  </select>
                  {tasks.filter(task => !task.completed).length === 0 && (
                    <p className="mt-4 text-sm text-center text-zen-charcoal/80 dark:text-zen-sand/80">
                      <Link to="/tasks" className="hover:text-zen-green dark:hover:text-zen-green-dark underline flex items-center justify-center space-x-1.5">
                        <span>Go to Task Garden</span>
                      </Link>
                    </p>
                  )}
              </div>
          </div>
      </div>
  );
}
  
export default PomodoroTimer;