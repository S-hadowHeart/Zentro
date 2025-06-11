import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash, FaCog, FaSeedling, FaLeaf, FaSun, FaMoon, FaPlus, FaCheck, FaClock } from 'react-icons/fa';

function Settings() {
  const { user, fetchUser, updateUser } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [punishments, setPunishments] = useState([]);
  const [newReward, setNewReward] = useState('');
  const [newPunishment, setNewPunishment] = useState('');
  const [message, setMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateType, setUpdateType] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(25);
  const [pomodoroDurationSetting, setPomodoroDurationSetting] = useState(25);
  const [breakDurationSetting, setBreakDurationSetting] = useState(5);

  useEffect(() => {
    if (user) {
      setRewards(user.rewards || []);
      setPunishments(user.punishments || []);
      setDailyGoal(user.settings?.dailyGoal || 25);
      setPomodoroDurationSetting(user.settings?.pomodoroDuration || 25);
      setBreakDurationSetting(user.settings?.breakDuration || 5);
    }
  }, [user]);

  const handleUpdate = async (type) => {
    if (isUpdating) return;

    setMessage('');
    setIsUpdating(true);
    setUpdateType(type);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please log in again');
        return;
      }

      let requestBody = {};
      let endpoint = `/api/users/${type}`;
      let successMessage = '';

      if (type === 'rewards' || type === 'punishments') {
        requestBody = { [type]: type === 'rewards' ? rewards : punishments };
        successMessage = `${type === 'rewards' ? 'Seeds of joy nurtured!' : 'Weeds uprooted!'}`;
      } else if (type === 'settings') {
        requestBody = { 
          settings: {
            dailyGoal: dailyGoal,
            pomodoroDuration: pomodoroDurationSetting,
            breakDuration: breakDurationSetting
          }
        };
        successMessage = 'Arrangements harmonized!';
      } else {
        throw new Error('Invalid update type');
      }

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Server error');
      }

      setMessage(successMessage);
      const updatedUserData = await response.json();
      updateUser(updatedUserData.user);

    } catch (error) {
      setMessage(`Error updating ${type}: ${error.message || 'Server unreachable. Please check if the server is running.'}`);
    } finally {
      setIsUpdating(false);
      setUpdateType(null);
    }
  };

  const addItem = (type, item, setter, newItemSetter) => {
    if (item.trim()) {
      if (type === 'rewards') {
        setter([...rewards, item.trim()]);
      } else {
        setter([...punishments, item.trim()]);
      }
      newItemSetter('');
    }
  };

  const removeItem = (type, index, setter) => {
    if (type === 'rewards') {
      setter(rewards.filter((_, i) => i !== index));
    } else {
      setter(punishments.filter((_, i) => i !== index));
    }
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    handleUpdate('settings');
  };

  const handleAddReward = () => {
    addItem('rewards', newReward, setRewards, setNewReward);
  };

  const handleRemoveReward = (index) => {
    removeItem('rewards', index, setRewards);
  };

  const handleSaveRewards = () => {
    handleUpdate('rewards');
  };

  const handleAddPunishment = () => {
    addItem('punishments', newPunishment, setPunishments, setNewPunishment);
  };

  const handleRemovePunishment = (index) => {
    removeItem('punishments', index, setPunishments);
  };

  const handleSavePunishments = () => {
    handleUpdate('punishments');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-full bg-zen-primary/10">
          <FaCog className="w-6 h-6 text-zen-primary" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-zen-primary to-zen-primary/80 bg-clip-text text-transparent">
          Garden Arrangements
        </h2>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center space-x-2 ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-500 border border-red-100' 
            : 'bg-zen-primary/10 text-zen-primary border border-zen-primary/20'
        }`}>
          {message.includes('Error') ? (
            <FaMoon className="w-5 h-5" />
          ) : (
            <FaSun className="w-5 h-5" />
          )}
          <span>{message}</span>
        </div>
      )}

      {/* Daily Goal Section */}
      <form onSubmit={handleGoalSubmit} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-emerald-100 p-6 transform transition-all duration-300 ease-in-out hover:shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <FaSeedling className="w-5 h-5 text-emerald-600" />
          <label htmlFor="dailyGoal" className="text-lg font-semibold text-gray-800">Daily Cultivation Goal (minutes)</label>
        </div>
        <div className="relative">
          <input
            type="number"
            id="dailyGoal"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all duration-300 ease-in-out"
            placeholder="e.g., 120"
            required
          />
          <FaLeaf className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
        </div>
        <button
          type="submit"
          disabled={isUpdating}
          className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <>
              <FaCog className="w-4 h-4 animate-spin" />
              <span>Harmonizing Goal...</span>
            </>
          ) : (
            <>
              <FaCheck className="w-4 h-4" />
              <span>Set Cultivation Goal</span>
            </>
          )}
        </button>
      </form>

      {/* Pomodoro and Break Duration Settings */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FaClock className="w-5 h-5 text-zen-primary" />
          <h3 className="text-lg font-semibold text-zen-text">Rhythm Adjustments</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="pomodoroDurationSetting" className="block text-sm font-medium text-zen-text mb-1">Cultivation Duration (minutes):</label>
            <input
              type="number"
              id="pomodoroDurationSetting"
              value={pomodoroDurationSetting}
              onChange={(e) => setPomodoroDurationSetting(Math.max(1, parseInt(e.target.value) || 0))}
              min="1"
              max="60"
              className="w-full px-4 py-3 border border-zen-primary/20 rounded-lg focus:ring-2 focus:ring-zen-primary focus:border-transparent shadow-sm transition-all duration-300 ease-in-out"
            />
          </div>
          <div>
            <label htmlFor="breakDurationSetting" className="block text-sm font-medium text-zen-text mb-1">Rejuvenation Duration (minutes):</label>
            <input
              type="number"
              id="breakDurationSetting"
              value={breakDurationSetting}
              onChange={(e) => setBreakDurationSetting(Math.max(1, parseInt(e.target.value) || 0))}
              min="1"
              max="30"
              className="w-full px-4 py-3 border border-zen-primary/20 rounded-lg focus:ring-2 focus:ring-zen-primary focus:border-transparent shadow-sm transition-all duration-300 ease-in-out"
            />
          </div>
          <button
            onClick={() => handleUpdate('settings')}
            disabled={isUpdating}
            className="w-full bg-zen-primary hover:bg-zen-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isUpdating && updateType === 'settings' ? (
              <>
                <FaCog className="w-4 h-4 animate-spin" />
                <span>Adjusting Rhythm...</span>
              </>
            ) : (
              <>
                <FaCheck className="w-4 h-4" />
                <span>Adjust Rhythm</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Custom Rewards Section */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FaLeaf className="w-5 h-5 text-zen-primary" />
          <h3 className="text-lg font-semibold text-zen-text">Seeds of Joy</h3>
        </div>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newReward}
            onChange={(e) => setNewReward(e.target.value)}
            placeholder="Sow a new seed of joy..."
            className="flex-1 px-4 py-3 border border-zen-primary/20 rounded-lg focus:ring-2 focus:ring-zen-primary focus:border-transparent shadow-sm transition-all duration-300 ease-in-out"
          />
          <button
            onClick={handleAddReward}
            className="px-6 py-3 bg-zen-primary hover:bg-zen-primary/90 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out flex items-center space-x-2 group"
          >
            <FaPlus className="w-4 h-4 transform group-hover:rotate-90 transition-transform duration-300" />
            <span>Sow</span>
          </button>
        </div>
        <div className="space-y-2 mb-4">
          {rewards.map((reward, index) => (
            <div key={index} className="flex items-center justify-between bg-zen-primary/5 px-4 py-2 rounded-lg border border-zen-primary/10 shadow-sm">
              <span className="text-zen-text">{reward}</span>
              <button
                onClick={() => handleRemoveReward(index)}
                className="text-zen-primary/50 hover:text-zen-primary p-1 rounded-full hover:bg-zen-primary/10 transition-all duration-300"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveRewards}
          disabled={isUpdating}
          className="w-full bg-zen-primary hover:bg-zen-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUpdating && updateType === 'rewards' ? (
            <>
              <FaCog className="w-4 h-4 animate-spin" />
              <span>Nurturing Seeds...</span>
            </>
          ) : (
            <>
              <FaCheck className="w-4 h-4" />
              <span>Nurture Seeds of Joy</span>
            </>
          )}
        </button>
      </div>

      {/* Custom Punishments Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-red-100 p-6 transform transition-all duration-300 ease-in-out hover:shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <FaTrash className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-800">Weeds of Reflection (Custom Punishments)</h3>
        </div>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newPunishment}
            onChange={(e) => setNewPunishment(e.target.value)}
            placeholder="Uproot a new weed of reflection..."
            className="flex-1 px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all duration-300 ease-in-out"
          />
          <button
            onClick={handleAddPunishment}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out flex items-center space-x-2 group"
          >
            <FaPlus className="w-4 h-4 transform group-hover:rotate-90 transition-transform duration-300" />
            <span>Uproot</span>
          </button>
        </div>
        <div className="space-y-2 mb-4">
          {punishments.map((punishment, index) => (
            <div key={index} className="flex items-center justify-between bg-red-50 px-4 py-2 rounded-lg border border-red-100 shadow-sm">
              <span className="text-red-800">{punishment}</span>
              <button
                onClick={() => handleRemovePunishment(index)}
                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all duration-300"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleSavePunishments}
          disabled={isUpdating}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUpdating && updateType === 'punishments' ? (
            <>
              <FaCog className="w-4 h-4 animate-spin" />
              <span>Uprooting Weeds...</span>
            </>
          ) : (
            <>
              <FaCheck className="w-4 h-4" />
              <span>Prune Weeds of Reflection</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Settings;