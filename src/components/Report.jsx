import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaChartLine, FaFire, FaLeaf, FaClock } from 'react-icons/fa';

function Report() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    streak: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Today's Cultivation",
      value: `${Math.floor(stats.today / 60)}h ${stats.today % 60}m`,
      icon: FaClock,
      color: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Weekly Growth",
      value: `${Math.floor(stats.week / 60)}h ${stats.week % 60}m`,
      icon: FaChartLine,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Monthly Journey",
      value: `${Math.floor(stats.month / 60)}h ${stats.month % 60}m`,
      icon: FaLeaf,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Current Flow",
      value: `${stats.streak} days`,
      icon: FaFire,
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-2">
          Your Growth Journal
        </h2>
        <p className="text-gray-600">Track your journey of mindful cultivation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">{stat.title}</h3>
              <stat.icon className={`w-6 h-6 text-${stat.color.split('-')[1]}-500`} />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
               style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`, '--tw-gradient-from': `#${stat.color.split('-')[1]}`, '--tw-gradient-to': `#${stat.color.split('-')[3]}` }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Growth Insights</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div>
              <p className="text-emerald-700 font-medium">Daily Goal Progress</p>
              <p className="text-sm text-emerald-600">
                {Math.min(100, Math.floor((stats.today / (user.dailyGoal || 120)) * 100))}% of your daily goal
              </p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeDasharray={`${Math.min(100, Math.floor((stats.today / (user.dailyGoal || 120)) * 100))}, 100`}
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div>
              <p className="text-blue-700 font-medium">Weekly Average</p>
              <p className="text-sm text-blue-600">
                {Math.floor(stats.week / 7)} minutes per day
              </p>
            </div>
            <FaChartLine className="w-8 h-8 text-blue-500" />
          </div>

          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div>
              <p className="text-orange-700 font-medium">Current Streak</p>
              <p className="text-sm text-orange-600">
                {stats.streak} days of consistent cultivation
              </p>
            </div>
            <FaFire className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report; 