import React, { useState, useEffect } from 'react';
import { FaBars, FaSun, FaMoon, FaLeaf } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeContext } from '../../contexts/ThemeContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return `Good morning, ${user?.username || 'Zen Master'}`;
      if (hour < 18) return `Good afternoon, ${user?.username || 'Zen Master'}`;
      return `Good evening, ${user?.username || 'Zen Master'}`;
    };
    setGreeting(getGreeting());
  }, [user]);

  return (
    <header className="flex items-center justify-between p-4 sticky top-0 z-30 md:hidden bg-transparent">
        <div className="flex items-center space-x-2">
            <FaLeaf className="w-6 h-6 text-primary dark:text-primary-light" />
            <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">ZenFlow</span>
        </div>
        <div className="flex items-center space-x-4">
            <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 font-medium">
                {greeting} 🌱
            </p>
            <button onClick={toggleTheme} className="p-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors">
                {theme === 'light' ? <FaMoon className="w-5 h-5" /> : <FaSun className="w-5 h-5" />}
            </button>
            <button onClick={onMenuClick} className="p-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors md:hidden">
                <FaBars className="w-5 h-5" />
            </button>
        </div>
    </header>
  );
};

export default Header;
