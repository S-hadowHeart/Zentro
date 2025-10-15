import React from 'react';

function PunishmentModal({ show, onClose, punishment }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full transform transition-all duration-300 ease-out scale-100 opacity-100 border border-danger-light/50">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-danger to-danger-dark bg-clip-text text-transparent text-center mb-6 animate-fade-in-down">A Pebble in Your Path 😅</h2>
        <p className="text-lg text-text-light text-center mb-6">Time for mindful reflection:</p>
        <p className="text-2xl font-bold text-center text-danger-dark dark:text-danger-light bg-danger-light/50 dark:bg-danger-dark/30 backdrop-blur-sm px-4 py-3 rounded-lg border border-danger-light/30 dark:border-danger-dark/50 mb-8 break-words shadow-lg">{punishment}</p>
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-danger to-danger-dark hover:from-danger-dark hover:to-danger text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-danger-light shadow-xl"
        >
          Embrace Growth
        </button>
      </div>
    </div>
  );
}

export default PunishmentModal;
