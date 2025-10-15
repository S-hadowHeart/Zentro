import React from 'react';

const ZenGarden = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-[-1] overflow-hidden bg-gradient-to-br from-zen-beige via-zen-sand to-zen-sky-light dark:from-zen-night-dark dark:via-zen-night-mid dark:to-zen-night-light">
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-zen-earth dark:from-zen-night-deep to-transparent opacity-80"></div>
      <div className="absolute w-64 h-64 bg-zen-sun rounded-full -top-16 -right-16 opacity-30 dark:opacity-20 dark:bg-zen-moon"></div>
      <div className="absolute w-96 h-96 bg-zen-sun rounded-full -bottom-32 -left-32 opacity-20 dark:opacity-10 dark:bg-zen-moon"></div>
      {/* Add more subtle, Zen-like shapes and elements here */}
    </div>
  );
};

export default ZenGarden;