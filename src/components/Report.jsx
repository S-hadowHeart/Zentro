import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaChartLine, FaFire, FaLeaf, FaClock } from 'react-icons/fa';

function Report() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    streak: 0,
    dailyGoal: 120, // Default to 120 minutes if not fetched
    todayFocusTime: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // Exit if no token

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
          console.error('Failed to fetch stats:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]); // Add user to dependency array to re-fetch if user changes

  const statCards = [
    {
      title: "Today's Cultivation",
      value: `${Math.floor(stats.todayFocusTime / 60)}h ${stats.todayFocusTime % 60}m`,
      icon: FaClock,
      color: "from-zen-primary to-zen-primary/80"
    },
    {
      title: "Weekly Growth",
      value: `${Math.floor(stats.week / 60)}h ${stats.week % 60}m`,
      icon: FaChartLine,
      color: "from-zen-secondary to-zen-secondary/80"
    },
    {
      title: "Monthly Journey",
      value: `${Math.floor(stats.month / 60)}h ${stats.month % 60}m`,
      icon: FaLeaf,
      color: "from-zen-primary/80 to-zen-primary/60"
    },
    {
      title: "Unbroken Flow",
      value: `${stats.streak} days`,
      icon: FaFire,
      color: "from-zen-secondary/80 to-zen-secondary/60"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-zen-primary to-zen-primary/80 bg-clip-text text-transparent mb-2">
          Garden's Growth Journal
        </h2>
        <p className="text-zen-text/80">Observe the blossoming of your mindful cultivation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="card p-6 transform transition-all duration-300 ease-in-out hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zen-text">{stat.title}</h3>
              <stat.icon className={`w-6 h-6 text-${stat.color.split('-')[1]}`} />
            </div>
            <p className="text-3xl font-bold text-zen-text">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-semibold text-zen-text mb-6">Garden's Rhythm</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zen-primary/10 rounded-lg border border-zen-primary/20">
            <div>
              <p className="text-zen-primary font-medium">Daily Cultivation</p>
              <p className="text-sm text-zen-text/80">
                {Math.floor(stats.todayFocusTime / 60)} hours {stats.todayFocusTime % 60} minutes of mindful practice
              </p>
            </div>
            <FaClock className="w-8 h-8 text-zen-primary" />
          </div>

          <div className="flex items-center justify-between p-4 bg-zen-secondary/10 rounded-lg border border-zen-secondary/20">
            <div>
              <p className="text-zen-secondary font-medium">Weekly Growth</p>
              <p className="text-sm text-zen-text/80">
                {Math.floor(stats.week / 60)} hours {stats.week % 60} minutes of deep cultivation
              </p>
            </div>
            <FaChartLine className="w-8 h-8 text-zen-secondary" />
          </div>

          <div className="flex items-center justify-between p-4 bg-zen-primary/5 rounded-lg border border-zen-primary/10">
            <div>
              <p className="text-zen-primary/80 font-medium">Monthly Journey</p>
              <p className="text-sm text-zen-text/80">
                {Math.floor(stats.month / 60)} hours {stats.month % 60} minutes of focused cultivation
              </p>
            </div>
            <FaLeaf className="w-8 h-8 text-zen-primary/80" />
          </div>

          <div className="flex items-center justify-between p-4 bg-zen-secondary/5 rounded-lg border border-zen-secondary/10">
            <div>
              <p className="text-zen-secondary/80 font-medium">Unbroken Flow</p>
              <p className="text-sm text-zen-text/80">
                {stats.streak} days of consistent practice
              </p>
            </div>
            <FaFire className="w-8 h-8 text-zen-secondary/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report; 