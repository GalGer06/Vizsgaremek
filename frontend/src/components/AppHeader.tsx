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
    if (location.pathname.startsWith('/topics/') && location.pathname.split('/').length > 2) {
      const confirmExit = window.confirm('Biztosan ki szeretnél lépni? A folyamatban lévő feladatok elvesznek.');
      if (!confirmExit) return;
    }
    navigate('/');
  };

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/admin');
  };

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/admin');
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
        {user ? (
          <>
            {user.access ? (
              <button 
                type="button"
                className="role-badge admin"
                onClick={handleAdminClick}
                title="Admin panel megnyitása"
              >
                ADMIN
              </button>
            ) : (
              <div className="role-badge user" title="Felhasználói fiók">
                FELHASZNÁLÓ
              </div>
            )}

            <button 
              type="button" 
              onClick={() => navigate('/profile')} 
              className="button secondary link-button"
            >
              Profil
            </button>

            <button 
              type="button" 
              onClick={onLogout} 
              className="button secondary link-button"
            >
              Kijelentkezés
            </button>
          </>
        ) : (
          <button 
            type="button" 
            onClick={() => navigate('/auth')} 
            className="button secondary link-button"
          >
            Belépés / Regisztráció
          </button>
        )}
      </div>
    </header>
  );
}
