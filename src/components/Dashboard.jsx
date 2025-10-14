import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import PomodoroTimer from './PomodoroTimer';
import TaskList from './TaskList';
import Settings from './Settings';
import Report from './Report';
import RewardModal from './RewardModal';
import PunishmentModal from './PunishmentModal';
import { FaTimes } from 'react-icons/fa';
import AnimatedBackground from './ui/AnimatedBackground';

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
    <div className="flex h-screen bg-background-color text-text-color font-sans relative overflow-hidden">
      <AnimatedBackground />

      {/* Static Sidebar for desktop */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Menu (Drawer) */}
      <div
        className={`fixed inset-0 z-50 flex md:hidden transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="w-64">
          <Sidebar isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
        </div>
        <div className="flex-1 bg-black/40" onClick={() => setIsMobileMenuOpen(false)}>
          <button className="p-4 text-white">
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header for Mobile */}
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <div style={{ display: location.pathname === '/pomodoro' || location.pathname === '/' ? 'block' : 'none' }}>
              <PomodoroTimer onPomodoroEnd={handlePomodoroEnd} />
            </div>
            <div style={{ display: location.pathname === '/tasks' ? 'block' : 'none' }}>
              <TaskList />
            </div>
            <div style={{ display: location.pathname === '/settings' ? 'block' : 'none' }}>
              <Settings />
            </div>
            <div style={{ display: location.pathname === '/report' ? 'block' : 'none' }}>
              <Report key={reportRefreshKey} />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <RewardModal show={showRewardModal} onClose={closeRewardModal} reward={currentReward} />
      <PunishmentModal show={showPunishmentModal} onClose={closePunishmentModal} punishment={currentPunishment} />
    </div>
  );
}

export default Dashboard;
