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
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

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

  return (
    <section>
      <div className="section-header">
        <h2>Admin dashboard</h2>
        <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
      </div>

      {loading && <p className="message">Admin adatok betöltése...</p>}
      {error && <p className="message error">{error}</p>}

      {selectedUser && (
        <article className="user-details-modal">
          <div className="modal-content">
            <h3>Felhasználó részletei: {selectedUser.username}</h3>
            <p><strong>Név:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Jogosultság:</strong> {selectedUser.access ? 'Admin' : 'Felhasználó'}</p>
            <p><strong>Létrehozva:</strong> {new Date(selectedUser.createdAt).toLocaleDateString('hu-HU')}</p>
            <button className="button secondary" onClick={() => setSelectedUser(null)}>Bezárás</button>
          </div>
        </article>
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
                  <span
                    className="user-name-clickable"
                    onClick={() => void viewUserDetails(listedUser.id)}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {listedUser.username}
                  </span>
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
                  <button
                    className="button danger small"
                    disabled={listedUser.username === 'Admin' || updatingUserId === listedUser.id}
                    onClick={() => void deleteUser(listedUser.id)}
                    type="button"
                  >
                    {updatingUserId === listedUser.id ? '...' : 'Törlés'}
                  </button>
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
