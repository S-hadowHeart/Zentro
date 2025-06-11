import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PomodoroTimer from './PomodoroTimer';
import TaskList from './TaskList';
import Settings from './Settings';
import RewardModal from './RewardModal';
import PunishmentModal from './PunishmentModal';
import Report from './Report';
import { FaTasks, FaCog, FaChartBar, FaClock, FaLeaf, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useLocation, Link } from 'react-router-dom';

function Dashboard() {
  const { user, logout, fetchUser } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('pomodoro');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showPunishmentModal, setShowPunishmentModal] = useState(false);
  const [currentReward, setCurrentReward] = useState('');
  const [currentPunishment, setCurrentPunishment] = useState('');
  const [reportRefreshKey, setReportRefreshKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = useMemo(() => [
    { id: 'pomodoro', label: 'Zen Focus Session', icon: FaClock },
    { id: 'tasks', label: 'Cultivations', icon: FaTasks },
    { id: 'settings', label: 'Arrangements', icon: FaCog },
    { id: 'report', label: 'Growth Journal', icon: FaChartBar }
  ], []);

  useEffect(() => {
    const path = location.pathname.substring(1);
    const currentTab = tabs.find(tab => tab.id === path);
    if (currentTab) {
      setActiveTab(currentTab.id);
    } else {
      setActiveTab('pomodoro');
    }
    setIsMobileMenuOpen(false);
  }, [location.pathname, tabs]);

  const handlePomodoroEnd = useCallback(async (eventType, duration, rewards, punishments) => {
    try {
      console.log('Pomodoro ended:', { eventType, duration, rewards, punishments }); // Debug log
      
      setReportRefreshKey(prevKey => prevKey + 1);
      
      // Use the provided rewards and punishments arrays
      if (eventType === 'completed') {
        if (rewards && rewards.length > 0) {
          const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
          console.log('Showing reward:', randomReward); // Debug log
          setCurrentReward(randomReward);
        } else {
          setCurrentReward(''); // Clear reward if no reward is found
        }
      } else if (eventType === 'interrupted') {
        if (punishments && punishments.length > 0) {
          const randomPunishment = punishments[Math.floor(Math.random() * punishments.length)];
          console.log('Showing punishment:', randomPunishment); // Debug log
          setCurrentPunishment(randomPunishment);
        } else {
          setCurrentPunishment(''); // Clear punishment if no punishment is found
        }
      } else { // Handle other event types, explicitly clearing modals if not completed or interrupted
        setCurrentReward('');
        setCurrentPunishment('');
      }
    } catch (error) {
      console.error('Error in handlePomodoroEnd:', error);
    }
  }, [setReportRefreshKey, setCurrentReward, setCurrentPunishment]);

  // useEffect to manage reward modal visibility based on currentReward
  useEffect(() => {
    if (currentReward) {
      setShowRewardModal(true);
    } else {
      setShowRewardModal(false);
    }
  }, [currentReward]);

  // useEffect to manage punishment modal visibility based on currentPunishment
  useEffect(() => {
    if (currentPunishment) {
      setShowPunishmentModal(true);
    } else {
      setShowPunishmentModal(false);
    }
  }, [currentPunishment]);

  // Debug effect to monitor modal states
  useEffect(() => {
    console.log('Modal states:', { showRewardModal, showPunishmentModal, currentReward, currentPunishment });
  }, [showRewardModal, showPunishmentModal, currentReward, currentPunishment]);

  const renderNonTimerTabContent = useCallback(() => {
    switch (activeTab) {
      case 'tasks':
        return <TaskList />;
      case 'settings':
        return <Settings />;
      case 'report':
        return <Report key={reportRefreshKey} />;
      default:
        return null;
    }
  }, [activeTab, reportRefreshKey]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-32 h-32 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header/Navbar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <FaLeaf className="w-8 h-8 text-emerald-600 animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">Zen Garden</h1>
          </div>

          {/* Desktop Nav and User Info */}
          <div className="hidden md:flex items-center space-x-4">
            {user && <span className="text-gray-600 italic">Greetings, {user.username}! 🌱</span>}
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-emerald-600 transition-colors bg-white/50 backdrop-blur-sm rounded-lg hover:bg-white/80"
            >
              <FaSignOutAlt />
              <span>Leave Garden</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-emerald-600 focus:outline-none">
              {isMobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Main Tab Navigation (Desktop) */}
        <div className="hidden md:flex space-x-4 mb-6">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={`/${tab.id}`}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-white/50 backdrop-blur-sm'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`fixed inset-0 z-40 bg-white/90 backdrop-blur-lg transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
          <div className="flex justify-end p-4">
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-emerald-600 focus:outline-none">
              <FaTimes className="w-8 h-8" />
            </button>
          </div>
          <nav className="flex flex-col items-center space-y-6 pt-8">
            {tabs.map(tab => (
              <Link
                key={tab.id}
                to={`/${tab.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-2xl font-semibold flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 ease-in-out ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <tab.icon className="w-7 h-7" />
                <span>{tab.label}</span>
              </Link>
            ))}
            <button
              onClick={() => { logout(); setIsMobileMenuOpen(false); }}
              className="text-2xl font-semibold flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 ease-in-out text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <FaSignOutAlt className="w-7 h-7" />
              <span>Leave Garden</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white/50 rounded-2xl shadow-md border border-emerald-100 p-6 transform transition-all duration-300 ease-in-out hover:shadow-lg relative backdrop-blur-lg">
          <div className={`transition-all duration-300 ease-in-out ${activeTab === 'pomodoro' ? 'opacity-100 visible relative' : 'opacity-0 invisible absolute top-0 left-0 w-full'}`}>
            <PomodoroTimer onPomodoroEnd={handlePomodoroEnd} />
          </div>
          <div className={`transition-all duration-300 ease-in-out ${activeTab !== 'pomodoro' ? 'opacity-100 visible relative' : 'opacity-0 invisible absolute top-0 left-0 w-full'}`}>
            {renderNonTimerTabContent()}
          </div>
        </div>
      </main>

      {/* Modals */}
      <RewardModal
        show={showRewardModal}
        onClose={() => {
          setShowRewardModal(false);
          setCurrentReward('');
        }}
        reward={currentReward}
      />
      <PunishmentModal
        show={showPunishmentModal}
        onClose={() => {
          setShowPunishmentModal(false);
          setCurrentPunishment('');
        }}
        punishment={currentPunishment}
      />
    </div>
  );
}

export default Dashboard;