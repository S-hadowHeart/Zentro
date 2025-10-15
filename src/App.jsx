import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TasksProvider } from './contexts/TasksContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PomodoroProvider } from './contexts/PomodoroContext';
import Preloader from './components/ui/Preloader';
import EnterTheGarden from './components/auth/Login';
import CultivatePath from './components/auth/Register';
import Dashboard from './components/Dashboard';
import LandingPage from './components/auth/LandingPage';
import AnimatedBackground from './components/ui/AnimatedBackground';

// A wrapper for routes that should only be accessible to authenticated users
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Preloader will be shown
  }

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
        <Route
          path="/login"
          element={<PublicRoute><EnterTheGarden /></PublicRoute>}
        />
        <Route
          path="/register"
          element={<PublicRoute><CultivatePath /></PublicRoute>}
        />
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />

        {/* Authenticated routes rendered within the Dashboard */}
        <Route
          path="/*"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
      </Routes>
    </div>
  );
}

// Main App component with providers and preloader
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <TasksProvider>
          <PomodoroProvider>
            <ThemeProvider>
              <Preloader />
              <div className="min-h-screen bg-background text-text font-sans">
                <AnimatedBackground />
                <AppRoutes />
              </div>
            </ThemeProvider>
          </PomodoroProvider>
        </TasksProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
