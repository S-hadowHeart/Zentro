import React from 'react';
import './AnimatedBackground.css'; // Ensure the updated CSS is imported
import { useThemeContext } from '../../contexts/ThemeContext';

const AnimatedBackground = () => {
  const { theme } = useThemeContext();

  return (
    <div className={`aurora ${theme}`}>
      <div className="aurora-blob"></div>
      <div className="aurora-blob"></div>
      <div className="aurora-blob"></div>
      <div className="aurora-blob"></div>
    </div>
  );
};

export default AnimatedBackground;
