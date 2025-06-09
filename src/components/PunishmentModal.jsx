function PunishmentModal({ isOpen, onClose, punishment }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-2xl font-bold text-red-500 mb-4">A Pebble in Your Path 😅</h3>
        <p className="text-gray-700 mb-6">Time for reflection:</p>
        <p className="text-xl font-semibold text-red-500 mb-6">
          {punishment}
        </p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Embrace Growth
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