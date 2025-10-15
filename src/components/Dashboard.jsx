import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import PomodoroTimer from './PomodoroTimer';
import TaskList from './TaskList';
import Settings from './Settings';
import Report from './Report';
import MusicPlayer from './MusicPlayer';
import ZenGarden from './ui/ZenGarden';
import { FaTimes } from 'react-icons/fa';

function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const handleCloseMobileMenu = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex h-screen text-zen-charcoal dark:text-zen-sand font-sans relative bg-white dark:bg-zen-night">
      <ZenGarden />

      <Sidebar isMobile={false} onLinkClick={handleCloseMobileMenu} />

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 flex md:hidden transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="w-64 bg-white/80 dark:bg-zen-night-dark/90 backdrop-blur-lg shadow-2xl border-r border-white/20 dark:border-zen-night-light/20">
          <Sidebar isMobile onLinkClick={handleCloseMobileMenu} />
        </div>
        <div className="flex-1 bg-black/60" onClick={handleToggleMobileMenu}>
          <button className="p-4 text-white">
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={handleToggleMobileMenu} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 z-10">
          <div className="mx-auto max-w-4xl">
            <Routes>
              <Route path="/" element={<PomodoroTimer />} />
              <Route path="/pomodoro" element={<PomodoroTimer />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/report" element={<Report />} />
            </Routes>
          </div>
        </main>
      </div>

      <MusicPlayer />
    </div>
  );
}

export default Dashboard;
