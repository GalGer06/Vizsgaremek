import { Link } from 'react-router-dom';
import type { AuthUser } from '../types';

type AppHeaderProps = {
  user: AuthUser | null;
  onLogout: () => void;
};

export function AppHeader({ user, onLogout }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="header-main">
        <h1>Környezetvédelem</h1>
        <p>Tanulj játékosan a Föld védelméről</p>
      </div>

      <div className="header-actions">
        {user && (
          <span className="user-pill">
            {user.username}
            {user.access ? ' (admin)' : ''}
          </span>
        )}

        {!user && (
          <Link to="/auth" className="button secondary link-button">
            Belépés / Regisztráció
          </Link>
        )}

        {user && (
          <>
            <Link to="/profile" className="button secondary link-button">
              Profil beállítások
            </Link>

            {user.access && (
              <Link to="/admin" className="button secondary link-button">
                Admin oldal
              </Link>
            )}

            <button className="button secondary" type="button" onClick={onLogout}>
              Kijelentkezés
            </button>
          </>
        )}
      </div>
    </header>
  );
}
