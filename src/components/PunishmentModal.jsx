import React from 'react';

function PunishmentModal({ show, onClose, punishment }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full transform transition-all duration-300 ease-out scale-100 opacity-100 border border-red-200">
        <h2 className="text-3xl font-extrabold text-red-700 text-center mb-6 animate-fade-in-down">A Thorn on the Path 🍂</h2>
        <p className="text-lg text-gray-700 text-center mb-6">Time for reflection:</p>
        <p className="text-2xl font-bold text-center text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-100 mb-8 break-words shadow-md">{punishment}</p>
        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300 shadow-xl"
        >
          Contemplate the Thorn
        </button>
      </div>
    </div>
  );
}

export default PunishmentModal; 