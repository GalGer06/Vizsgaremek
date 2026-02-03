function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🌱 Környezetvédelem</h1>
        <p>Tanulj játékosan a Föld védelméről</p>
      </header>

      <section className="card-grid">
        <div className="lesson-card">
          <span>🌍</span>
          <h3>Alapfogalmak</h3>
        </div>

        <div className="lesson-card">
          <span>♻️</span>
          <h3>Újrahasznosítás</h3>
        </div>

        <div className="lesson-card">
          <span>💧</span>
          <h3>Vízvédelem</h3>
        </div>

        <div className="lesson-card">
          <span>🌳</span>
          <h3>Erdők</h3>
        </div>
      </section>

      <div className="button-wrapper">
        <button className="button">Kezdés</button>
      </div>
    </div>
  )
}

export default App
