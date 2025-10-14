import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TasksProvider } from './contexts/TasksContext';
import Preloader from './components/ui/Preloader';
import EnterTheGarden from './components/auth/Login';
import CultivatePath from './components/auth/Register';
import Dashboard from './components/Dashboard';
import LandingPage from './components/auth/LandingPage';

// A component to handle routes based on authentication status
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <EnterTheGarden /> : <Navigate to="/pomodoro" replace />} />
      <Route path="/register" element={!user ? <CultivatePath /> : <Navigate to="/pomodoro" replace />} />
      <Route path="/" element={user ? <Navigate to="/pomodoro" replace /> : <LandingPage />} />

      {/* Authenticated routes */}
      <Route path="/tasks" element={user ? <Dashboard /> : <Navigate to="/" replace />} />
      <Route path="/settings" element={user ? <Dashboard /> : <Navigate to="/" replace />} />
      <Route path="/report" element={user ? <Dashboard /> : <Navigate to="/" replace />} />
      <Route path="/pomodoro" element={user ? <Dashboard /> : <Navigate to="/" replace />} />

      {/* Fallback redirect */}
      <Route path="*" element={user ? <Navigate to="/pomodoro" replace /> : <Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App component with providers and preloader
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <TasksProvider>
          <Preloader />
          <div className="min-h-screen bg-background-color text-text-color">
            <AppRoutes />
          </div>
        </TasksProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
