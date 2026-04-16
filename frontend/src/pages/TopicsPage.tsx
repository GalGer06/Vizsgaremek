import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, TOKEN_KEY } from '../constants';
import type { Topic } from '../types';

export function TopicsPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate('/auth', { replace: true });
      return;
    }

    fetch(`${API_BASE_URL}/topics`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          navigate('/auth', { replace: true });
          return;
        }
        if (!res.ok) throw new Error('Hiba történt az adatok letöltése közben.');
        return res.json();
      })
      .then(data => {
        setTopics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching topics:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <section>
        <div className="section-header">
          <h2>Témák</h2>
          <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
        </div>
        <div className="leaderboard-container" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>{error}</p>
          <button onClick={() => navigate('/auth')} className="button primary" style={{ marginTop: '1rem' }}>
            Bejelentkezés
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-header">
        <h2>Témák</h2>
        <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
      </div>

      <div className="home-menu" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '1.5rem',
        padding: '1rem 0'
      }}>
        {loading ? (
          <p>Betöltés...</p>
        ) : (
          topics.map((topic) => {
            const imageUrl = topic.image?.startsWith('http') 
              ? topic.image 
              : `${API_BASE_URL}/images/${topic.image}`;

            return (
              <button
                key={topic.slug}
                className="home-menu-button link-button"
                onClick={() => navigate(`/topics/${topic.slug}`)}
                type="button"
                style={{
                  backgroundImage: topic.image ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${imageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem',
                  height: '220px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '24px',
                  transition: 'transform 0.2s, border-color 0.2s',
                  color: 'white'
                }}
              >
                <span style={{ fontSize: '3.5rem', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>{topic.icon}</span>
                <span style={{ 
                  fontWeight: '900', 
                  fontSize: '1.5rem', 
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.8)' 
                }}>{topic.title}</span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
