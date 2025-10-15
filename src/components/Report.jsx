import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaFireAlt } from 'react-icons/fa';

function Report() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    streak: 0,
    dailyGoal: 120,
    todayFocusTime: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/users/pomodoro-stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats({
            today: data.daily || 0,
            week: data.weekly || 0,
            month: data.monthly || 0,
            streak: data.currentStreak || 0,
            dailyGoal: data.dailyGoal || 120,
            todayFocusTime: data.todayFocusTime || 0
          });
        } else {
          console.error('Failed to fetch stats:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  const dailyProgress = Math.min(100, Math.floor((stats.todayFocusTime / (stats.dailyGoal || 1)) * 100));

  const statCards = [
    { title: "Today's Focus", value: `${stats.todayFocusTime} min`, icon: FaCalendarDay, color: "text-blue-500" },
    { title: "Weekly Focus", value: `${Math.floor(stats.week / 60)}h ${stats.week % 60}m`, icon: FaCalendarWeek, color: "text-purple-500" },
    { title: "Monthly Focus", value: `${Math.floor(stats.month / 60)}h ${stats.month % 60}m`, icon: FaCalendarAlt, color: "text-green-500" },
    { title: "Focus Streak", value: `${stats.streak} days`, icon: FaFireAlt, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Growth Journal</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-white/30 dark:border-gray-700/50">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Daily Goal Progress</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center font-semibold text-gray-700 dark:text-gray-300">
            <span>{stats.todayFocusTime} min</span>
            <span>{stats.dailyGoal} min</span>
          </div>
          <ProgressBar progress={dailyProgress} />
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
            You've completed {dailyProgress}% of your daily goal. Keep it up!
          </p>
        </div>
      </div>
      
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-md p-5 border border-white/30 dark:border-gray-700/50 flex items-center space-x-4">
    <div className={`p-3 rounded-full bg-gray-200 dark:bg-gray-700`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div 
            className="bg-gradient-to-r from-primary to-secondary h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

export default Report;
