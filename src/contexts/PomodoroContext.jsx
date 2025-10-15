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
  const [sessionCount, setSessionCount] = useState(0); // Used to reset timer only when a session ends
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

  // This effect now correctly resets the timer only when a new session starts.
  useEffect(() => {
    setTimeLeft(isBreak ? breakDuration * 60 : focusDuration * 60);
  }, [focusDuration, breakDuration, isBreak, sessionCount]);

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
    setIsAudioUnlocked(true);
  }, [isAudioUnlocked]);

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

  // This function now returns a boolean indicating if a reward was shown.
  const onPomodoroEnd = useCallback(async (status, duration) => {
    if (!user) return false;

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
        setReportRefreshKey(prev => prev + 1);
        return true; // Indicate that a reward is being shown.
      } else if (status === 'interrupted' && freshUser && freshUser.punishments?.length > 0) {
        const randomPunishment = freshUser.punishments[Math.floor(Math.random() * freshUser.punishments.length)];
        setCurrentPunishment(randomPunishment);
        setShowPunishmentModal(true);
      }
    } catch (error) {
      console.error('Error during pomodoro end process:', error);
    }
    setReportRefreshKey(prev => prev + 1);
    return false;
  }, [user, updateUser]);

  const handleSessionEnd = useCallback(async () => {
    const wasBreak = isBreak;
    setIsRunning(false);
    playNotificationSound();

    if (!wasBreak) {
      showBrowserNotification('Focus complete. Time to rest in the garden.');
      const durationInSeconds = focusDuration * 60;
      if (selectedTask) incrementPomodorosForTask(selectedTask, durationInSeconds);
      const rewardWasShown = await onPomodoroEnd('completed', durationInSeconds);

      // If a reward is shown, we wait. The break will start when the modal is closed.
      // Otherwise, start the break immediately.
      if (!rewardWasShown) {
        setIsBreak(true);
        setSessionCount(c => c + 1);
      }
    } else {
      showBrowserNotification('Rest is over. Time to cultivate focus again.');
      await onPomodoroEnd('breakEnded', breakDuration * 60);
      setIsBreak(false);
      setSessionCount(c => c + 1);
    }
  }, [isBreak, selectedTask, focusDuration, playNotificationSound, showBrowserNotification, incrementPomodorosForTask, onPomodoroEnd]);

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
    // Now that the modal is closed, we start the break.
    setIsBreak(true);
    setSessionCount(c => c + 1);
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