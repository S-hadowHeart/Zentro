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
        element={!(user && user._id) ? <EnterTheGarden /> : <Navigate to="/" />}
      />
      <Route
        path="/register"
        element={!(user && user._id) ? <CultivatePath /> : <Navigate to="/" />}
      />
      <Route
        path="/"
        element={(user && user._id) ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/tasks"
        element={(user && user._id) ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/settings"
        element={(user && user._id) ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/report"
        element={(user && user._id) ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/pomodoro"
        element={(user && user._id) ? <Dashboard /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <TasksProvider>
        <Router>
          <div className="min-h-screen bg-zen-beige">
            <AppRoutes />
          </div>
        </Router>
      </TasksProvider>
    </AuthProvider>
  );
}

export default App;
