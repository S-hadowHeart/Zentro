function PunishmentModal({ isOpen, onClose, punishment }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center animate-shake-in">
        <h2 className="text-2xl font-bold text-red-500 mb-4">⚠️ Growth Reminder!</h2>
        <div className="text-lg text-gray-700 mb-6">{punishment}</div>
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors duration-200"
        >
          Reflect
        </button>
      </div>
      <style>{`
        @keyframes shake-in {
          0% { transform: translateX(-30px); opacity: 0; }
          60% { transform: translateX(10px); opacity: 1; }
          80% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .animate-shake-in {
          animation: shake-in 0.5s cubic-bezier(.68,-0.55,.27,1.55);
        }
      `}</style>
    </div>
  );
}

export default PunishmentModal; 