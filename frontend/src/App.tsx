import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import './App.css';

type Topic = {
  slug: string;
  title: string;
  icon: string;
  keywords: string[];
};

type Question = {
  id: number;
  title: string;
  question: string;
  answers: Record<string, string>;
  correct: string;
  funfact: string;
  history: string;
};

type AuthUser = {
  id: number;
  username: string;
  email: string;
  access: boolean;
};

type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

type ProfileResponse = {
  id: number;
  name: string;
  username: string;
  email: string;
  access: boolean;
};

type AdminUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  access: boolean;
  createdAt: string;
};

type Achievement = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

type AchievementsResponse = {
  userId: number;
  achievements: Achievement[];
};

const API_BASE_URL = 'http://localhost:3000';

const TOPICS: Topic[] = [
  { slug: 'alapfogalmak', title: 'Alapfogalmak', icon: '🌍', keywords: ['alapfogalmak', 'alap', 'bevezető'] },
  { slug: 'ujrahasznositas', title: 'Újrahasznosítás', icon: '♻️', keywords: ['újrahasznosítás', 'szelektív'] },
  { slug: 'vizvedelem', title: 'Vízvédelem', icon: '💧', keywords: ['vízvédelem', 'víz'] },
  { slug: 'erdok', title: 'Erdők', icon: '🌳', keywords: ['erdők', 'erdő', 'fa'] },
];

const ACHIEVEMENT_TEMPLATES: Achievement[] = [
  { id: 1, title: 'Első lépések', description: 'Lépj be először az alkalmazásba.', completed: true },
  { id: 2, title: 'Kíváncsi felfedező', description: 'Nyiss meg legalább 1 témát.', completed: true },
  { id: 3, title: 'Hulladékharcos', description: 'Olvass el 5 újrahasznosításhoz kapcsolódó kérdést.', completed: false },
  { id: 4, title: 'Vízőr', description: 'Nyisd meg a Vízvédelem témát 3 alkalommal.', completed: false },
  { id: 5, title: 'Erdőbarát', description: 'Olvass el 10 erdőkkel kapcsolatos kérdést.', completed: false },
  { id: 6, title: 'Kitartó tanuló', description: 'Lépj be 7 egymást követő napon.', completed: false },
  { id: 7, title: 'Napi hős', description: 'Teljesíts 3 napi feladatot.', completed: false },
  { id: 8, title: 'Közösségi tag', description: 'Adj hozzá legalább 1 barátot.', completed: false },
  { id: 9, title: 'Pontgyűjtő', description: 'Gyűjts össze 500 pontot.', completed: false },
  { id: 10, title: 'Öko mester', description: 'Nyisd meg az összes témát legalább egyszer.', completed: false },
];

