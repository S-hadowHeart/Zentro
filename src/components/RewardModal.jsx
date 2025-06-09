import React from 'react';

function RewardModal({ show, onClose, reward }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full transform transition-all duration-300 ease-out scale-100 opacity-100 border border-emerald-200">
        <h2 className="text-3xl font-extrabold text-emerald-700 text-center mb-6 animate-fade-in-down">Inner Peace Blossoms! 🎉</h2>
        <p className="text-lg text-gray-700 text-center mb-6">Your harvest:</p>
        <p className="text-2xl font-bold text-center text-emerald-600 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100 mb-8 break-words shadow-md">{reward}</p>
        <button
          onClick={onClose}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-300 shadow-xl"
        >
          Cherish
        </button>
      </div>
    </div>
  );
}

export default RewardModal; 