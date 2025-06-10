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
    { id: 'pomodoro', label: 'Zen Focus Session', icon: FaLeaf },
    { id: 'tasks', label: 'Cultivations', icon: FaLeaf },
    { id: 'settings', label: 'Arrangements', icon: FaLeaf },
    { id: 'report', label: 'Growth Journal', icon: FaLeaf }
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

  const handlePomodoroEnd = useCallback(async (eventType, duration) => {
    setReportRefreshKey(prevKey => prevKey + 1);
    
    // Fetch the latest user data after a pomodoro session ends
    await fetchUser(localStorage.getItem('token'));

    // Get the latest user object directly from useAuth after the fetch
    const { user: latestUser } = useAuth();

    // Use the updated user object to display rewards/punishments
    if (eventType === 'completed') {
      if (latestUser?.settings?.rewardSystemEnabled && latestUser?.rewards && latestUser.rewards.length > 0) {
        const randomReward = latestUser.rewards[Math.floor(Math.random() * latestUser.rewards.length)];
        setCurrentReward(randomReward);
        setShowRewardModal(true);
      }
    } else if (eventType === 'interrupted') {
      if (latestUser?.settings?.rewardSystemEnabled && latestUser?.punishments && latestUser.punishments.length > 0) {
        const randomPunishment = latestUser.punishments[Math.floor(Math.random() * latestUser.punishments.length)];
        setCurrentPunishment(randomPunishment);
        setShowPunishmentModal(true);
      }
    }
  }, [fetchUser]);

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-emerald-50">
                  <FaLeaf className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                  Zentro Garden
                </h1>
              </div>
              <div className="h-6 w-px bg-emerald-200"></div>
              <p className="text-gray-600 italic">Greetings, {user?.username}! 🌱</p>
            </div>
            <button
              onClick={logout}
              className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out"
            >
              <span>Seek Tranquility</span>
              <FaSignOutAlt className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 p-1 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100">
            {tabs.map((tab) => (
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
        onClose={() => setShowRewardModal(false)}
        reward={currentReward}
      />
      <PunishmentModal
        show={showPunishmentModal}
        onClose={() => setShowPunishmentModal(false)}
        punishment={currentPunishment}
      />
    </div>
  );
}

export default Dashboard; 