import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TasksProvider } from './contexts/TasksContext';
import { ThemeProvider } from './contexts/ThemeContext';
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

// A component for the fallback redirect
function FallbackRedirect() {
    const { user } = useAuth();
    return user ? <Navigate to="/pomodoro" replace /> : <Navigate to="/" replace />;
}

// A component to handle routes based on authentication status
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><EnterTheGarden /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><CultivatePath /></PublicRoute>} />
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />

      {/* Authenticated routes */}
      <Route path="/tasks" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/report" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/pomodoro" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

      {/* Fallback redirect */}
      <Route path="*" element={<FallbackRedirect />} />
    </Routes>
  );
}

// Main App component with providers and preloader
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <TasksProvider>
          <ThemeProvider>
            <Preloader />
            <div className="min-h-screen bg-background-color text-text-color">
              <AnimatedBackground />
              <AppRoutes />
            </div>
          </ThemeProvider>
        </TasksProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
