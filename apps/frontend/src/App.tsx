import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import Home from './pages/Home';
import { Result } from './pages/Result';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For development, since backend is not ready yet
        setIsAuthenticated(true);
        setUserEmail('demo@example.com');
        setLoading(false);
        
        // Uncomment this when backend is ready
        /*
        const response = await fetch('/api/auth/status');
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.authenticated);
          setUserEmail(data.email);
        }
        */
      } catch (error) {
        console.error('Auth check failed:', error);
        // For development, set demo state
        setIsAuthenticated(true);
        setUserEmail('demo@example.com');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    // For development
    setIsAuthenticated(true);
    setUserEmail('demo@example.com');
    
    // Uncomment when backend is ready
    // window.location.href = '/api/auth/login';
  };

  const handleLogout = async () => {
    try {
      // For development
      setIsAuthenticated(false);
      setUserEmail(undefined);
      
      // Uncomment when backend is ready
      /*
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUserEmail(undefined);
      */
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        <Header userEmail={userEmail} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            <Route
              path="/login"
              element={
                <Login
                  isAuthenticated={isAuthenticated}
                  onLogin={handleLogin}
                />
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/result"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Result />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
