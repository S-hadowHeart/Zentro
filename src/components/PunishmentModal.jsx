import React from 'react';

function PunishmentModal({ show, onClose, punishment }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex justify-center items-center p-4 z-50 transition-opacity duration-300">
      <div className="relative bg-white/10 rounded-3xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-500 ease-in-out scale-95 hover:scale-100 border border-white/20">
        <div className="absolute top-0 left-0 -mt-8 -ml-8 w-24 h-24 bg-yellow-400/50 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 -mb-8 -mr-8 w-24 h-24 bg-red-400/50 rounded-full filter blur-3xl animate-pulse delay-200"></div>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <span className="text-6xl animate-pulse">⚠️</span>
            <h2 className="text-4xl font-bold text-white mt-4">A Moment for Growth</h2>
            <p className="text-yellow-200 text-lg mt-2">A challenge to help you refocus.</p>
          </div>

          <div className="bg-white/20 p-6 rounded-xl my-6 backdrop-blur-lg">
            <p className="text-2xl font-semibold text-white text-center break-words">{punishment}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 shadow-lg hover:shadow-2xl"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default PunishmentModal;
