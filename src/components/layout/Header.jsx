import React from 'react';
import { FaBars, FaLeaf } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="md:hidden bg-white/60 backdrop-blur-lg border-b border-emerald-100 flex items-center justify-between p-4 sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <FaLeaf className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold text-text-color">Zen Garden</span>
      </div>
      <div className="flex items-center space-x-4">
        {user && <span className="text-sm italic">Hi, {user.username} 🌱</span>}
        <button onClick={onMenuClick} className="p-2 text-text-color hover:bg-primary/10 rounded-full">
          <FaBars className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
