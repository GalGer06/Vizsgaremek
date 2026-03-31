import { Link } from 'react-router-dom';

export function DailyTasksPage() {
  return (
    <section>
      <div className="section-header">
        <h2>Napi Feladatok</h2>
        <Link to="/" className="button secondary link-button">Vissza</Link>
      </div>
      <p className="message">Itt jelennek majd meg a napi feladataid.</p>
    </section>
  );
}
