import React from 'react';
import { FaGift, FaTimes } from 'react-icons/fa';

function RewardModal({ show, onClose, reward }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out animate-bounce-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <FaTimes className="w-5 h-5" />
        </button>
        
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <FaGift className="w-10 h-10 text-emerald-500" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800">Congratulations!</h3>
          <p className="text-gray-600">You've completed your cultivation session!</p>
          
          <div className="bg-emerald-50 rounded-xl p-6 border-2 border-emerald-200">
            <p className="text-lg font-medium text-emerald-700">Your Reward:</p>
            <p className="text-xl font-bold text-emerald-800 mt-2">{reward}</p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Claim Reward
          </button>
        </div>
      </div>
    </div>
  );
}

export default RewardModal; 