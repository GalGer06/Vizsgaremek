import React, { useEffect, useState } from 'react';
import { TOKEN_KEY } from '../constants';

const AboutPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kliens oldalon fut le az ellenőrzés
    const token = localStorage.getItem(TOKEN_KEY);
    
    // Szigorúbb ellenőrzés: se null, se undefined, se üres string ne legyen
    const hasValidToken = token !== null && 
                          token !== undefined && 
                          token !== 'null' && 
                          token !== 'undefined' && 
                          token !== '';
                          
    setIsLoggedIn(hasValidToken);
  }, []);

  return (
    <div style={{
      maxWidth: "900px",
      margin: "40px auto",
      padding: "0 20px",
      fontFamily: "inherit",
      color: "var(--text-main)"
    }}>
      <h1 style={{
        textAlign: "center",
        marginBottom: "40px",
        color: "#58cc02",
        fontSize: "2.5rem"
      }}>Rólunk</h1>

      <section style={{ marginBottom: "40px", backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "30px", borderRadius: "20px", border: "1px solid rgba(88, 204, 2, 0.2)" }}>
        <h2 style={{ color: "#58cc02", marginBottom: "20px" }}>A Küldetésünk</h2>
        <p style={{ lineHeight: "1.8", fontSize: "1.1rem", opacity: 0.9 }}>
          A <strong style={{ color: "#58cc02" }}>Future Nature</strong> víziója egy olyan world, ahol a környezettudatosság nem teher, hanem egy izgalmas, mindennapi kaland. 
          Célunk, hogy játékos formában tanítsuk meg a jövő generációinak és minden érdeklődőnek, hogyan vigyázhatunk közös otthonunkra, a Földre.
        </p>
      </section>

      <section style={{ marginBottom: "40px", backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "30px", borderRadius: "20px", border: "1px solid rgba(88, 204, 2, 0.2)" }}>
        <h2 style={{ color: "#58cc02", marginBottom: "20px" }}>A Projektről</h2>
        <p style={{ lineHeight: "1.8", fontSize: "1.1rem", opacity: 0.9 }}>
          Ez az oldal a <a href="https://petrik.hu/" target="_blank" rel="noopener noreferrer" style={{ color: "#58cc02", textDecoration: "none", fontWeight: "bold", borderBottom: "1px solid rgba(88, 204, 2, 0.3)" }} onMouseEnter={(e) => e.currentTarget.style.borderBottom = "1px solid #58cc02"} onMouseLeave={(e) => e.currentTarget.style.borderBottom = "1px solid rgba(88, 204, 2, 0.3)"}>Budapesti Műszaki SzC Petrik Lajos Két tanítási Nyelvű Technikum</a> keretein belül valósult meg, mint záró vizsgaremek. 
          A fejlesztés során célunk egy olyan modern és interaktív felület létrehozása volt, amely hidat képez az oktatás és a szórakozás között. 
          A projektet <strong style={{ color: "#58cc02" }}>Tóth Patrik</strong> és <strong style={{ color: "#58cc02" }}>Galambos Gergő</strong> készítette el, minden részletet a tanulók igényeihez igazítva.
        </p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px", marginBottom: "40px" }}>
        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "25px", borderRadius: "20px", border: "1px solid rgba(88, 204, 2, 0.2)" }}>
          <h3 style={{ color: "#58cc02", marginBottom: "15px" }}>Játékos Tanulás</h3>
          <p style={{ lineHeight: "1.6", opacity: 0.8 }}>
            Hisszük, hogy a tudás akkor rögzül a legjobban, ha élvezet közben szerezzük meg. 
            Kvízeink és feladataink úgy lettek kialakítva, hogy folyamatosan motiváljanak és sikerélményt adjanak.
          </p>
        </div>
        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "25px", borderRadius: "20px", border: "1px solid rgba(88, 204, 2, 0.2)" }}>
          <h3 style={{ color: "#58cc02", marginBottom: "15px" }}>Közösségi Erő</h3>
          <p style={{ lineHeight: "1.6", opacity: 0.8 }}>
            A környezetvédelem csapatmunka. Az oldalon követheted barátaid fejlődését, 
            versenyezhettek a ranglistán, és együtt válhattok a természet őrzőivé.
          </p>
        </div>
      </div>

      <section style={{ textAlign: "center", padding: "40px", backgroundColor: "rgba(88, 204, 2, 0.1)", borderRadius: "20px" }}>
        <h2 style={{ color: "#58cc02", marginBottom: "20px" }}>Csatlakozz Hozzánk!</h2>
        <p style={{ fontSize: "1.2rem", marginBottom: isLoggedIn ? "0" : "30px" }}>
          Legyél te is része a változásnak. Tanulj, játssz és tegyél a holnapért!
        </p>
        {!isLoggedIn && (
          <button 
            onClick={() => window.location.href = '/auth'}
            style={{
              backgroundColor: "#58cc02",
              color: "white",
              border: "none",
              padding: "15px 40px",
              fontSize: "1.2rem",
              fontWeight: "bold",
              borderRadius: "15px",
              cursor: "pointer",
              boxShadow: "0 4px 0 #46a302",
              transition: "transform 0.1s"
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "translateY(2px)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            Regisztrálok
          </button>
        )}
      </section>
    </div>
  );
};

export default AboutPage;
