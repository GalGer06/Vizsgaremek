import { useNavigate } from 'react-router-dom';

export function DailyTasksPage() {
  const navigate = useNavigate();
  return (
    <section>
      <div className="section-header">
        <h2>Napi Feladatok</h2>
        <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
      </div>
      <p className="message info">Itt jelennek majd meg a napi feladataid.</p>
    </section>
  );
}
