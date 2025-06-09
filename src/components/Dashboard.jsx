import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PomodoroTimer from './PomodoroTimer';
import TaskList from './TaskList';
import Settings from './Settings';
import RewardModal from './RewardModal';
import PunishmentModal from './PunishmentModal';
import Report from './Report';

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('timer');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showPunishmentModal, setShowPunishmentModal] = useState(false);
  const [reward, setReward] = useState('');
  const [punishment, setPunishment] = useState('');
  const [reportRefreshKey, setReportRefreshKey] = useState(0);

  const handlePomodoroComplete = () => {
    if (user.settings.rewardSystemEnabled) {
      const randomReward = user.rewards[Math.floor(Math.random() * user.rewards.length)];
      setReward(randomReward);
      setShowRewardModal(true);
    }
  };

  const handlePomodoroInterrupt = () => {
    if (user.settings.rewardSystemEnabled) {
      const randomPunishment = user.punishments[Math.floor(Math.random() * user.punishments.length)];
      setPunishment(randomPunishment);
      setShowPunishmentModal(true);
    }
  };

  const handlePomodoroEnd = useCallback(() => {
    setReportRefreshKey(prevKey => prevKey + 1);
  }, []);

  return (
    <div className="min-h-screen bg-zen-beige flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-zen-green">Zentro</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Greetings, {user.username}!</span>
            <button
              onClick={logout}
              className="px-4 py-2 text-zen-green hover:bg-zen-gray rounded-md transition-colors"
            >
              Seek Tranquility
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Tabs */}
        <div className="flex gap-4 my-8">
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-4 py-2 rounded-md ${activeTab === 'timer' ? 'bg-zen-green text-white' : 'bg-zen-gray text-zen-green hover:bg-opacity-90'}`}
          >
            Zen Focus Session
          </button>
          <button
            onClick={() => setActiveTab('cultivations')}
            className={`px-4 py-2 rounded-md ${activeTab === 'cultivations' ? 'bg-zen-green text-white' : 'bg-zen-gray text-zen-green hover:bg-opacity-90'}`}
          >
            Cultivations
          </button>
          <button
            onClick={() => setActiveTab('arrangements')}
            className={`px-4 py-2 rounded-md ${activeTab === 'arrangements' ? 'bg-zen-green text-white' : 'bg-zen-gray text-zen-green hover:bg-opacity-90'}`}
          >
            Arrangements
          </button>
          <button
            onClick={() => setActiveTab('growth-journal')}
            className={`px-4 py-2 rounded-md ${activeTab === 'growth-journal' ? 'bg-zen-green text-white' : 'bg-zen-gray text-zen-green hover:bg-opacity-90'}`}
          >
            Growth Journal
          </button>
        </div>

        {/* Centered Content */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-2xl flex flex-col items-center space-y-8">
            <div className={`${activeTab === 'timer' ? 'block' : 'hidden'} w-full bg-white rounded-lg shadow-xl p-6`}>
              <PomodoroTimer onPomodoroEnd={handlePomodoroEnd} />
            </div>
            <div className={`${activeTab === 'cultivations' ? 'block' : 'hidden'} w-full bg-white rounded-lg shadow-xl p-6`}>
              <TaskList />
            </div>
            <div className={`${activeTab === 'arrangements' ? 'block' : 'hidden'} w-full bg-white rounded-lg shadow-xl p-6`}>
              <Settings />
            </div>
            <div className={`${activeTab === 'growth-journal' ? 'block' : 'hidden'} w-full bg-white rounded-lg shadow-xl p-6`}>
              <Report key={reportRefreshKey} />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <RewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        reward={reward}
      />
      <PunishmentModal
        isOpen={showPunishmentModal}
        onClose={() => setShowPunishmentModal(false)}
        punishment={punishment}
      />
    </div>
  );
}

export default Dashboard; 