function RewardModal({ isOpen, onClose, reward }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-2xl font-bold text-zen-green mb-4">Inner Peace Blossoms! 🎉</h3>
        <p className="text-gray-700 mb-6">Your harvest:</p>
        <p className="text-xl font-semibold text-zen-green mb-6">
          {reward}
        </p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-zen-green text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Cherish
        </button>
      </div>
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(.68,-0.55,.27,1.55);
        }
      `}</style>
    </div>
  );
}

export default RewardModal; 