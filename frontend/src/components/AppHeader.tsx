import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import type { AuthUser } from '../types';

type AppHeaderProps = {
  user: AuthUser | null;
  onLogout: () => void;
};

export function AppHeader({ user, onLogout }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleLogout = () => {
    onLogout();
    setShowLogoutModal(false);
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
            <button 
              type="button" 
              onClick={handleLogoClick} 
              className="button secondary link-button"
            >
              Főoldal
            </button>

            <button 
              type="button" 
              onClick={() => navigate('/tickets')} 
              className={`button secondary link-button ${location.pathname === '/tickets' ? 'active' : ''}`}
            >
              Ticket
            </button>

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
              onClick={() => setShowLogoutModal(true)} 
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

      {showLogoutModal && (
        <div className="user-details-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="user-details-modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Kijelentkezés</h3>
              <button className="button secondary small" onClick={() => setShowLogoutModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Biztosan ki szeretnél jelentkezni a fiókodból?</p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="button secondary" onClick={() => setShowLogoutModal(false)}>Mégse</button>
              <button className="button danger" style={{ backgroundColor: '#ff4444' }} onClick={handleLogout}>Kijelentkezés</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
