import React, { useState, useEffect } from 'react';
import { FaBars, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeContext } from '../../contexts/ThemeContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return `Good morning, ${user?.username || 'friend'}`;
      if (hour < 18) return `Good afternoon, ${user?.username || 'friend'}`;
      return `Good evening, ${user?.username || 'friend'}`;
    };
    setGreeting(getGreeting());
  }, [user]);

  return (
    <header className="flex items-center justify-between p-4 sm:p-6 sticky top-0 z-30 bg-white/50 dark:bg-zen-night/60 backdrop-blur-xl border-b border-white/20 dark:border-zen-night-light/10">
        <div className="flex items-center">
            <button onClick={onMenuClick} className="p-2.5 rounded-full text-zen-charcoal/70 dark:text-zen-sand/70 hover:bg-black/10 dark:hover:bg-white/10 transition-colors md:hidden">
                <FaBars className="w-5 h-5" />
            </button>
            <h1 className="hidden md:block text-2xl font-light text-zen-charcoal dark:text-zen-sand tracking-wide">{greeting} 🌱</h1>
        </div>

        <div className="md:hidden">
          <h1 className="text-xl font-light text-zen-charcoal dark:text-zen-sand tracking-wide">{greeting.split(', ')[0]}</h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={toggleTheme} className="p-3 rounded-full text-zen-charcoal/70 dark:text-zen-sand/70 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                {theme === 'light' ? <FaMoon className="w-5 h-5" /> : <FaSun className="w-5 h-5" />}
            </button>
        </div>
    </header>
  );
};

export default Header;
