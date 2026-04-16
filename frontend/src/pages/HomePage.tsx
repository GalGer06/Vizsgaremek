import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaderboard } from '../components/Leaderboard';
import { API_BASE_URL, TOKEN_KEY } from '../constants';
import type { HomeButton } from '../types';

export function HomePage() {
  const [buttons, setButtons] = useState<HomeButton[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/home/buttons`)
      .then(res => res.json())
      .then(data => {
        setButtons(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching home buttons:', err);
        setLoading(false);
      });
  }, []);

  const handleButtonClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem('wdad_user');
    
    // Check if user is logged in
    const isLoggedIn = token && userStr && userStr !== 'null';

    if (!isLoggedIn) {
      e.preventDefault();
      navigate('/auth');
    }
  };

  const buttonStyle = (image: string) => ({
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${API_BASE_URL}/images/${image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
    height: '220px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '24px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    transition: 'transform 0.2s, border-color 0.2s',
  });

  return (
    <div className="home-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', alignItems: 'stretch' }}>
      <section className="home-menu" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '1.5rem',
        padding: '1rem 0'
      }}>
        {loading ? (
          <p>Betöltés...</p>
        ) : (
          buttons.map(button => (
            <Link 
              key={button.id}
              to={button.link} 
              className="home-menu-button link-button" 
              style={buttonStyle(button.image)}
              onClick={(e) => handleButtonClick(e, button.link)}
            >
              {button.label}
            </Link>
          ))
        )}
      </section>
      <div className="home-leaderboard-wrapper" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
        <Leaderboard />
      </div>
    </div>
  );
}
