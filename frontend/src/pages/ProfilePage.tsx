import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { API_BASE_URL, TOKEN_KEY } from '../constants';
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
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
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
        const response = await fetch(`${API_BASE_URL}/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Nem sikerült betölteni a profilt.');
        }

        const profile = (await response.json()) as ProfileResponse & { profilePicture?: string };
        setName(profile.name ?? '');
        setUsername(profile.username ?? '');
        setEmail(profile.email ?? '');
        setProfilePicture(profile.profilePicture ?? '');
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Ismeretlen hiba történt.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [user]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('A kép mérete nem lehet nagyobb 2MB-nál.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = async () => {
        // Create canvas for compression and resizing
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Export as compressed JPG
        const base64String = canvas.toDataURL('image/jpeg', 0.82);
        
        setUploading(true);
        setError('');

        try {
          const token = localStorage.getItem(TOKEN_KEY);
          const response = await fetch(`${API_BASE_URL}/user/${user.id}/profile-picture`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ profilePicture: base64String }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Nem sikerült a kép feltöltése.');
          }

          setProfilePicture(base64String);
          onUserUpdate({ ...user, profilePicture: base64String });
          setSuccess('Profilkép sikeresen frissítve.');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Hiba történt a feltöltés során.');
        } finally {
          setUploading(false);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
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
          Authorization: `Bearer ${token}`,
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

  const syncPoints = async () => {
    if (!user) return;
    const token = localStorage.getItem(TOKEN_KEY);
    
    setRecalculating(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/userdatas/user/${user.id}/recalculate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Nem sikerült a pontok újraszámolása.');

      const result = await response.json();
      setSuccess(`Pontszám sikeresen szinkronizálva! Új pontszám: ${result.totalPoints}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt.');
    } finally {
      setRecalculating(false);
    }
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    onUserUpdate(null as any); // This will clear user context and trigger logout
    navigate('/auth');
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <section className="auth-wrapper">
      <div className="section-header">
        <h2>Profil beállítások</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!showLogoutConfirm ? (
            <button 
              type="button" 
              className="button danger logout-btn-top" 
              onClick={() => setShowLogoutConfirm(true)}
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              Kijelentkezés
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                type="button" 
                className="button danger" 
                onClick={handleLogout}
                style={{ padding: '8px 12px', fontSize: '0.75rem' }}
              >
                ✔
              </button>
              <button 
                type="button" 
                className="button secondary" 
                onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: '8px 12px', fontSize: '0.75rem' }}
              >
                ✘
              </button>
            </div>
          )}
          <button 
            onClick={() => navigate(-1)} 
            className="button primary-green link-button"
            style={{ 
              backgroundColor: 'var(--duo-green)', 
              borderColor: 'var(--duo-green-shadow)',
              color: 'white',
              fontWeight: 'bold',
              padding: '10px 20px',
              borderRadius: '12px',
              borderBottomWidth: '4px'
            }}
          >
            Vissza
          </button>
        </div>
      </div>

      {loading && <p className="message">Profil betöltése...</p>}

      {!loading && (
        <>
          <form className="auth-form" onSubmit={submit}>
            <div className="profile-upload-section">
              <div className="profile-preview-large">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profil" />
                ) : (
                  <span className="placeholder-text">{username.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label className="button secondary profile-upload-btn">
                {uploading ? 'Feltöltés...' : 'Profilkép módosítása'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <input
              placeholder="Teljes név"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="notranslate"
            />
            <input
              placeholder="Felhasználónév"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="notranslate"
            />
            <input
              placeholder="Email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="notranslate"
            />

            {error && <p className="message error">{error}</p>}
            {success && <p className="message">{success}</p>}

            <button className="button" disabled={saving} type="submit">
              {saving ? 'Mentés...' : 'Változtatások mentése'}
            </button>
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-blue)', paddingTop: '20px' }}>
              <p className="message" style={{ backgroundColor: 'transparent', padding: 0, marginBottom: '10px' }}>
                Úgy érzed, nem jó a pontszámod? Kérheted a pontjaid újraszámolását az eddigi helyes válaszaid alapján.
              </p>
              <button 
                type="button" 
                className="button secondary" 
                onClick={syncPoints} 
                disabled={recalculating}
                style={{ width: '100%', borderColor: 'var(--duo-green)' }}
              >
                {recalculating ? 'Szinkronizálás...' : 'Pontok szinkronizálása'}
              </button>
            </div>

          </form>
        </>
      )}
    </section>
  );
}
