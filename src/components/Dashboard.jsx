import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PomodoroTimer from './PomodoroTimer';
import TaskList from './TaskList';
import Settings from './Settings';
import RewardModal from './RewardModal';
import PunishmentModal from './PunishmentModal';
import Report from './Report';
import { FaTasks, FaCog, FaChartBar, FaClock, FaLeaf, FaSignOutAlt } from 'react-icons/fa';
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <FaLeaf className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-800">Zen Garden</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <FaSignOutAlt />
            <span>Depart the Garden</span>
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={`/${tab.id}`}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-emerald-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6 transform transition-all duration-300 ease-in-out hover:shadow-2xl relative">
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
          setCurrentReward(''); // Clear reward when closing
        }}
        reward={currentReward}
      />
      <PunishmentModal
        show={showPunishmentModal}
        onClose={() => {
          setShowPunishmentModal(false);
          setCurrentPunishment(''); // Clear punishment when closing
        }}
        punishment={currentPunishment}
      />
    </div>
  );
}

export default Dashboard;