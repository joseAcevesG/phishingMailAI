import "./Header.css";
import type { HeaderProps } from '../types/components';

export const Header: React.FC<HeaderProps> = ({ userEmail, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="user-info">
          {userEmail && <span>Logged in as {userEmail}</span>}
        </div>
        <button type="button" onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </header>
  );
};
