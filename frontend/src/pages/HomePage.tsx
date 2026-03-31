import { Link } from 'react-router-dom';
import { Leaderboard } from '../components/Leaderboard';

export function HomePage() {
  return (
    <>
      <section className="home-menu">
        <Link to="/topics" className="home-menu-button link-button">Témák</Link>
        <Link to="/achievements" className="home-menu-button link-button">Teljesítmények</Link>
        <Link to="/daily-tasks" className="home-menu-button link-button">Napi Feladatok</Link>
        <Link to="/friends" className="home-menu-button link-button">Barátok</Link>
      </section>
      <Leaderboard />
    </>
  );
}
