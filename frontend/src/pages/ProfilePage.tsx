import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import type { AuthUser, ProfileResponse } from '../types';

type ProfilePageProps = {
  user: AuthUser | null;
  onUserUpdate: (nextUser: AuthUser) => void;
};

export function ProfilePage({ user, onUserUpdate }: ProfilePageProps) {
  const navigate = useNavigate();
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
        <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
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
