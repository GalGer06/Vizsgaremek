import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import type { Topic } from '../types';

export function TopicsPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/topics`)
      .then(res => res.json())
      .then(data => {
        setTopics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching topics:', err);
        setLoading(false);
      });
  }, []);

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
