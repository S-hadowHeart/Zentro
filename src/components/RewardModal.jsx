import React from 'react';

function RewardModal({ show, onClose, reward }) {
  if (!show) return null;

  return (
<<<<<<< HEAD
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex justify-center items-center px-4 py-6 z-[9999] transition-opacity duration-300 overscroll-none touch-none">
      <div onClick={(e) => e.stopPropagation()} className="relative bg-white/10 rounded-3xl shadow-2xl p-4 sm:p-8 w-full max-w-[330px] sm:max-w-md transform transition-all duration-500 ease-in-out scale-100 border border-white/20">
        <div className="absolute top-0 left-0 -mt-4 -ml-4 sm:-mt-8 sm:-ml-8 w-16 h-16 sm:w-24 sm:h-24 bg-green-400/50 rounded-full filter blur-3xl animate-pulse opacity-75"></div>
        <div className="absolute bottom-0 right-0 -mb-4 -mr-4 sm:-mb-8 sm:-mr-8 w-16 h-16 sm:w-24 sm:h-24 bg-blue-400/50 rounded-full filter blur-3xl animate-pulse delay-200 opacity-75"></div>

        <div className="relative z-10">
          <div className="text-center mb-4 sm:mb-6">
            <span className="text-4xl sm:text-6xl animate-bounce inline-block">🎉</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3 sm:mt-4">Congratulations!</h2>
            <p className="text-green-200 text-sm sm:text-lg mt-1 sm:mt-2">You've earned a reward!</p>
          </div>

          <div className="bg-white/20 p-3 sm:p-6 rounded-xl my-4 sm:my-6 backdrop-blur-lg">
            <p className="text-lg sm:text-2xl font-semibold text-white text-center break-words">{reward}</p>
=======
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex justify-center items-center p-2 sm:p-4 z-[60] transition-opacity duration-300">
      <div className="relative bg-white/10 rounded-3xl shadow-2xl p-4 sm:p-8 max-w-md w-full transform transition-all duration-500 ease-in-out scale-95 hover:scale-100 border border-white/20">
        <div className="absolute top-0 left-0 -mt-4 -ml-4 sm:-mt-8 sm:-ml-8 w-16 h-16 sm:w-24 sm:h-24 bg-green-400/50 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 -mb-4 -mr-4 sm:-mb-8 sm:-mr-8 w-16 h-16 sm:w-24 sm:h-24 bg-blue-400/50 rounded-full filter blur-3xl animate-pulse delay-200"></div>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <span className="text-5xl sm:text-6xl animate-bounce">🎉</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4">Congratulations!</h2>
            <p className="text-green-200 text-base sm:text-lg mt-2">You've earned a reward!</p>
          </div>

          <div className="bg-white/20 p-4 sm:p-6 rounded-xl my-6 backdrop-blur-lg">
            <p className="text-xl sm:text-2xl font-semibold text-white text-center break-words">{reward}</p>
>>>>>>> 61448fcb67120ffd147b1541b0200dc3451d8c97
          </div>

          <button
            onClick={onClose}
<<<<<<< HEAD
            className="w-full bg-green-500 active:bg-green-600 text-white font-bold py-2.5 sm:py-3 px-6 rounded-xl text-base sm:text-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg"
=======
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg hover:shadow-2xl"
>>>>>>> 61448fcb67120ffd147b1541b0200dc3451d8c97
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}

export default RewardModal;
