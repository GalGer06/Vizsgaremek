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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isEnglish, setIsEnglish] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu on navigation
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    const checkGoogleTranslate = () => {
      const googleCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (googleCombo) {
        setIsEnglish(googleCombo.value === 'en');
      }
    };

    const interval = setInterval(checkGoogleTranslate, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = (e: React.MouseEvent) => {
    e.preventDefault();
    
    let googleCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    if (!googleCombo) {
      // If combo not found, it might be in the hidden element or hasn't loaded yet
      const hiddenElement = document.getElementById('google_translate_element_hidden');
      if (hiddenElement) {
        googleCombo = hiddenElement.querySelector('.goog-te-combo') as HTMLSelectElement;
      }
    }

    if (googleCombo) {
      if (isEnglish) {
        console.log('Resetting to original Hungarian...');
        googleCombo.value = 'hu';
        googleCombo.dispatchEvent(new Event('change'));

        // Clear cookies
        const domains = [window.location.hostname, "." + window.location.hostname, ""];
        domains.forEach(domain => {
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${domain ? ' domain=' + domain + ';' : ''}`;
        });

        setIsEnglish(false);
        // Sometimes a reload is needed for Google Translate to fully stop
        setTimeout(() => window.location.reload(), 100);
      } else {
        console.log('Switching to English...');
        googleCombo.value = 'en';
        googleCombo.dispatchEvent(new Event('change'));
        setIsEnglish(true);
        document.cookie = `googtrans=/hu/en; path=/`;
      }
    } else {
      console.log('Google Translate not ready yet.');
    }
  };

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
    <header className={`app-header ${isEnglish ? 'compact' : ''}`} style={{
      padding: isEnglish ? '8px 20px' : '12px 20px',
      transition: 'all 0.3s ease',
      minHeight: 'auto'
    }}>
      <div 
        className="header-title-link" 
        onClick={handleLogoClick} 
        role="button" 
        tabIndex={0} 
        onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
      >
        <div className="header-main">
          <h1 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/secret');
            }}
            style={{ 
              fontSize: isEnglish ? '18px' : '22px', 
              transition: 'font-size 0.3s ease',
              margin: 0,
              cursor: 'pointer'
            }}
          >Környezetvédelem</h1>
          {!isEnglish && (
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Tanulj játékosan a Föld védelméről</p>
          )}
        </div>
      </div>

      <button 
        className="mobile-menu-toggle" 
        onClick={toggleMobileMenu}
        aria-label="Menü megnyitása"
        style={{ color: 'white', fontSize: '28px' }}
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      <div className={`header-actions ${mobileMenuOpen ? 'open' : ''}`} style={mobileMenuOpen ? {
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: '80px',
        left: '0',
        right: '0',
        backgroundColor: '#243b55',
        padding: '20px',
        gap: '15px',
        borderBottom: '4px solid #8b5e3c',
        boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
        zIndex: 1000,
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto'
      } : {}}>
        <div id="google_translate_element_hidden" style={{ 
          position: 'absolute', 
          top: '-1000px', 
          opacity: 0, 
          pointerEvents: 'none' 
        }}></div>
        
        {/* Language selector - always first */}
        <button 
          type="button" 
          className="button secondary language-toggle"
          style={{ 
            marginRight: mobileMenuOpen ? '0' : '15px',
            width: mobileMenuOpen ? '100%' : 'auto',
            justifyContent: 'center',
            padding: '10px 16px', 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            borderRadius: '20px',
            border: `2px solid ${isEnglish ? '#2e7d32' : '#ccc'}`,
            backgroundColor: isEnglish ? '#e8f5e9' : '#fff',
            color: '#000000',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onClick={toggleLanguage}
        >
          <span style={{ filter: isEnglish ? 'none' : 'grayscale(0.3)', color: '#000000' }}>🌐</span>
          <span style={{ color: '#000000' }}>{isEnglish ? 'ENGLISH' : 'MAGYAR'}</span>
          <span style={{ 
            fontSize: '10px', 
            opacity: 0.8,
            marginLeft: '4px',
            color: '#000000'
          }}>
            {isEnglish ? '(Vissza)' : '(Translate)'}
          </span>
        </button>
        
        {user ? (
          <>
            <button 
              type="button" 
              onClick={handleLogoClick} 
              className={`button secondary link-button ${location.pathname === '/' ? 'active' : ''}`}
              style={mobileMenuOpen ? { width: '100%', margin: 0 } : {}}
            >
              Főoldal
            </button>

            <button 
              type="button" 
              onClick={() => navigate('/tickets')} 
              className={`button secondary link-button ${location.pathname === '/tickets' ? 'active' : ''}`}
              style={mobileMenuOpen ? { width: '100%', margin: 0 } : {}}
            >
              Ticket
            </button>

            {user.access ? (
              <button 
                type="button"
                className="role-badge admin"
                onClick={handleAdminClick}
                title="Admin panel megnyitása"
                style={mobileMenuOpen ? { width: '100%', margin: 0, padding: '12px' } : {}}
              >
                ADMIN
              </button>
            ) : (
              <div className="role-badge user" title="Felhasználói fiók" style={mobileMenuOpen ? { width: '100%', margin: 0, padding: '12px' } : {}}>
                FELHASZNÁLÓ
              </div>
            )}

            <button 
              type="button" 
              onClick={() => navigate('/profile')} 
              className={`button secondary link-button ${location.pathname === '/profile' ? 'active' : ''}`}
              style={mobileMenuOpen ? { width: '100%', margin: 0 } : {}}
            >
              Profil
            </button>

            <button 
              type="button" 
              onClick={() => setShowLogoutModal(true)} 
              className="button secondary link-button logout-btn"
              style={mobileMenuOpen ? { width: '100%', margin: 0, backgroundColor: '#ff4444' } : {}}
            >
              Kijelentkezés
            </button>
          </>
        ) : (
          <button 
            type="button" 
            onClick={() => navigate('/auth')} 
            className="button secondary link-button"
            style={mobileMenuOpen ? { width: '100%', margin: 0 } : {}}
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
              <button className="button small" style={{ backgroundColor: '#2c4a6b', borderBottomColor: '#1a2a44', padding: '6px 12px' }} onClick={() => setShowLogoutModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Biztosan ki szeretnél jelentkezni a fiókodból?</p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="button" style={{ backgroundColor: '#58cc02', borderBottomColor: '#3e8e02' }} onClick={() => setShowLogoutModal(false)}>Mégse</button>
              <button className="button danger" style={{ backgroundColor: '#ff4444' }} onClick={handleLogout}>Kijelentkezés</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
