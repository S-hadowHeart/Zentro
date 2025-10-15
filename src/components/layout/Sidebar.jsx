import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaClock, FaTasks, FaCog, FaChartBar, FaLeaf, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeContext } from '../../contexts/ThemeContext';

const Sidebar = ({ isMobile, onLinkClick }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useThemeContext();

  const navLinks = [
    { to: '/pomodoro', icon: FaClock, label: 'Zen Focus' },
    { to: '/tasks', icon: FaTasks, label: 'Cultivations' },
    { to: '/report', icon: FaChartBar, label: 'Growth Journal' },
    { to: '/settings', icon: FaCog, label: 'Arrangements' },
  ];

  const handleLogout = () => {
    if (onLinkClick) onLinkClick();
    logout();
  };

  return (
    <aside className={`bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border-r border-primary-light/30 dark:border-primary-dark/30 flex flex-col p-4 transition-all duration-300 ${isMobile ? 'w-full' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-primary-light/30 dark:border-primary-dark/30">
        <div className="flex items-center space-x-3">
            <FaLeaf className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold text-text-color">Zen Garden</span>
        </div>
        <button onClick={toggleTheme} className="p-2 text-text-color hover:bg-primary-light/50 dark:hover:bg-primary-dark/50 rounded-full">
          {theme === 'light' ? <FaMoon className="w-6 h-6" /> : <FaSun className="w-6 h-6" />}
        </button>
      </div>

      <nav className="flex-1 space-y-3 py-6">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `flex items-center space-x-4 p-3 rounded-lg text-lg font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'text-text-color dark:text-gray-300 hover:bg-primary-light dark:hover:bg-primary-dark'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-primary-light/30 dark:border-primary-dark/30">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-4 p-3 w-full rounded-lg text-lg font-medium text-text-color dark:text-gray-300 hover:bg-danger-light dark:hover:bg-danger-dark hover:text-danger dark:hover:text-danger-light transition-all duration-200"
        >
          <FaSignOutAlt className="w-6 h-6" />
          <span>Leave Garden</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
