import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EnterTheGarden from './components/auth/Login';
import CultivatePath from './components/auth/Register';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TasksProvider } from './contexts/TasksContext';

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
        element={!(user && user.id) ? <EnterTheGarden /> : <Navigate to="/" />}
      />
      <Route
        path="/register"
        element={!(user && user.id) ? <CultivatePath /> : <Navigate to="/" />}
      />
      <Route
        path="/"
        element={(user && user.id) ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/tasks"
        element={(user && user.id) ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/settings"
        element={(user && user.id) ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/report"
        element={(user && user.id) ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/pomodoro"
        element={(user && user.id) ? <Dashboard /> : <Navigate to="/login" />}
      />
      {/* Redirect any other routes to the root */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-zen-beige">
      <Router>
        <AuthProvider>
          <TasksProvider>
            <AppRoutes />
          </TasksProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
