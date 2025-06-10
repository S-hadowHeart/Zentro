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
        element={!user ? <EnterTheGarden /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={!user ? <CultivatePath /> : <Navigate to="/" replace />}
      />
      <Route
        path="/"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Wrap the app with error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-zen-green text-white rounded hover:bg-opacity-90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App component with proper provider order
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-zen-beige">
          <AuthProvider>
            <TasksProvider>
              <AppRoutes />
            </TasksProvider>
          </AuthProvider>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
