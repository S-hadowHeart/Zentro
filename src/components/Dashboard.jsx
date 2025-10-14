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

  const renderContent = () => {
    switch (location.pathname) {
      case '/pomodoro':
        return <PomodoroTimer onPomodoroEnd={handlePomodoroEnd} />;
      case '/tasks':
        return <TaskList />;
      case '/settings':
        return <Settings />;
      case '/report':
        return <Report key={reportRefreshKey} />;
      default:
        return <PomodoroTimer onPomodoroEnd={handlePomodoroEnd} />;
    }
  };

  return (
    <div className="flex h-screen bg-background-color text-text-color font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 left-20 w-48 h-48 bg-secondary/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
        <div className="absolute top-60 right-20 w-48 h-48 bg-primary/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-48 h-48 bg-accent/50 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

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
            {renderContent()}
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
