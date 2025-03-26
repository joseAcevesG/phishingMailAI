import { Navigate } from 'react-router-dom';
import './Login.css';

interface LoginProps {
  isAuthenticated: boolean;
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ isAuthenticated, onLogin }) => {
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome</h1>
        <p>Please log in to analyze email files</p>
        <button type="button" onClick={onLogin} className="login-button">
          Login with Magic Link
        </button>
      </div>
    </div>
  );
};
