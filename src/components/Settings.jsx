import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash, FaCog, FaPlus, FaCheck, FaClock, FaHeart, FaExclamationTriangle } from 'react-icons/fa';

function Settings() {
    const { user, updateUser } = useAuth();
    const [rewards, setRewards] = useState([]);
    const [punishments, setPunishments] = useState([]);
    const [newReward, setNewReward] = useState('');
    const [newPunishment, setNewPunishment] = useState('');
    const [message, setMessage] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [pomodoroDuration, setPomodoroDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);

    useEffect(() => {
        if (user) {
            setRewards(user.rewards || []);
            setPunishments(user.punishments || []);
            setPomodoroDuration(user.settings?.pomodoroDuration || 25);
            setBreakDuration(user.settings?.breakDuration || 5);
        }
    }, [user]);

    const handleSettingsUpdate = async () => {
        if (isUpdating) return;
        setIsUpdating(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ settings: { pomodoroDuration, breakDuration } }),
            });
            if (!response.ok) throw new Error('Failed to update settings');
            const updatedUser = await response.json();
            updateUser(updatedUser);
            setMessage('Rhythm adjusted successfully!');
        } catch (error) {
            setMessage(error.message || 'Error updating settings.');
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleListUpdate = async (type, list) => {
        if (isUpdating) return;
        setIsUpdating(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/${type}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ [type]: list }),
            });
            if (!response.ok) throw new Error(`Failed to update ${type}`);
            const updatedUser = await response.json();
            updateUser(updatedUser);
            setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
        } catch (error) {
            setMessage(error.message || `Error updating ${type}.`);
        } finally {
            setIsUpdating(false);
        }
    };

    const addItem = (type) => {
        const list = type === 'rewards' ? rewards : punishments;
        const newItem = type === 'rewards' ? newReward : newPunishment;
        const setter = type === 'rewards' ? setRewards : setPunishments;
        const newItemSetter = type === 'rewards' ? setNewReward : setNewPunishment;

        if (newItem.trim()) {
            const updatedList = [...list, newItem.trim()];
            setter(updatedList);
            newItemSetter('');
            handleListUpdate(type, updatedList);
        }
    };

    const removeItem = (type, index) => {
        const list = type === 'rewards' ? rewards : punishments;
        const setter = type === 'rewards' ? setRewards : setPunishments;
        const updatedList = list.filter((_, i) => i !== index);
        setter(updatedList);
        handleListUpdate(type, updatedList);
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Arrangements</h2>
            
            {message && <div className={`p-4 rounded-xl text-sm ${message.includes('Error') ? 'bg-danger-light text-danger' : 'bg-primary-light text-primary'}`}>{message}</div>}

            <SettingsCard icon={FaClock} title="Rhythm Adjustments">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <NumberInput label="Focus Duration (min)" value={pomodoroDuration} onChange={setPomodoroDuration} min={1} max={60} />
                    <NumberInput label="Break Duration (min)" value={breakDuration} onChange={setBreakDuration} min={1} max={30} />
                </div>
                <SaveButton onClick={handleSettingsUpdate} isSaving={isUpdating} text="Adjust Rhythm" />
            </SettingsCard>

            <SettingsCard icon={FaHeart} title="Seeds of Joy (Rewards)" iconColor="text-green-500">
                <ListManager type="rewards" list={rewards} newItem={newReward} setNewItem={setNewReward} addItem={addItem} removeItem={removeItem} placeholder="E.g., Enjoy a cup of tea" />
            </SettingsCard>

            <SettingsCard icon={FaExclamationTriangle} title="Weeds to Clear (Punishments)" iconColor="text-red-500">
                <ListManager type="punishments" list={punishments} newItem={newPunishment} setNewItem={setNewPunishment} addItem={addItem} removeItem={removeItem} placeholder="E.g., 10 push-ups" />
            </SettingsCard>
        </div>
    );
}

const SettingsCard = ({ icon: Icon, title, iconColor, children }) => (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-white/30 dark:border-gray-700/50">
        <div className="flex items-center space-x-3 mb-5">
            <Icon className={`w-6 h-6 ${iconColor || 'text-primary dark:text-primary-light'}`} />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
        </div>
        <div className="space-y-4">{children}</div>
    </div>
);

const NumberInput = ({ label, value, onChange, min, max }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{label}</label>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
            min={min} max={max}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark shadow-sm transition-all duration-300 ease-in-out dark:text-white"
        />
    </div>
);

const ListManager = ({ type, list, newItem, setNewItem, addItem, removeItem, placeholder }) => (
    <>
        <div className="flex gap-3">
            <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark shadow-sm transition-all duration-300 ease-in-out dark:text-white dark:placeholder-gray-400"
            />
            <button
                onClick={() => addItem(type)}
                className="px-5 py-3 bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white rounded-xl shadow-md transition-all duration-300 flex items-center justify-center">
                <FaPlus />
            </button>
        </div>
        <ul className="space-y-2 pt-2">
            {list.map((item, index) => (
                <li key={index} className="group flex justify-between items-center bg-white/50 dark:bg-gray-700/50 p-3.5 rounded-lg transition-all duration-300">
                    <span className="text-gray-700 dark:text-gray-200">{item}</span>
                    <button onClick={() => removeItem(type, index)} className="p-2 text-gray-400 hover:text-danger opacity-0 group-hover:opacity-100 rounded-full hover:bg-danger/10 transition-all duration-300">
                        <FaTrash />
                    </button>
                </li>
            ))}
        </ul>
    </>
);

const SaveButton = ({ onClick, isSaving, text }) => (
    <button
        onClick={onClick}
        disabled={isSaving}
        className="w-full mt-4 bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 ease-in-out shadow-md disabled:opacity-60 flex items-center justify-center space-x-2">
        {isSaving ? <FaCog className="w-5 h-5 animate-spin" /> : <FaCheck className="w-5 h-5" />}
        <span>{isSaving ? 'Saving...' : text}</span>
    </button>
);

export default Settings;
