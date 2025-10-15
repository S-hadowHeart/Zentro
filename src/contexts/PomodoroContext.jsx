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
    if (!isRunning) {
      setTimeLeft(isBreak ? breakDuration * 60 : focusDuration * 60);
    }
  }, [focusDuration, breakDuration, isBreak, user, isRunning]);

  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} - ${isBreak ? 'Resting' : 'Focusing'}`;
    } else {
      document.title = 'Zen Garden';
    }
    return () => { document.title = 'Zen Garden'; };
  }, [timeLeft, isRunning, isBreak]);

  const unlockAudio = useCallback(() => {
    if (isAudioUnlocked || !audioRef.current) return;
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }).catch(error => {
            console.error("Audio unlock failed initially:", error);
        });
    }
    setIsAudioUnlocked(true); // Assume unlocked after first user interaction
  }, [isAudioUnlocked]);

  // When the timer starts running, attempt to unlock the audio
  useEffect(() => {
    if (isRunning && !isAudioUnlocked) {
      unlockAudio();
    }
  }, [isRunning, isAudioUnlocked, unlockAudio]);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  }, []);

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

    try {
      const token = localStorage.getItem('token');
      await fetch('https://zentro-yerp.onrender.com/api/users/pomo-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, duration }),
      });

      const freshUser = await updateUser();

      if (status === 'completed' && freshUser && freshUser.rewards?.length > 0) {
        const randomReward = freshUser.rewards[Math.floor(Math.random() * freshUser.rewards.length)];
        setCurrentReward(randomReward);
        setShowRewardModal(true);
      } else if (status === 'interrupted' && freshUser) {
        const punishment = freshUser.punishments?.[Math.floor(Math.random() * freshUser.punishments.length)] || "No punishment found.";
        const rewardsForDebug = JSON.stringify(freshUser.rewards);
        setCurrentPunishment(`DEBUG: Rewards are: ${rewardsForDebug}. Punishment: ${punishment}`);
        setShowPunishmentModal(true);
      } else if (status === 'completed') {
        // Fallback for debugging on mobile
        const rewardsForDebug = JSON.stringify(freshUser?.rewards);
        setCurrentPunishment(`DEBUG: COMPLETED but no reward. Rewards: ${rewardsForDebug}`);
        setShowPunishmentModal(true);
      }

    } catch (error) {
      console.error('Error during pomodoro end process:', error);
    }
    setReportRefreshKey(prev => prev + 1);
  }, [user, updateUser]);

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
    unlockAudio, // Keep for any direct calls if needed
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
