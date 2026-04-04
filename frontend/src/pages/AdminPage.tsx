import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL, TOKEN_KEY } from '../constants';
import type { AdminUser, AuthUser, Question } from '../types';

type AdminPageProps = {
  user: AuthUser | null;
};

export function AdminPage({ user }: AdminPageProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [usernameSearch, setUsernameSearch] = useState('');
  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Question>>({});

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
          <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
        </div>
        <p className="message error">Nincs admin jogosultságod ehhez az oldalhoz.</p>
      </section>
    );
  }

  const adminCount = users.filter((item) => item.access).length;
  const isOriginalAdmin = user.username === 'Rikimik';
  const searchValue = usernameSearch.trim().toLowerCase();
  const filteredUsers = users.filter((listedUser) =>
    listedUser.username.toLowerCase().includes(searchValue),
  );

  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
    q.id.toString() === questionSearch.trim()
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

  const deleteUser = async (targetUserId: number) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a felhasználót?')) {
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    setUpdatingUserId(targetUserId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${targetUserId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Nem sikerült törölni a felhasználót.');
      }

      setUsers((prev) => prev.filter((u) => u.id !== targetUserId));
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const viewUserDetails = async (targetUserId: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/user/${targetUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Nem sikerült lekérni a felhasználó adatait.');
      }

      const userData = (await response.json()) as AdminUser;
      setSelectedUser(userData);
    } catch (viewError) {
      const message = viewError instanceof Error ? viewError.message : 'Ismeretlen hiba történt.';
      setError(message);
    }
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setEditFormData({ ...q });
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    const token = localStorage.getItem(TOKEN_KEY);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/feladatok/${editingQuestion.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error('Nem sikerült a módosítás.');

      const updated = (await response.json()) as Question;
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      setEditingQuestion(null);
      alert('Kérdés sikeresen frissítve!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt.');
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...(editFormData.answers || [])];
    newAnswers[index] = value;
    setEditFormData({ ...editFormData, answers: newAnswers });
  };

  return (
    <section>
      <div className="section-header">
        <h2>Admin dashboard</h2>
        <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
      </div>

      {loading && <p className="message">Admin adatok betöltése...</p>}
      {error && <p className="message error">{error}</p>}

      {selectedUser && (
        <div className="user-details-overlay" onClick={() => setSelectedUser(null)}>
          <article className="user-details-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Felhasználó részletei</h3>
              <button className="button secondary small" onClick={() => setSelectedUser(null)}>✕</button>
            </header>
            <div className="modal-body">
              <p><strong>Felhasználó:</strong> {selectedUser.username}</p>
              <p><strong>Név:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Szerepkör:</strong> {selectedUser.access ? 'Admin' : 'Felhasználó'}</p>
              <p><strong>Regisztrált:</strong> {new Date(selectedUser.createdAt).toLocaleDateString('hu-HU')}</p>
            </div>
            <footer className="modal-footer">
              <button className="button secondary" onClick={() => setSelectedUser(null)}>Bezárás</button>
            </footer>
          </article>
        </div>
      )}

      {editingQuestion && (
        <div className="user-details-overlay" onClick={() => setEditingQuestion(null)}>
          <article className="user-details-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Kérdés szerkesztése</h3>
              <button className="button secondary small" onClick={() => setEditingQuestion(null)}>✕</button>
            </header>
            <form onSubmit={handleUpdateQuestion} className="modal-body admin-edit-form">
              <label>
                Kérdés:
                <textarea 
                  value={editFormData.question} 
                  onChange={e => setEditFormData({...editFormData, question: e.target.value})}
                  required
                />
              </label>
              
              <div className="admin-edit-answers">
                <p>Válaszlehetőségek:</p>
                {(editFormData.answers || []).map((ans, idx) => (
                  <label key={idx}>
                    {String.fromCharCode(65 + idx)}:
                    <input 
                      type="text" 
                      value={ans} 
                      onChange={e => handleAnswerChange(idx, e.target.value)} 
                      required 
                    />
                  </label>
                ))}
              </div>

              <label>
                Helyes válasz (a fenti szövegek egyike kell legyen):
                <input 
                  type="text" 
                  value={editFormData.correct} 
                  onChange={e => setEditFormData({...editFormData, correct: e.target.value})}
                  required 
                />
              </label>

              <label>
                Érdekesség:
                <textarea 
                  value={editFormData.funfact} 
                  onChange={e => setEditFormData({...editFormData, funfact: e.target.value})}
                />
              </label>

              <label>
                Történelmi háttér:
                <textarea 
                  value={editFormData.history} 
                  onChange={e => setEditFormData({...editFormData, history: e.target.value})}
                />
              </label>

              <footer className="modal-footer">
                <button type="submit" className="button primary-green">Mentés</button>
                <button type="button" className="button secondary" onClick={() => setEditingQuestion(null)}>Mégse</button>
              </footer>
            </form>
          </article>
        </div>
      )}

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
            <article className="admin-card clickable" onClick={() => document.getElementById('admin-questions-section')?.scrollIntoView({ behavior: 'smooth' })}>
              <h3>Kérdések</h3>
              <p>{questions.length}</p>
              <span className="card-hint">Kattints az ugráshoz ↓</span>
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
                  <span
                    className="user-name-clickable"
                    onClick={() => void viewUserDetails(listedUser.id)}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {listedUser.username}
                  </span>
                  <span>{listedUser.email}</span>
                  <span>{listedUser.username === 'Rikimik' ? 'szuperadmin' : (listedUser.access ? 'admin' : 'user')}</span>
                  <div className="admin-user-actions">
                    {listedUser.username !== 'Rikimik' && (
                      <>
                        <button
                          className="button danger small"
                          disabled={updatingUserId === listedUser.id}
                          onClick={() => void deleteUser(listedUser.id)}
                          type="button"
                        >
                          {updatingUserId === listedUser.id ? '...' : 'Törlés'}
                        </button>
                        {listedUser.access ? (
                          <button
                            className="button secondary small"
                            disabled={!isOriginalAdmin || updatingUserId === listedUser.id}
                            onClick={() => void setAdminAccess(listedUser.id, false)}
                            type="button"
                          >
                            {updatingUserId === listedUser.id ? '...' : 'Admin visszavonás'}
                          </button>
                        ) : (
                          <button
                            className="button secondary small"
                            disabled={updatingUserId === listedUser.id}
                            onClick={() => void setAdminAccess(listedUser.id, true)}
                            type="button"
                          >
                            {updatingUserId === listedUser.id ? '...' : 'Adminná tétel'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {!filteredUsers.length && <p className="message">Nincs találat erre a felhasználónévre.</p>}
          </div>

          <div className="admin-questions" id="admin-questions-section">
            <div className="admin-questions-header">
              <h3>Kérdések kezelése</h3>
              <button 
                className="button secondary small scroll-top-btn" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Vissza fel ↑
              </button>
            </div>
            
            <div className="admin-search-wrapper">
              <input
                className="admin-search"
                onChange={(event) => setQuestionSearch(event.target.value)}
                placeholder="Keresés kérdés szövege vagy #ID alapján"
                type="search"
                value={questionSearch}
              />
            </div>

            <div className="admin-question-list">
              {filteredQuestions.map(q => (
                <div key={q.id} className="admin-question-item">
                  <div className="admin-q-text" style={{ color: 'white' }}>
                    <strong>#{q.id}</strong> {q.question}
                  </div>
                  <button 
                    className="button secondary small" 
                    onClick={() => handleEditQuestion(q)}
                  >
                    Szerkesztés
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
