import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash } from 'react-icons/fa';

function Settings() {
  const { user, fetchUser } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [punishments, setPunishments] = useState([]);
  const [newReward, setNewReward] = useState('');
  const [newPunishment, setNewPunishment] = useState('');
  const [message, setMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateType, setUpdateType] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(25);

  useEffect(() => {
    if (user) {
      setRewards(user.rewards || []);
      setPunishments(user.punishments || []);
      console.log('Settings: User object updated. Current dailyGoal from user:', user.settings?.dailyGoal);
      setDailyGoal(user.settings?.dailyGoal || 25);
    }
  }, [user]);

  const handleUpdate = async (type) => {
    if (isUpdating) return; // Prevent multiple updates

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
        requestBody = { settings: { dailyGoal: dailyGoal } };
        console.log('Settings: Sending dailyGoal to backend:', dailyGoal);
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

      const updatedUser = await fetchUser(token);
      console.log('Settings: fetchUser returned updatedUser:', updatedUser);
      console.log('Settings: user from AuthContext after fetchUser:', user);

      if (!updatedUser) {
        throw new Error('Failed to refresh user data');
      }
      console.log('Settings: User object after fetchUser (in handleUpdate):', updatedUser);
    } catch (error) {
      console.error('Update error:', error);
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
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-zen-green mb-6">Arrangements</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${message.includes('Error') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
          {message}
        </div>
      )}

      {/* Daily Goal Section */}
      <form onSubmit={handleGoalSubmit} className="mb-8 p-6 bg-white rounded-lg shadow-xl border border-gray-100">
        <label htmlFor="dailyGoal" className="block text-lg font-semibold text-gray-800 mb-3">Daily Cultivation Goal (minutes):</label>
        <input
          type="number"
          id="dailyGoal"
          value={dailyGoal}
          onChange={(e) => setDailyGoal(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
          placeholder="e.g., 120"
          required
        />
        <button
          type="submit"
          className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md"
        >
          Nurture Goal
        </button>
      </form>

      {/* Custom Rewards Section */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Seeds of Joy</h3>
        <div className="flex mb-4">
          <input
            type="text"
            value={newReward}
            onChange={(e) => setNewReward(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
            placeholder="Sow a new seed of joy..."
          />
          <button
            onClick={handleAddReward}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-r-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md"
          >
            Sow
          </button>
        </div>
        <ul className="space-y-3">
          {rewards.map((reward, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm">
              <span className="text-gray-700">{reward}</span>
              <button
                onClick={() => handleRemoveReward(index)}
                className="text-red-500 hover:text-red-700 transition duration-300 ease-in-out"
              >
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
        {rewards.length > 0 && (
          <button
            onClick={handleSaveRewards}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md"
          >
            Nurture Seeds
          </button>
        )}
      </div>

      {/* Custom Punishments Section */}
      <div className="p-6 bg-white rounded-lg shadow-xl border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Weeds to Uproot</h3>
        <div className="flex mb-4">
          <input
            type="text"
            value={newPunishment}
            onChange={(e) => setNewPunishment(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
            placeholder="Identify a weed to uproot..."
          />
          <button
            onClick={handleAddPunishment}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-r-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md"
          >
            Identify
          </button>
        </div>
        <ul className="space-y-3">
          {punishments.map((punishment, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm">
              <span className="text-gray-700">{punishment}</span>
              <button
                onClick={() => handleRemovePunishment(index)}
                className="text-red-500 hover:text-red-700 transition duration-300 ease-in-out"
              >
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
        {punishments.length > 0 && (
          <button
            onClick={handleSavePunishments}
            className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md"
          >
            Clear Weeds
          </button>
        )}
      </div>
    </div>
  );
}

export default Settings;