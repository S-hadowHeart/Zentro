import React from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden bg-background-color">
      <div
        className="blob bg-primary"
        style={{
          width: '400px',
          height: '400px',
          top: '20%',
          left: '30%',
          animation: 'move 15s infinite ease-in-out',
        }}
      ></div>
      <div
        className="blob bg-secondary"
        style={{
          width: '300px',
          height: '300px',
          top: '50%',
          left: '70%',
          animation: 'move 20s infinite ease-in-out reverse',
        }}
      ></div>
      <div
        className="blob bg-accent"
        style={{
          width: '250px',
          height: '250px',
          top: '80%',
          left: '40%',
          animation: 'move 18s infinite ease-in-out',
        }}
      ></div>
    </div>
  );
};

export default AnimatedBackground;
