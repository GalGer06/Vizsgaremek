import { Link, useNavigate } from 'react-router-dom';
import { TOPICS } from '../constants';

export function TopicsPage() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="section-header">
        <h2>Témák</h2>
        <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
      </div>

      <div className="home-menu">
        {TOPICS.map((topic) => (
          <button
            key={topic.slug}
            className="home-menu-button link-button"
            onClick={() => navigate(`/topics/${topic.slug}`)}
            type="button"
          >
            <span style={{ fontSize: '3rem' }}>{topic.icon}</span>
            <span>{topic.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
