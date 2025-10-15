import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePomodoro } from '../contexts/PomodoroContext';
import { FaCalendarWeek, FaCalendarAlt, FaFireAlt, FaBullseye, FaEdit, FaSave, FaTimes, FaClock } from 'react-icons/fa';

function Report() {
  const { user, updateUser } = useAuth();
  const { reportRefreshKey } = usePomodoro();
  const [stats, setStats] = useState({ week: 0, month: 0, streak: 0, dailyGoal: 120, todayFocusTime: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('/api/users/pomodoro-stats', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setStats({
          week: data.weekly || 0,
          month: data.monthly || 0,
          streak: data.currentStreak || 0,
          dailyGoal: user?.settings?.dailyGoal || 120,
          todayFocusTime: data.todayFocusTime || 0
        });
      } else {
        console.error('Failed to fetch stats:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [user, reportRefreshKey, fetchStats]);

  const today = new Date();
  const dayOfWeek = today.getDay(); 
  const daysInMonth = today.getDate();

  const weeklyAvg = stats.week > 0 ? Math.round(stats.week / (dayOfWeek + 1)) : 0;
  const monthlyAvg = stats.month > 0 ? Math.round(stats.month / daysInMonth) : 0;

  const allStatCards = [
    { title: "Today's Flow", value: `${stats.todayFocusTime} min`, icon: FaClock, color: "text-zen-sky-dark dark:text-zen-sky-light" },
    { title: "This Week", value: `${stats.week} min`, subtitle: `Avg: ${weeklyAvg} min/day`, icon: FaCalendarWeek, color: "text-zen-green-dark dark:text-zen-green" },
    { title: "This Month", value: `${stats.month} min`, subtitle: `Avg: ${monthlyAvg} min/day`, icon: FaCalendarAlt, color: "text-zen-sun dark:text-yellow-300" },
    { title: "Focus Streak", value: `${stats.streak} days`, icon: FaFireAlt, color: "text-orange-500 dark:text-orange-400" }
  ];

  const focusStreakCard = allStatCards.find(s => s.title === "Focus Streak");
  const otherStatCards = allStatCards.filter(s => s.title !== "Focus Streak");

  return (
    <div className="space-y-10">
      <h2 className="text-4xl font-thin text-zen-charcoal dark:text-zen-sand tracking-wider text-center">Growth Journal</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailyGoalCard stats={stats} updateUser={updateUser} />
        {focusStreakCard && <StatCard {...focusStreakCard} />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {otherStatCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

    </div>
  );
}

const DailyGoalCard = ({ stats, updateUser }) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newDailyGoal, setNewDailyGoal] = useState(stats.dailyGoal);

  useEffect(() => {
      setNewDailyGoal(stats.dailyGoal);
  }, [stats.dailyGoal]);

  const handleUpdateGoal = async () => {
      try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/users/settings', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ settings: { dailyGoal: newDailyGoal } }),
          });
          if (!response.ok) throw new Error('Failed to update goal');
          const updatedUser = await response.json();
          updateUser(updatedUser);
          setIsEditingGoal(false);
      } catch (error) {
          console.error('Error updating daily goal:', error);
      }
  };

  const dailyProgress = Math.min(100, Math.floor((stats.todayFocusTime / (stats.dailyGoal || 1)) * 100));

  return (
      <div className="bg-white/50 dark:bg-black/25 backdrop-blur-3xl rounded-[36px] shadow-xl p-6 sm:p-8 border border-white/60 dark:border-black/30 h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center space-x-4">
                    <FaBullseye className="w-7 h-7 text-zen-green-dark" />
                    <h3 className="text-xl font-semibold text-zen-charcoal dark:text-zen-sand">Daily Cultivation Goal</h3>
                </div>
                {!isEditingGoal && (
                    <button onClick={() => setIsEditingGoal(true)} className="flex items-center space-x-2 text-sm font-medium text-zen-charcoal/70 dark:text-zen-sand/70 hover:text-zen-green-dark dark:hover:text-zen-green transition-colors">
                        <FaEdit />
                        <span>Edit</span>
                    </button>
                )}
            </div>
            
            {isEditingGoal ? (
                <div className="flex items-center gap-4 py-2">
                    <input 
                        type="number"
                        value={newDailyGoal}
                        onChange={(e) => setNewDailyGoal(Number(e.target.value))}
                        className="w-full px-5 py-3 rounded-full border border-white/60 dark:border-black/30 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-zen-green dark:focus:ring-zen-green-dark shadow-inner transition-all duration-300 ease-in-out text-zen-charcoal dark:text-zen-sand"
                    />
                    <button onClick={handleUpdateGoal} className="p-3.5 bg-gradient-to-br from-zen-green to-zen-green-dark text-white rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all"><FaSave /></button>
                    <button onClick={() => setIsEditingGoal(false)} className="p-3.5 bg-white/70 dark:bg-black/30 text-zen-charcoal/80 dark:text-zen-sand/80 rounded-full hover:bg-white dark:hover:bg-black/40 transition-colors"><FaTimes /></button>
                </div>
            ) : (
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-baseline font-semibold text-zen-charcoal dark:text-zen-sand">
                    <span className="text-2xl">{stats.todayFocusTime}<span className="text-base ml-1">min</span></span>
                    <span className="text-base text-zen-charcoal/60 dark:text-zen-sand/60">/ {stats.dailyGoal} min</span>
                  </div>
                  <ProgressBar progress={dailyProgress} />
                  <p className="text-center text-sm text-zen-charcoal/70 dark:text-zen-sand/70 font-medium">
                    You've completed {dailyProgress}% of your daily cultivation.
                  </p>
                </div>
            )}
          </div>
      </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="bg-white/50 dark:bg-black/25 backdrop-blur-3xl rounded-3xl shadow-lg hover:shadow-2xl p-6 border border-white/60 dark:border-black/30 flex flex-col justify-between transform transition-all hover:scale-105 min-h-[190px]">
    <div className="flex items-start justify-between">
      <p className="text-base font-semibold text-zen-charcoal/80 dark:text-zen-sand/80">{title}</p>
      <Icon className={`w-7 h-7 ${color} opacity-80`} />
    </div>
    <div>
      <p className="text-3xl font-bold text-zen-charcoal dark:text-zen-sand">{value}</p>
      {subtitle && <p className="text-sm font-medium text-zen-charcoal/60 dark:text-zen-sand/60 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const ProgressBar = ({ progress }) => (
    <div className="w-full bg-white/40 dark:bg-black/20 rounded-full h-4 shadow-inner border border-white/50 dark:border-black/25">
        <div 
            className="bg-gradient-to-r from-zen-green to-zen-sky-light h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

export default Report;
