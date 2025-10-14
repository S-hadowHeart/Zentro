
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaClock, FaTasks, FaCog, FaChartBar, FaLeaf, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isMobile, onLinkClick }) => {
  const { logout } = useAuth();
  const location = useLocation();

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
    <aside className={`bg-white/60 backdrop-blur-lg border-r border-emerald-100 flex flex-col p-4 transition-all duration-300 ${isMobile ? 'w-full' : 'w-64'}`}>
      <div className="flex items-center space-x-3 p-4 border-b border-emerald-100">
        <FaLeaf className="w-10 h-10 text-primary" />
        <span className="text-2xl font-bold text-text-color">Zen Garden</span>
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
                  ? 'bg-primary/90 text-white shadow-lg'
                  : 'text-text-color hover:bg-primary/10'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-emerald-100">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-4 p-3 w-full rounded-lg text-lg font-medium text-text-color hover:bg-danger/10 hover:text-danger transition-all duration-200"
        >
          <FaSignOutAlt className="w-6 h-6" />
          <span>Leave Garden</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
