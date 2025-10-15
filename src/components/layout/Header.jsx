import React from 'react';
import { FaBars, FaLeaf, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeContext } from '../../contexts/ThemeContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useThemeContext();

  return (
    <header className="md:hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-b border-primary-light/30 dark:border-primary-dark/30 flex items-center justify-between p-4 sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <FaLeaf className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold text-text-color">Zen Garden</span>
      </div>
      <div className="flex items-center space-x-4">
        {user && <span className="text-sm italic">Hi, {user.username} 🌱</span>}
        <button onClick={toggleTheme} className="p-2 text-text-color hover:bg-primary-light/50 dark:hover:bg-primary-dark/50 rounded-full">
          {theme === 'light' ? <FaMoon className="w-6 h-6" /> : <FaSun className="w-6 h-6" />}
        </button>
        <button onClick={onMenuClick} className="p-2 text-text-color hover:bg-primary-light/50 dark:hover:bg-primary-dark/50 rounded-full">
          <FaBars className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
