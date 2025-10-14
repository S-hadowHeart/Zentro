import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TasksContext';

const Preloader = () => {
  const [isHiding, setIsHiding] = useState(false);
  const { loading: authLoading } = useAuth();
  const { loading: tasksLoading } = useTasks();

  useEffect(() => {
    // When loading is finished, start the fade-out
    if (!authLoading && !tasksLoading) {
      setIsHiding(true);
    }
  }, [authLoading, tasksLoading]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background-color transition-opacity duration-1000 ${isHiding ? 'opacity-0' : 'opacity-100'}`}
      style={{ pointerEvents: isHiding ? 'none' : 'auto' }} // Disable interaction when hidden
    >
      <div className="flex flex-col items-center">
        <img src="/leaf-solid.svg" alt="Loading" className="h-16 w-16 mb-4 animate-pulse" />
        <p className="text-text-color text-lg">Cultivating your garden...</p>
      </div>
    </div>
  );
};

export default Preloader;