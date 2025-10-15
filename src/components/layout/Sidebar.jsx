import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaClock, FaTasks, FaCog, FaChartBar, FaLeaf, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isMobile, onLinkClick }) => {
  const { logout } = useAuth();
  
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

  const baseItemClass = "flex items-center space-x-4 p-3.5 rounded-xl text-lg font-medium transition-all duration-200";
  const inactiveItemClass = "text-zen-charcoal/70 dark:text-zen-sand/60 hover:bg-black/5 dark:hover:bg-white/10 hover:text-zen-charcoal dark:hover:text-zen-sand";
  const activeItemClass = "bg-gradient-to-r from-zen-green/80 to-zen-green text-white shadow-lg shadow-zen-green/30";

  return (
    <aside className={`flex-col p-4 transition-all duration-300 bg-white/50 dark:bg-zen-night/60 backdrop-blur-xl border-r border-white/20 dark:border-zen-night-light/10 ${isMobile ? 'w-full h-full flex' : 'w-64 hidden md:flex'}`}>
      <div className="flex items-center space-x-3 p-4 mb-4">
        <div className="p-2 bg-gradient-to-br from-zen-green to-zen-green-dark rounded-xl shadow-lg">
            <FaLeaf className="w-8 h-8 text-white" />
        </div>
        <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-zen-charcoal to-zen-green bg-clip-text text-transparent dark:from-zen-sand dark:to-zen-green">Zen Garden</span>
            <span className="text-xs text-zen-charcoal/50 dark:text-zen-sand/50">v1.00</span>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `${baseItemClass} ${isActive ? activeItemClass : inactiveItemClass}`
            }
          >
            <Icon className="w-6 h-6" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/10">
        <button
          onClick={handleLogout}
          className={`${baseItemClass} w-full text-zen-charcoal/70 dark:text-zen-sand/60 hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400`}
        >
          <FaSignOutAlt className="w-6 h-6" />
          <span>Leave Garden</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
