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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
            setTimeout(() => setMessage(''), 3000);
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ [type]: list }),
            });
            if (!response.ok) throw new Error(`Failed to update ${type}`);
            const updatedUser = await response.json();
            updateUser(updatedUser);
            setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} list cultivated successfully!`);
        } catch (error) {
            setMessage(error.message || `Error updating ${type}.`);
        } finally {
            setIsUpdating(false);
            setTimeout(() => setMessage(''), 3000);
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
        <div className="space-y-10">
            <h2 className="text-4xl font-thin text-zen-charcoal dark:text-zen-sand tracking-wider text-center">Garden Arrangements</h2>
            
            {message && <div className={`p-4 rounded-xl text-sm font-semibold text-center my-4 transition-opacity duration-300 ${message.includes('Error') ? 'bg-red-500/10 text-red-500' : 'bg-zen-green/10 text-zen-green-dark'}`}>{message}</div>}

            <SettingsCard icon={FaClock} title="Flow & Rest Rhythm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <NumberInput label="Focus (minutes)" value={pomodoroDuration} onChange={setPomodoroDuration} min={5} max={90} />
                    <NumberInput label="Rest (minutes)" value={breakDuration} onChange={setBreakDuration} min={1} max={30} />
                </div>
                <SaveButton onClick={handleSettingsUpdate} isSaving={isUpdating} text="Save Rhythm" />
            </SettingsCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <SettingsCard icon={FaHeart} title="Seeds of Joy (Rewards)" iconColor="text-green-500">
                    <ListManager type="rewards" list={rewards} newItem={newReward} setNewItem={setNewReward} addItem={addItem} removeItem={removeItem} placeholder="e.g., 5-min meditation" />
                </SettingsCard>

                <SettingsCard icon={FaExclamationTriangle} title="Weeds of Distraction (Punishments)" iconColor="text-red-500">
                    <ListManager type="punishments" list={punishments} newItem={newPunishment} setNewItem={setNewPunishment} addItem={addItem} removeItem={removeItem} placeholder="e.g., 1-min plank" />
                </SettingsCard>
            </div>
        </div>
    );
}

const SettingsCard = ({ icon: Icon, title, iconColor, children }) => (
    <div className="bg-white/50 dark:bg-black/25 backdrop-blur-3xl rounded-[36px] shadow-xl p-6 sm:p-8 border border-white/60 dark:border-black/30 h-full flex flex-col">
        <div className="flex items-center space-x-4 mb-6">
            <Icon className={`w-7 h-7 ${iconColor || 'text-zen-green'}`} />
            <h3 className="text-xl font-semibold text-zen-charcoal dark:text-zen-sand tracking-wide">{title}</h3>
        </div>
        <div className="space-y-5 flex-grow">{children}</div>
    </div>
);

const NumberInput = ({ label, value, onChange, min, max }) => (
    <div>
        <label className="block text-sm font-medium text-zen-charcoal/80 dark:text-zen-sand/80 mb-2.5 tracking-wider">{label}</label>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
            min={min} max={max}
            className="w-full px-5 py-3.5 rounded-full border border-white/60 dark:border-black/30 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-zen-green dark:focus:ring-zen-green-dark shadow-inner transition-all duration-300 ease-in-out text-zen-charcoal dark:text-zen-sand"
        />
    </div>
);

const ListManager = ({ type, list, newItem, setNewItem, addItem, removeItem, placeholder }) => (
    <div className="flex flex-col h-full">
        <div className="flex gap-3">
            <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-5 py-3.5 rounded-full border border-white/60 dark:border-black/30 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-zen-green dark:focus:ring-zen-green-dark shadow-inner transition-all duration-300 ease-in-out text-zen-charcoal dark:text-zen-sand placeholder-zen-charcoal/50 dark:placeholder-zen-sand/50"
            />
            <button
                onClick={() => addItem(type)}
                className="p-4 bg-gradient-to-br from-zen-green to-zen-green-dark text-white rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                <FaPlus />
            </button>
        </div>
        <ul className="space-y-2.5 pt-4 flex-grow overflow-y-auto max-h-48 custom-scrollbar">
            {list.map((item, index) => (
                <li key={index} className="group flex justify-between items-center bg-white/40 dark:bg-black/20 p-3 rounded-lg transition-all duration-300 border border-white/50 dark:border-black/30">
                    <span className="text-zen-charcoal dark:text-zen-sand font-medium">{item}</span>
                    <button onClick={() => removeItem(type, index)} className="p-2 text-zen-charcoal/40 dark:text-zen-sand/40 hover:text-red-500 opacity-0 group-hover:opacity-100 rounded-full hover:bg-red-500/10 transition-all duration-300">
                        <FaTrash />
                    </button>
                </li>
            ))}
             {list.length === 0 && <p className='text-center text-sm text-zen-charcoal/50 dark:text-zen-sand/50 pt-4'>Your list is empty.</p>}
        </ul>
    </div>
);

const SaveButton = ({ onClick, isSaving, text }) => (
    <button
        onClick={onClick}
        disabled={isSaving}
        className="w-full mt-5 bg-gradient-to-br from-zen-green to-zen-green-dark text-white font-semibold py-3.5 px-4 rounded-full transition-all duration-300 ease-in-out shadow-lg disabled:opacity-70 flex items-center justify-center space-x-2 transform hover:scale-105">
        {isSaving ? <FaCog className="w-5 h-5 animate-spin" /> : <FaCheck className="w-5 h-5" />}
        <span>{isSaving ? 'Saving...' : text}</span>
    </button>
);

export default Settings;
