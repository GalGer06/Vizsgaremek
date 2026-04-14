import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { TOKEN_KEY, USER_KEY } from './constants';
import { AchievementsPage } from './pages/AchievementsPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { DailyTasksPage } from './pages/DailyTasksPage';
import { FriendsPage } from './pages/FriendsPage';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { TopicQuestionsPage } from './pages/TopicQuestionsPage';
import { TopicsPage } from './pages/TopicsPage';
import { TicketsPage } from './pages/TicketsPage';
import type { AuthResponse, AuthUser } from './types';

export function AppShell() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (!savedUser) {
      return null;
    }
    try {
      return JSON.parse(savedUser) as AuthUser;
    } catch {
      return null;
    }
  });

  const handleAuthSuccess = (result: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, result.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    setUser(result.user);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const handleUserUpdate = (nextUser: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="app-container">
        <AppHeader user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/topics/:topicSlug" element={<TopicQuestionsPage user={user} />} />
          <Route path="/achievements" element={user ? <AchievementsPage user={user} /> : <Navigate to="/auth" replace />} />
          <Route path="/daily-tasks" element={<DailyTasksPage />} />
          <Route path="/friends" element={user ? <FriendsPage user={user} /> : <Navigate to="/auth" replace />} />
          <Route path="/tickets" element={user ? <TicketsPage user={user} /> : <Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/admin" element={user?.access ? <AdminPage user={user} /> : <Navigate to="/auth" replace />} />
          <Route path="/profile" element={user ? <ProfilePage user={user} onUserUpdate={handleUserUpdate} /> : <Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {showBackToTop && (
        <button 
          className="back-to-top" 
          onClick={scrollToTop}
          aria-label="Vissza a tetejére"
        >
          ↑
        </button>
      )}

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Környezetvédelem</h4>
            <p>Tanulj játékosan a Föld védelméről.</p>
          </div>
          <div className="footer-section">
            <h4>Kapcsolat</h4>
            <p>Email: rikimik@vizsgaremek.local</p>
            <p>Tel: +36 1 234 5678</p>
          </div>
          <div className="footer-section">
            <h4>Linkek</h4>
            <p><a href="/">Főoldal</a></p>
            <p><a href="/topics">Témakörök</a></p>
            <p><a href="/daily-tasks">Napi feladatok</a></p>
            <p><a href="/gyik">Gyakran ismételt kérdések</a></p>
            <p><a href="/about">Rólunk</a></p>
          </div>
          <div className="footer-section">
            <h4>Közösségi média</h4>
            <p><a href="https://facebook.com/vizsgaremek" target="_blank" rel="noopener noreferrer">Facebook</a></p>
            <p><a href="https://twitter.com/vizsgaremek" target="_blank" rel="noopener noreferrer">Twitter</a></p>
            <p><a href="https://instagram.com/vizsgaremek" target="_blank" rel="noopener noreferrer">Instagram</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Vizsgaremek - Minden jog fenntartva</p>
        </div>
      </footer>
    </>
  );
}
