import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EnterTheGarden from './components/auth/Login';
import CultivatePath from './components/auth/Register';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TasksProvider } from './contexts/TasksContext';

// Separate the routes into their own component to prevent initialization issues
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zen-green"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <EnterTheGarden /> : <Navigate to="/" />}
      />
      <Route
        path="/register"
        element={!user ? <CultivatePath /> : <Navigate to="/" />}
      />
      <Route
        path="/"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/tasks"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/settings"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/report"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/pomodoro"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      {/* Redirect any other routes to the root */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// Main App component with proper provider order
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zen-beige">
        <AuthProvider>
          <TasksProvider>
            <AppRoutes />
          </TasksProvider>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
