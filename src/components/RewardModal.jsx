import React from 'react';

function RewardModal({ show, onClose, reward }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full transform transition-all duration-300 ease-out scale-100 opacity-100 border border-primary-light">
        <h2 className="text-3xl font-extrabold text-primary text-center mb-6 animate-fade-in-down">Inner Peace Blossoms! 🎉</h2>
        <p className="text-lg text-text-light text-center mb-6">Your harvest:</p>
        <p className="text-2xl font-bold text-center text-primary-dark bg-primary-light px-4 py-3 rounded-lg border border-primary-light/50 mb-8 break-words shadow-md">{reward}</p>
        <button
          onClick={onClose}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-light shadow-xl"
        >
          Cherish
        </button>
      </div>
    </div>
  );
}

export default RewardModal;
