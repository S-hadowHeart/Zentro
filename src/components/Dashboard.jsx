import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import PomodoroTimer from './PomodoroTimer';
import TaskList from './TaskList';
import Settings from './Settings';
import Report from './Report';
import MusicPlayer from './MusicPlayer'; // Import the MusicPlayer component
import RewardModal from './RewardModal';
import PunishmentModal from './PunishmentModal';
import ZenGarden from './ui/ZenGarden';
import { FaTimes } from 'react-icons/fa';

function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showPunishmentModal, setShowPunishmentModal] = useState(false);
  const [currentReward, setCurrentReward] = useState('');
  const [currentPunishment, setCurrentPunishment] = useState('');
  const [reportRefreshKey, setReportRefreshKey] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname]);

  const handlePomodoroEnd = useCallback(async (eventType, duration, rewards, punishments) => {
    setReportRefreshKey(prevKey => prevKey + 1);

    if (eventType === 'completed' && rewards?.length > 0) {
      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
      setCurrentReward(randomReward);
      setShowRewardModal(true);
    } else if (eventType === 'interrupted' && punishments?.length > 0) {
      const randomPunishment = punishments[Math.floor(Math.random() * punishments.length)];
      setCurrentPunishment(randomPunishment);
      setShowPunishmentModal(true);
    }
  }, []);

  const closeRewardModal = () => {
    setShowRewardModal(false);
    setCurrentReward('');
  };

  const closePunishmentModal = () => {
    setShowPunishmentModal(false);
    setCurrentPunishment('');
  };

  return (
    <div className="flex h-screen text-zen-charcoal dark:text-zen-sand font-sans relative overflow-hidden">
      <ZenGarden />

      <Sidebar isMobile={false} />

      <div
        className={`fixed inset-0 z-50 flex md:hidden transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="w-64 bg-white/80 dark:bg-zen-night-dark/90 backdrop-blur-lg shadow-2xl border-r border-white/20 dark:border-zen-night-light/20">
          <Sidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
        </div>
        <div className="flex-1 bg-black/60" onClick={() => setIsMobileMenuOpen(false)}>
          <button className="p-4 text-white">
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 z-10 bg-white/10 dark:bg-zen-night/40">
          <div className="mx-auto max-w-4xl">
            {location.pathname === '/pomodoro' || location.pathname === '/' ? (
              <PomodoroTimer onPomodoroEnd={handlePomodoroEnd} />
            ) : location.pathname === '/tasks' ? (
              <TaskList />
            ) : location.pathname === '/settings' ? (
              <Settings />
            ) : (
              <Report key={reportRefreshKey} />
            )}
          </div>
        </main>
      </div>

      <MusicPlayer />
      <RewardModal show={showRewardModal} onClose={closeRewardModal} reward={currentReward} />
      <PunishmentModal show={showPunishmentModal} onClose={closePunishmentModal} punishment={currentPunishment} />
    </div>
  );
}

export default Dashboard;
