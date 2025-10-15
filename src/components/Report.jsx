import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaFireAlt, FaBullseye, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

function Report() {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({
    week: 0,
    month: 0,
    streak: 0,
    dailyGoal: 120,
    todayFocusTime: 0
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newDailyGoal, setNewDailyGoal] = useState(120);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/users/pomodoro-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          week: data.weekly || 0,
          month: data.monthly || 0,
          streak: data.currentStreak || 0,
          dailyGoal: data.dailyGoal || 120,
          todayFocusTime: data.todayFocusTime || 0
        });
        setNewDailyGoal(data.dailyGoal || 120);
      } else {
        console.error('Failed to fetch stats:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [user, fetchStats]);

  const handleUpdateGoal = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/settings', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ settings: { dailyGoal: newDailyGoal } }),
        });
        if (!response.ok) throw new Error('Failed to update goal');
        const updatedUser = await response.json();
        updateUser(updatedUser); // Update user in context
        setStats(prev => ({ ...prev, dailyGoal: newDailyGoal }));
        setIsEditingGoal(false);
    } catch (error) {
        console.error('Error updating daily goal:', error);
    }
  };
  
  const today = new Date();
  const daysInWeek = today.getDay() + 1;
  const daysInMonth = today.getDate();

  const weeklyAvg = stats.week > 0 ? Math.round(stats.week / daysInWeek) : 0;
  const monthlyAvg = stats.month > 0 ? Math.round(stats.month / daysInMonth) : 0;
  const dailyProgress = Math.min(100, Math.floor((stats.todayFocusTime / (stats.dailyGoal || 1)) * 100));

  const statCards = [
    { title: "Today's Flow", value: `${stats.todayFocusTime} min`, icon: FaCalendarDay, color: "text-zen-sky-dark" },
    { title: "Weekly Average", value: `${weeklyAvg} min/day`, icon: FaCalendarWeek, color: "text-zen-green-dark" },
    { title: "Monthly Average", value: `${monthlyAvg} min/day`, icon: FaCalendarAlt, color: "text-zen-sun" },
    { title: "Focus Streak", value: `${stats.streak} days`, icon: FaFireAlt, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-light text-zen-charcoal dark:text-zen-sand tracking-wider text-center">Growth Journal</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-2xl rounded-[36px] shadow-lg p-6 sm:p-8 border border-white/50 dark:border-black/30">
        <div className="flex justify-between items-center mb-5">
            <div className="flex items-center space-x-3">
                <FaBullseye className="w-6 h-6 text-zen-green" />
                <h3 className="text-xl font-semibold text-zen-charcoal dark:text-zen-sand">Daily Goal Progress</h3>
            </div>
            {!isEditingGoal && (
                <button onClick={() => setIsEditingGoal(true)} className="flex items-center space-x-2 text-sm font-medium text-zen-charcoal/70 dark:text-zen-sand/70 hover:text-zen-green dark:hover:text-zen-green-dark transition-colors">
                    <FaEdit />
                    <span>Edit Goal</span>
                </button>
            )}
        </div>
        
        {isEditingGoal ? (
            <div className="flex items-center gap-4">
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
            <div className="space-y-4">
              <div className="flex justify-between items-center font-semibold text-zen-charcoal dark:text-zen-sand">
                <span>{stats.todayFocusTime} min</span>
                <span className="text-zen-charcoal/60 dark:text-zen-sand/60">/ {stats.dailyGoal} min</span>
              </div>
              <ProgressBar progress={dailyProgress} />
              <p className="text-center text-sm text-zen-charcoal/70 dark:text-zen-sand/70 font-medium">
                You've completed {dailyProgress}% of your daily cultivation goal.
              </p>
            </div>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white/40 dark:bg-black/20 backdrop-blur-2xl rounded-3xl shadow-lg p-5 border border-white/50 dark:border-black/30 flex items-center space-x-4 transform transition-all hover:scale-105 hover:shadow-xl">
    <div className={`p-3 rounded-full bg-white/50 dark:bg-black/20`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-zen-charcoal/70 dark:text-zen-sand/70">{title}</p>
      <p className="text-2xl font-bold text-zen-charcoal dark:text-zen-sand">{value}</p>
    </div>
  </div>
);

const ProgressBar = ({ progress }) => (
    <div className="w-full bg-white/50 dark:bg-black/20 rounded-full h-3.5 overflow-hidden shadow-inner">
        <div 
            className="bg-gradient-to-r from-zen-green to-zen-green-dark h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

export default Report;
