import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useTasks } from './TasksContext';

const PomodoroContext = createContext();

export const usePomodoro = () => useContext(PomodoroContext);

export const PomodoroProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const { incrementPomodorosForTask } = useTasks();

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');

  // Audio and notifications
  const audioRef = useRef(null);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  // Modals state
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showPunishmentModal, setShowPunishmentModal] = useState(false);
  const [currentReward, setCurrentReward] = useState('');
  const [currentPunishment, setCurrentPunishment] = useState('');
  const [reportRefreshKey, setReportRefreshKey] = useState(0);

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
    if (!isRunning && timeLeft === 0) {
      setTimeLeft(isBreak ? breakDuration * 60 : focusDuration * 60);
    }
  }, [focusDuration, breakDuration, isBreak, isRunning, timeLeft]);

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

  const onPomodoroEnd = useCallback(async (status, duration) => {
    if (!user) return;
    
    setReportRefreshKey(prev => prev + 1);

    if (status === 'completed' && user.rewards?.length > 0) {
        const randomReward = user.rewards[Math.floor(Math.random() * user.rewards.length)];
        setCurrentReward(randomReward);
        setShowRewardModal(true);
    } else if (status === 'interrupted' && user.punishments?.length > 0) {
        const randomPunishment = user.punishments[Math.floor(Math.random() * user.punishments.length)];
        setCurrentPunishment(randomPunishment);
        setShowPunishmentModal(true);
    }

    try {
        const token = localStorage.getItem('token');
        await fetch('/api/users/pomo-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, duration })
        });
    } catch (error) {
        console.error('Error updating session:', error);
    }
  }, [user]);

  const handleSessionEnd = useCallback(async () => {
    const wasBreak = isBreak;
    setIsRunning(false);
    playNotificationSound();
  
    if (!wasBreak) {
      showBrowserNotification('Focus complete. Time to rest in the garden.');
      const durationInSeconds = focusDuration * 60;
      if(selectedTask) incrementPomodorosForTask(selectedTask, durationInSeconds);
      onPomodoroEnd('completed', durationInSeconds);
    } else {
      showBrowserNotification('Rest is over. Time to cultivate focus again.');
      onPomodoroEnd('breakEnded', breakDuration * 60);
    }
    
    setIsBreak(prev => !prev); 
  
  }, [isBreak, selectedTask, focusDuration, breakDuration, playNotificationSound, showBrowserNotification, incrementPomodorosForTask, onPomodoroEnd]);

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

  const closeRewardModal = () => {
    setShowRewardModal(false);
    setCurrentReward('');
  };

  const closePunishmentModal = () => {
    setShowPunishmentModal(false);
    setCurrentPunishment('');
  };

  const value = {
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    isBreak,
    setIsBreak,
    selectedTask,
    setSelectedTask,
    focusDuration,
    breakDuration,
    formatTime,
    unlockAudio,
    onPomodoroEnd,
    showRewardModal,
    closeRewardModal,
    currentReward,
    showPunishmentModal,
    closePunishmentModal,
    currentPunishment,
    reportRefreshKey
  };

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
};