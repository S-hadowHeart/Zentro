import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PomodoroTimer from './PomodoroTimer';
import TaskList from './TaskList';
import Settings from './Settings';
import RewardModal from './RewardModal';
import PunishmentModal from './PunishmentModal';
import Report from './Report';
import { FaTasks, FaCog, FaChartBar, FaClock } from 'react-icons/fa';

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showPunishmentModal, setShowPunishmentModal] = useState(false);
  const [reward, setReward] = useState('');
  const [punishment, setPunishment] = useState('');
  const [reportRefreshKey, setReportRefreshKey] = useState(0);

  const tabs = [
    { id: 'tasks', label: 'Cultivations', icon: FaTasks },
    { id: 'settings', label: 'Arrangements', icon: FaCog },
    { id: 'report', label: 'Growth Journal', icon: FaChartBar },
    { id: 'pomodoro', label: 'Zen Focus Session', icon: FaClock }
  ];

  const handlePomodoroComplete = useCallback(() => {
    if (user && user.settings && user.settings.rewardSystemEnabled) {
      const randomReward = user.rewards[Math.floor(Math.random() * user.rewards.length)];
      setReward(randomReward);
      setShowRewardModal(true);
    }
  }, [user]);

  const handlePomodoroInterrupt = useCallback(() => {
    if (user && user.settings && user.settings.rewardSystemEnabled) {
      const randomPunishment = user.punishments[Math.floor(Math.random() * user.punishments.length)];
      setPunishment(randomPunishment);
      setShowPunishmentModal(true);
    }
  }, [user]);

  const handlePomodoroEnd = useCallback(() => {
    setReportRefreshKey(prevKey => prevKey + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                Zentro Garden
              </h1>
              <p className="text-gray-600 italic">Greetings, {user.username}! 🌱</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out"
            >
              Seek Tranquility
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
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-emerald-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6 transform transition-all duration-300 ease-in-out hover:shadow-2xl">
          {activeTab === 'tasks' && <TaskList />}
          {activeTab === 'settings' && <Settings />}
          {activeTab === 'report' && <Report key={reportRefreshKey} />}
          {activeTab === 'pomodoro' && <PomodoroTimer onPomodoroEnd={handlePomodoroEnd} />}
        </div>
      </main>

      {/* Modals */}
      <RewardModal
        show={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        reward={reward}
      />
      <PunishmentModal
        show={showPunishmentModal}
        onClose={() => setShowPunishmentModal(false)}
        punishment={punishment}
      />
    </div>
  );
}

export default Dashboard; 