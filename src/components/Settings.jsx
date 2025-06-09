import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
        successMessage = `${type === 'rewards' ? 'Rewards' : 'Punishments'} updated successfully!`;
      } else if (type === 'settings') {
        requestBody = { settings: { dailyGoal: dailyGoal } };
        console.log('Settings: Sending dailyGoal to backend:', dailyGoal);
        successMessage = 'Settings updated successfully!';
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-zen-green mb-6">Arrangements</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${message.includes('Error') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
          {message}
        </div>
      )}

      {/* Daily Goal Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-zen-green mb-4">Daily Cultivation Goal</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            min="1"
            placeholder="Cultivate daily minutes..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zen-green focus:border-transparent disabled:opacity-50"
            disabled={isUpdating}
          />
          <button
            onClick={() => handleUpdate('settings')}
            className="px-4 py-2 bg-zen-green text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating && updateType === 'settings' ? 'Nurturing...' : 'Nurture Goal'}
          </button>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-zen-green mb-4">Seeds of Joy</h3>
        <div className="flex flex-col gap-2 mb-4">
          {rewards.map((reward, index) => (
            <div key={index} className="flex justify-between items-center bg-zen-gray p-3 rounded-md">
              <span className="text-gray-700">{reward}</span>
              <button
                onClick={() => removeItem('rewards', index, setRewards)}
                className="text-red-500 hover:text-red-700 text-sm"
                disabled={isUpdating}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newReward}
            onChange={(e) => setNewReward(e.target.value)}
            placeholder="Sow a new seed of joy..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zen-green focus:border-transparent disabled:opacity-50"
            disabled={isUpdating}
          />
          <button
            onClick={() => addItem('rewards', newReward, setRewards, setNewReward)}
            className="px-4 py-2 bg-zen-green text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
            disabled={isUpdating}
          >
            Sow
          </button>
        </div>
        <button
          onClick={() => handleUpdate('rewards')}
          className="w-full px-4 py-2 bg-zen-green text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
          disabled={isUpdating}
        >
          {isUpdating && updateType === 'rewards' ? 'Nurturing...' : 'Nurture Seeds'}
        </button>
      </div>

      {/* Punishments Section */}
      <div>
        <h3 className="text-xl font-semibold text-zen-green mb-4">Weeds to Uproot</h3>
        <div className="flex flex-col gap-2 mb-4">
          {punishments.map((punishment, index) => (
            <div key={index} className="flex justify-between items-center bg-zen-gray p-3 rounded-md">
              <span className="text-gray-700">{punishment}</span>
              <button
                onClick={() => removeItem('punishments', index, setPunishments)}
                className="text-red-500 hover:text-red-700 text-sm"
                disabled={isUpdating}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPunishment}
            onChange={(e) => setNewPunishment(e.target.value)}
            placeholder="Identify a weed to uproot..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zen-green focus:border-transparent disabled:opacity-50"
            disabled={isUpdating}
          />
          <button
            onClick={() => addItem('punishments', newPunishment, setPunishments, setNewPunishment)}
            className="px-4 py-2 bg-zen-green text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
            disabled={isUpdating}
          >
            Identify
          </button>
        </div>
        <button
          onClick={() => handleUpdate('punishments')}
          className="w-full px-4 py-2 bg-zen-green text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
          disabled={isUpdating}
        >
          {isUpdating && updateType === 'punishments' ? 'Uprooting...' : 'Clear Weeds'}
        </button>
      </div>
    </div>
  );
}

export default Settings; 