import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ACHIEVEMENT_TEMPLATES, API_BASE_URL, TOKEN_KEY } from '../constants';
import type { Achievement, AchievementsResponse, AuthUser } from '../types';

type AchievementsPageProps = {
  user: AuthUser | null;
};

export function AchievementsPage({ user }: AchievementsPageProps) {
  const navigate = useNavigate();
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
        const mergedAchievements = (data.achievements?.length ? data.achievements : ACHIEVEMENT_TEMPLATES).map(a => {
            const template = ACHIEVEMENT_TEMPLATES.find(t => t.id === a.id);
            return { ...a, image: template?.image };
        });
        setAchievements(mergedAchievements);
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
    if (!user.access) {
      return;
    }

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
        <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
      </div>

      {loading && <p className="message">Teljesítmények betöltése...</p>}
      {error && <p className="message error">{error}</p>}

      {!loading && (
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <article key={achievement.id} className={`achievement-card ${achievement.completed ? 'completed' : ''}`}>
              {achievement.image && (
                <div 
                  className="achievement-image" 
                  style={{ 
                    backgroundImage: `url(${achievement.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '140px',
                    borderRadius: '16px',
                    marginBottom: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.1)'
                  }} 
                />
              )}
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              <div className="achievement-row">
                <span className="achievement-status">
                  {achievement.completed ? 'Teljesítve' : 'Folyamatban'}
                </span>
                {user.access && (
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
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
