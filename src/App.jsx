import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EnterTheGarden from './components/auth/Login';
import CultivatePath from './components/auth/Register';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TasksProvider } from './contexts/TasksContext';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zen-green"></div>
  </div>
);

// Routes component
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
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
      <Route
        path="/tasks"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/settings"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/report"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/pomodoro"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/pomodoro" replace />} />
    </Routes>
  );
};

// Main App component
const App = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <AuthProvider>
          <TasksProvider>
            <div className="min-h-screen bg-zen-beige">
              <AppRoutes />
            </div>
          </TasksProvider>
        </AuthProvider>
      </Suspense>
    </Router>
  );
};

export default App;
