import { useLocation, useNavigate } from 'react-router-dom';
import type { AuthUser } from '../types';

type AppHeaderProps = {
  user: AuthUser | null;
  onLogout: () => void;
};

export function AppHeader({ user, onLogout }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    // Check if we are on a page that might have unsaved progress
    if (location.pathname.startsWith('/topics/') && location.pathname.split('/').length > 2) {
      const confirmExit = window.confirm('Biztosan ki szeretnél lépni? A folyamatban lévő feladatok elvesznek.');
      if (!confirmExit) return;
    }
    navigate('/');
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  return (
    <header className="app-header">
      <div 
        className="header-title-link" 
        onClick={handleLogoClick} 
        role="button" 
        tabIndex={0} 
        onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
      >
        <div className="header-main">
          <h1>Környezetvédelem</h1>
          <p>Tanulj játékosan a Föld védelméről</p>
        </div>
      </div>

      <div className="header-actions">
        {user && (
          <span className="user-pill">
            {user.username}
            {user.access ? ' (admin)' : ''}
          </span>
        )}

        {!user ? (
          <button onClick={handleAuthClick} className="button secondary link-button">
            Belépés / Regisztráció
          </button>
        ) : (
          <button onClick={onLogout} className="button secondary link-button">
            Kijelentkezés
          </button>
        )}
      </div>
    </header>
  );
}
