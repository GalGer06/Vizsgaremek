import { Link, useNavigate } from 'react-router-dom';
import { TOPICS } from '../constants';

export function TopicsPage() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="section-header">
        <h2>Témák</h2>
        <Link to="/" className="button secondary link-button">Vissza</Link>
      </div>

      <div className="topics-grid">
        {TOPICS.map((topic) => (
          <button
            key={topic.slug}
            className="topics-item"
            onClick={() => navigate(`/topics/${topic.slug}`)}
            type="button"
          >
            <span>{topic.icon}</span>
            <span>{topic.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
