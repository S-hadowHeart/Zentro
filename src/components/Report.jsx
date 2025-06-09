import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Report() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch stats
      const statsResponse = await fetch('http://localhost:5000/api/users/pomodoro-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!statsResponse.ok) {
        throw new Error(`HTTP error! status: ${statsResponse.status}`);
      }

      const statsData = await statsResponse.json();

      // Fetch history
      const historyResponse = await fetch('http://localhost:5000/api/users/pomodoro-history/daily', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!historyResponse.ok) {
        throw new Error(`HTTP error! status: ${historyResponse.status}`);
      }

      const historyData = await historyResponse.json();

      console.log('Fetched report data:', { stats: statsData, history: historyData }); // Debug log
      setStats(statsData); // Set only the stats from the API response
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching report:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []); // Removed streak dependencies as they are not used for fetching this data

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zen-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading report: {error}</p>
        <button 
          onClick={fetchReport}
          className="mt-4 px-4 py-2 bg-zen-green text-white rounded hover:bg-zen-green-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No report data available</p>
      </div>
    );
  }

  // Calculate max count for chart scaling
  const maxCount = Math.max(...history.map(h => h.count), 1);
  const barWidth = 40;
  const chartHeight = 200;

  // Format time for display
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-zen-green">Your Growth Journal</h2>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Today's Cultivation</h3>
          <p className="text-3xl font-bold text-zen-green">{formatTime(stats.daily)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">This Week's Bloom</h3>
          <p className="text-3xl font-bold text-zen-green">{formatTime(stats.weekly)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Lifetime Harvest</h3>
          <p className="text-3xl font-bold text-zen-green">{formatTime(stats.allTime)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Current Flow</h3>
          <p className="text-3xl font-bold text-zen-green">{user.currentStreak || 0} days</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Longest Flow</h3>
          <p className="text-3xl font-bold text-zen-green">{user.longestStreak || 0} days</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Daily Intention</h3>
          <p className="text-3xl font-bold text-zen-green">{user.settings?.dailyGoal || 25} minutes</p>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Recent Growth</h3>
        <div className="w-full overflow-x-auto">
          <svg width={barWidth * history.length} height={chartHeight + 80} className="mx-auto">
            {/* Y-axis labels */}
            {[0, 25, 50, 75, 100].map((percent) => (
              <g key={percent}>
                <line
                  x1="0"
                  y1={chartHeight - (percent / 100) * chartHeight}
                  x2={barWidth * history.length}
                  y2={chartHeight - (percent / 100) * chartHeight}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
                <text
                  x="-20"
                  y={chartHeight - (percent / 100) * chartHeight + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6B7280"
                >
                  {formatTime(Math.round((percent / 100) * maxCount))}
                </text>
              </g>
            ))}
            
            {/* Bars */}
            {history.map((item, index) => (
              <g key={item.date} transform={`translate(${index * barWidth}, 0)`}>
                <rect
                  x="4"
                  y={chartHeight - (item.count / maxCount) * chartHeight}
                  width={barWidth - 8}
                  height={(item.count / maxCount) * chartHeight}
                  fill="#4A7C59"
                  rx="4"
                />
                <text
                  x={barWidth / 2}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#4A7C59"
                >
                  {item.date.slice(5)}
                </text>
                <text
                  x={barWidth / 2}
                  y={Math.max(15, chartHeight - (item.count / maxCount) * chartHeight - 5)}
                  textAnchor="middle"
                  fontSize="16"
                  fill="#000000"
                  fontWeight="bold"
                >
                  {formatTime(item.count)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Report; 