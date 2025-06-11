import React from 'react';

function PunishmentModal({ show, onClose, punishment }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/75 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-sm w-full transform transition-all duration-300 ease-out scale-100 opacity-100 border border-amber-200">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent text-center mb-6 animate-fade-in-down">A Pebble in Your Path 😅</h2>
        <p className="text-lg text-gray-700 text-center mb-6">Time for mindful reflection:</p>
        <p className="text-2xl font-bold text-center text-amber-600 bg-amber-50/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-amber-100 mb-8 break-words shadow-md">{punishment}</p>
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300 shadow-xl"
        >
          Embrace Growth
        </button>
      </div>
    </div>
  );
}

export default PunishmentModal; 