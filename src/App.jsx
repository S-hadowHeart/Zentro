import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TasksProvider } from './contexts/TasksContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PomodoroProvider, usePomodoro } from './contexts/PomodoroContext';
import Preloader from './components/ui/Preloader';
import EnterTheGarden from './components/auth/Login';
import CultivatePath from './components/auth/Register';
import Dashboard from './components/Dashboard';
import LandingPage from './components/auth/LandingPage';
import AnimatedBackground from './components/ui/AnimatedBackground';
import RewardModal from './components/RewardModal';
import PunishmentModal from './components/PunishmentModal';

// A wrapper for routes that should only be accessible to authenticated users
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/" replace />;
}

// A wrapper for routes that should only be accessible to unauthenticated users
function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/pomodoro" replace />;
}

// A component to handle routes based on authentication status
function AppRoutes() {
  return (
    <div className="relative z-10">
      <Routes>
        <Route path="/login" element={<PublicRoute><EnterTheGarden /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><CultivatePath /></PublicRoute>} />
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

// Wrapper to render main content and global modals
function AppContent() {
  const {
    showRewardModal,
    closeRewardModal,
    currentReward,
    showPunishmentModal,
    closePunishmentModal,
    currentPunishment,
  } = usePomodoro();

  return (
    <>
      <Preloader />
      <div className="min-h-screen bg-background text-text font-sans">
        <AnimatedBackground />
        <AppRoutes />
      </div>
      <RewardModal show={showRewardModal} onClose={closeRewardModal} reward={currentReward} />
      <PunishmentModal show={showPunishmentModal} onClose={closePunishmentModal} punishment={currentPunishment} />
    </>
  );
}

// Main App component with providers
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <TasksProvider>
          <PomodoroProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </PomodoroProvider>
        </TasksProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
