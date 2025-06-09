function RewardModal({ isOpen, onClose, reward }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center animate-bounce-in">
        <h2 className="text-2xl font-bold text-zen-green mb-4">🎉 Blossom!</h2>
        <div className="text-lg text-gray-700 mb-6">{reward}</div>
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-zen-green text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors duration-200"
        >
          Embrace
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