const TOKEN_KEY = 'wdad_access_token';
const USER_KEY = 'wdad_user';

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function AppHeader({ user, onLogout }: { user: AuthUser | null; onLogout: () => void }) {
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

function ProfilePage({ user, onUserUpdate }: { user: AuthUser | null; onUserUpdate: (nextUser: AuthUser) => void }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/user/${user.id}`);
        if (!response.ok) {
          throw new Error('Nem sikerült betölteni a profilt.');
        }

        const profile = (await response.json()) as ProfileResponse;
        setName(profile.name ?? '');
        setUsername(profile.username ?? '');
        setEmail(profile.email ?? '');
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Ismeretlen hiba történt.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [user]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          username,
          email,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Nem sikerült a profil mentése.');
      }

      const updatedProfile = (await response.json()) as ProfileResponse;
      onUserUpdate({
        id: updatedProfile.id,
        username: updatedProfile.username,
        email: updatedProfile.email,
        access: updatedProfile.access,
      });
      setSuccess('A profil sikeresen frissítve.');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <section className="auth-wrapper">
      <div className="section-header">
        <h2>Profil beállítások</h2>
        <Link to="/" className="button secondary link-button">Vissza</Link>
      </div>

      {loading && <p className="message">Profil betöltése...</p>}

      {!loading && (
        <form className="auth-form" onSubmit={submit}>
          <input
            placeholder="Teljes név"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            placeholder="Felhasználónév"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            placeholder="Email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {error && <p className="message error">{error}</p>}
          {success && <p className="message">{success}</p>}

          <button className="button" disabled={saving} type="submit">
            {saving ? 'Mentés...' : 'Változtatások mentése'}
          </button>
        </form>
      )}
    </section>
  );
}

function AdminPage({ user }: { user: AuthUser | null }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [usernameSearch, setUsernameSearch] = useState('');

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      setError('');

      try {
        const [usersResponse, questionsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/user`),
          fetch(`${API_BASE_URL}/feladatok`),
        ]);

        if (!usersResponse.ok || !questionsResponse.ok) {
          throw new Error('Nem sikerült betölteni az admin adatokat.');
        }

        const usersData = (await usersResponse.json()) as AdminUser[];
        const questionsData = (await questionsResponse.json()) as Question[];

        setUsers(usersData);
        setQuestions(questionsData);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Ismeretlen hiba történt.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.access) {
      void loadAdminData();
    }
  }, [user]);

  if (!user?.access) {
    return (
      <section>
        <div className="section-header">
          <h2>Admin oldal</h2>
          <Link to="/" className="button secondary link-button">Vissza</Link>
        </div>
        <p className="message error">Nincs admin jogosultságod ehhez az oldalhoz.</p>
      </section>
    );
  }

  const adminCount = users.filter((item) => item.access).length;
  const isOriginalAdmin = user.username === 'Admin';
  const searchValue = usernameSearch.trim().toLowerCase();
  const filteredUsers = users.filter((listedUser) =>
    listedUser.username.toLowerCase().includes(searchValue),
  );

  const setAdminAccess = async (targetUserId: number, nextAccess: boolean) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    setUpdatingUserId(targetUserId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${targetUserId}/access`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ access: nextAccess }),
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Nem sikerült frissíteni a jogosultságot.');
      }

      setUsers((prev) =>
        prev.map((listedUser) =>
          listedUser.id === targetUserId ? { ...listedUser, access: nextAccess } : listedUser,
        ),
      );
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <section>
      <div className="section-header">
        <h2>Admin dashboard</h2>
        <Link to="/" className="button secondary link-button">Vissza</Link>
      </div>

      {loading && <p className="message">Admin adatok betöltése...</p>}
      {error && <p className="message error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-grid">
            <article className="admin-card">
              <h3>Felhasználók</h3>
              <p>{users.length}</p>
            </article>
            <article className="admin-card">
              <h3>Adminok</h3>
              <p>{adminCount}</p>
            </article>
            <article className="admin-card">
              <h3>Kérdések</h3>
              <p>{questions.length}</p>
            </article>
          </div>

          <div className="admin-users">
            <h3>Felhasználók</h3>
            <input
              className="admin-search"
              onChange={(event) => setUsernameSearch(event.target.value)}
              placeholder="Keresés felhasználónév alapján"
              type="search"
              value={usernameSearch}
            />
            <ul>
              {filteredUsers.map((listedUser) => (
                <li key={listedUser.id}>
                  <span>{listedUser.username}</span>
                  <span>{listedUser.email}</span>
                  <span>{listedUser.access ? 'admin' : 'user'}</span>
                  {listedUser.access ? (
                    <button
                      className="button secondary"
                      disabled={
                        listedUser.username === 'Admin' ||
                        !isOriginalAdmin ||
                        updatingUserId === listedUser.id
                      }
                      onClick={() => void setAdminAccess(listedUser.id, false)}
                      type="button"
                    >
                      {updatingUserId === listedUser.id ? 'Folyamatban...' : 'Admin jog elvétele'}
                    </button>
                  ) : (
                    <button
                      className="button secondary"
                      disabled={updatingUserId === listedUser.id}
                      onClick={() => void setAdminAccess(listedUser.id, true)}
                      type="button"
                    >
                      {updatingUserId === listedUser.id ? 'Folyamatban...' : 'Adminná tétel'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {!filteredUsers.length && <p className="message">Nincs találat erre a felhasználónévre.</p>}
          </div>
        </>
      )}
    </section>
  );
}

function HomePage() {
  return (
    <section className="home-menu">
      <Link to="/topics" className="home-menu-button link-button">Témák</Link>
      <Link to="/achievements" className="home-menu-button link-button">Teljesítmények</Link>
      <Link to="/daily-tasks" className="home-menu-button link-button">Napi Feladatok</Link>
      <Link to="/friends" className="home-menu-button link-button">Barátok</Link>
    </section>
  );
}

function TopicsPage() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="section-header">
        <h2>Témák</h2>
        <Link to="/" className="button secondary link-button">Vissza</Link>
      </div>

      <div className="topics-grid">
        {TOPICS.map((topic) => (
          <button
            key={topic.slug}
            className="topics-item"
            onClick={() => navigate(`/topics/${topic.slug}`)}
            type="button"
          >
            <span>{topic.icon}</span>
            <span>{topic.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function AchievementsPage({ user }: { user: AuthUser | null }) {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENT_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAchievements = async () => {
      if (!user) {
        return;
      }

      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setError('Hiányzó token. Jelentkezz be újra.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/userdatas/user/${user.id}/achievements`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorResponse = await response.json().catch(() => ({}));
          throw new Error(errorResponse.message ?? 'Nem sikerült betölteni a teljesítményeket.');
        }

        const data = (await response.json()) as AchievementsResponse;
        setAchievements(data.achievements?.length ? data.achievements : ACHIEVEMENT_TEMPLATES);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Ismeretlen hiba történt.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadAchievements();
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const toggleAchievement = async (achievementId: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    const updatedAchievements = achievements.map((achievement) =>
      achievement.id === achievementId
        ? { ...achievement, completed: !achievement.completed }
        : achievement,
    );

    setSavingId(achievementId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/userdatas/user/${user.id}/achievements`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ achievements: updatedAchievements }),
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Nem sikerült menteni a teljesítményt.');
      }

      setAchievements(updatedAchievements);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section>
      <div className="section-header">
        <h2>Teljesítmények</h2>
        <Link to="/" className="button secondary link-button">Vissza</Link>
      </div>

      {loading && <p className="message">Teljesítmények betöltése...</p>}
      {error && <p className="message error">{error}</p>}

      {!loading && (
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <article key={achievement.id} className={`achievement-card ${achievement.completed ? 'completed' : ''}`}>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              <div className="achievement-row">
                <span className="achievement-status">
                  {achievement.completed ? 'Teljesítve' : 'Folyamatban'}
                </span>
                <button
                  className="button secondary"
                  disabled={savingId === achievement.id}
                  onClick={() => void toggleAchievement(achievement.id)}
                  type="button"
                >
                  {savingId === achievement.id
                    ? 'Mentés...'
                    : achievement.completed
                      ? 'Visszaállítás'
                      : 'Teljesítve'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function DailyTasksPage() {
  return (
    <section>
      <div className="section-header">
        <h2>Napi Feladatok</h2>
        <Link to="/" className="button secondary link-button">Vissza</Link>
      </div>
      <p className="message">Itt jelennek majd meg a napi feladataid.</p>
    </section>
  );
}

function FriendsPage() {
  return (
    <section>
      <div className="section-header">
        <h2>Barátok</h2>
        <Link to="/" className="button secondary link-button">Vissza</Link>
      </div>
      <p className="message">Itt kezelheted a barátaid listáját.</p>
    </section>
  );
}

function TopicQuestionsPage() {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const topic = TOPICS.find((item) => item.slug === topicSlug);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/feladatok`);
        if (!response.ok) {
          throw new Error('Nem sikerült lekérdezni a kérdéseket.');
        }
        const data = (await response.json()) as Question[];
        setQuestions(data);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Ismeretlen hiba történt.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadQuestions();
  }, []);

  const filteredQuestions = useMemo(() => {
    if (!topic) {
      return [];
    }

    return questions.filter((question) => {
      const normalizedTitle = normalizeText(question.title);
      return topic.keywords.some((keyword) => normalizedTitle.includes(normalizeText(keyword)));
    });
  }, [questions, topic]);

  if (!topic) {
    return <p className="message error">Ismeretlen téma.</p>;
  }

  return (
    <section>
      <div className="section-header">
        <h2>{topic.icon} {topic.title} kérdései</h2>
        <Link to="/" className="button secondary link-button">Vissza</Link>
      </div>

      {loading && <p className="message">Kérdések betöltése...</p>}
      {error && <p className="message error">{error}</p>}

      {!loading && !error && filteredQuestions.length === 0 && (
        <p className="message">Ehhez a témához még nincs kérdés az adatbázisban.</p>
      )}

      <div className="question-list">
        {filteredQuestions.map((question) => (
          <article key={question.id} className="question-card">
            <h3>{question.question}</h3>
            <div className="answers-grid">
              {Object.entries(question.answers ?? {}).map(([key, value]) => (
                <div key={key} className="answer-chip">
                  <strong>{key.toUpperCase()}.</strong> {value}
                </div>
              ))}
            </div>
            <p><strong>Érdekesség:</strong> {question.funfact}</p>
            <p><strong>Történelmi háttér:</strong> {question.history}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AuthPage({ onAuthSuccess }: { onAuthSuccess: (result: AuthResponse) => void }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';

      const payload =
        mode === 'login'
          ? { usernameOrEmail, password }
          : { name, username, email, password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Sikertelen bejelentkezés/regisztráció.');
      }

      const result = (await response.json()) as AuthResponse;
      onAuthSuccess(result);
      navigate('/');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrapper">
      <div className="section-header">
        <h2>{mode === 'login' ? 'Belépés' : 'Regisztráció'}</h2>
        <Link to="/" className="button secondary link-button">Vissza</Link>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <div className="mode-row">
          <button
            className={`mode-toggle ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
            type="button"
          >
            Belépés
          </button>
          <button
            className={`mode-toggle ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
            type="button"
          >
            Regisztráció
          </button>
        </div>

        {mode === 'register' && (
          <>
            <input
              placeholder="Teljes név"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              placeholder="Felhasználónév"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <input
              placeholder="Email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </>
        )}

        {mode === 'login' && (
          <input
            placeholder="Felhasználónév vagy email"
            required
            value={usernameOrEmail}
            onChange={(event) => setUsernameOrEmail(event.target.value)}
          />
        )}

        <input
          placeholder="Jelszó"
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <p className="message error">{error}</p>}

        <button className="button" disabled={loading} type="submit">
          {loading ? 'Folyamatban...' : mode === 'login' ? 'Belépés' : 'Regisztrálok'}
        </button>
      </form>
    </section>
  );
}

function AppShell() {
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

  return (
    <div className="app-container">
      <AppHeader user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/topics/:topicSlug" element={<TopicQuestionsPage />} />
        <Route path="/achievements" element={user ? <AchievementsPage user={user} /> : <Navigate to="/auth" replace />} />
        <Route path="/daily-tasks" element={<DailyTasksPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/admin" element={user?.access ? <AdminPage user={user} /> : <Navigate to="/auth" replace />} />
        <Route path="/profile" element={user ? <ProfilePage user={user} onUserUpdate={handleUserUpdate} /> : <Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
