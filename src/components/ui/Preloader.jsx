import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TasksContext';
import { FaLeaf } from 'react-icons/fa';

const Preloader = () => {
  const [isHiding, setIsHiding] = useState(false);
  const { loading: authLoading } = useAuth();
  const { loading: tasksLoading } = useTasks();

  useEffect(() => {
    if (!authLoading && !tasksLoading) {
      const timer = setTimeout(() => {
        setIsHiding(true);
      }, 500); // Wait a bit before hiding for smooth transition
      return () => clearTimeout(timer);
    }
  }, [authLoading, tasksLoading]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-zen-sand dark:bg-zen-night transition-opacity duration-1000 ${isHiding ? 'opacity-0' : 'opacity-100'}`}
      style={{ pointerEvents: isHiding ? 'none' : 'auto' }}
    >
      <div className="text-center">
        <div className="relative flex justify-center items-center mb-8">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-zen-green/30 to-zen-green/50 animate-pulse"></div>
          <FaLeaf className="w-16 h-16 text-white absolute" />
        </div>
        <h1 className="text-3xl font-bold text-zen-charcoal dark:text-zen-sand tracking-wider">Entering the Garden</h1>
        <p className="text-zen-charcoal/70 dark:text-zen-sand/70 mt-2">Preparing your sanctuary...</p>
      </div>
    </div>
  );
};

export default Preloader;
