import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TasksContext';

const Preloader = () => {
  const [isHiding, setIsHiding] = useState(false);
  const { loading: authLoading } = useAuth();
  const { loading: tasksLoading } = useTasks();

  useEffect(() => {
    if (!authLoading && !tasksLoading) {
      const timer = setTimeout(() => {
        setIsHiding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading, tasksLoading]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-1000 ${isHiding ? 'opacity-0' : 'opacity-100'}`}
      style={{ pointerEvents: isHiding ? 'none' : 'auto' }}
    >
      <div className="text-center">
        <img src="leaf-solid.svg" alt="Loading Zen Garden" className="mx-auto h-48 w-48 rounded-full shadow-2xl animate-pulse" />
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-8">Entering the Zen Garden</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Preparing your sanctuary for focus and growth...</p>
        <div className="mt-8">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary dark:border-primary-light mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
