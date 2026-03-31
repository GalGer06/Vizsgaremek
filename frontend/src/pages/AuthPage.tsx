import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import type { AuthResponse } from '../types';

type AuthPageProps = {
  onAuthSuccess: (result: AuthResponse) => void;
};

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
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
