import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EnterTheGarden from './components/auth/Login';
import CultivatePath from './components/auth/Register';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TasksProvider, useTasks } from './contexts/TasksContext';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zen-green"></div>
  </div>
);

// This component will conditionally render routes or loading
function AuthenticatedRoutes() {
  const { user, loading: authLoading } = useAuth();
  const { loading: tasksLoading } = useTasks();

  if (authLoading || tasksLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <EnterTheGarden /> : <Navigate to="/pomodoro" replace />}
      />
      <Route
        path="/register"
        element={!user ? <CultivatePath /> : <Navigate to="/pomodoro" replace />}
      />
      <Route
        path="/"
        element={user ? <Navigate to="/pomodoro" replace /> : <Navigate to="/login" replace />}
      />
      {/* All authenticated routes */}
      <Route path="/tasks" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/settings" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/report" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/pomodoro" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/pomodoro" replace />} />
    </Routes>
  );
}

// Main App component with proper provider order
const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-zen-beige">
        <AuthProvider>
          <TasksProvider>
            {/* AuthenticatedRoutes will handle its own loading */}
            <AuthenticatedRoutes />
          </TasksProvider>
        </AuthProvider>
      </div>
    </Router>
  );
};

export default App;
