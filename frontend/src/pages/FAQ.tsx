import React, { useState } from "react";

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqData = [
    {
      question: "Mi ez az oldal?",
      answer: "Ez egy oktató platform, ahol különböző témákban tesztelheted a tudásodat és feladatokat oldhatsz meg."
    },
    {
      question: "Hogyan szerezhetek pontokat?",
      answer: "Pontokat a feladatok helyes megoldásával, napi bejelentkezéssel és a különböző mérföldkövek elérésével szerezhetsz."
    },
    {
      question: "Mik azok a jegyek (ticket)?",
      answer: "A jegyek lehetővé teszik, hogy írj nekünk esetleg felfedezett hibákról vagy adhatsz nekünk ötleteket, kérdéseket amikkel kibővíthetjük az oldalt."
    },
    {
      question: "Hogyan léphetek kapcsolatba az adminisztrátorral?",
      answer: "Ha bármilyen problémád merülne fel, kérjük, írj nekünk a rikimik@vizsgaremek.local címre vagy keress minket privát üzenetben a közösségi média platformokon."
    },
    {
      question: "Milyen témakörök érhetőek el?",
      answer: "Jelenleg számos témakör közül választhatsz, többek között környezetvédelem, technológia és általános ismeretek is szerepelnek a kínálatban."
    },
    {
      question: "Mik azok a mérföldkövek (achievements)?",
      answer: "A mérföldkövek olyan különleges kitüntetések, amiket bizonyos célok elérésekor kapsz meg, például 500 pont elérésekor."
    },
    {
      question: "Lehet barátokat jelölni az oldalon?",
      answer: "Igen, a 'Barátok' menüpont alatt kereshetsz más felhasználókat, és nyomon követhetitek egymás fejlődését."
    },
    {
      question: "Hogyan működik a ranglista?",
      answer: "A ranglistán a szerzett pontjaid alapján kerülsz helyezésre. Minél több feladatot oldasz meg helyesen, annál előrébb juthatsz a rangsorban."
    },
    {
      question: "Módosíthatom a profiladataimat?",
      answer: "Igen, a 'Profil' menüpontban feltölthetsz egyedi profilképet, és megváltoztathatod a felhasználóneved vagy egyéb adataidat."
    },
    {
      question: "Mobilról is használható az oldal?",
      answer: "Természetesen! Az oldal teljesen reszponzív, így mobiltelefonról és tabletről is kényelmesen tanulhatsz és játszhatsz."
    },
    {
      question: "Ingyenes a regisztráció?",
      answer: "Igen, a regisztráció és az alapvető funkciók használata teljesen ingyenes mindenki számára."
    },
    {
      question: "Mi történik, ha elrontok egy kérdést?",
      answer: "Semmi baj! A hibákból is lehet tanulni. Bár nem kapsz pontot, a helyes választ megmutatjuk, így legközelebb már tudni fogod."
    }
  ];

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div style={{
      maxWidth: "800px",
      margin: "40px auto",
      padding: "0 20px",
      fontFamily: "inherit"
    }}>
      <h1 style={{
        textAlign: "center",
        marginBottom: "40px",
        color: "#58cc02"
      }}>Gyakran Ismételt Kérdések (GYIK)</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {faqData.map((item, index) => (
          <div 
            key={index} 
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              border: "2px solid #58cc02",
              overflow: "hidden",
              transition: "all 0.3s ease"
            }}
          >
            <button
              onClick={() => toggleAccordion(index)}
              style={{
                width: "100%",
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "none",
                border: "none",
                color: "#58cc02",
                fontSize: "18px",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <span>{item.question}</span>
              <span style={{
                transition: "transform 0.3s ease",
                transform: activeIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                color: "#58cc02"
              }}>
                ▼
              </span>
            </button>
            <div style={{
              maxHeight: activeIndex === index ? "200px" : "0",
              opacity: activeIndex === index ? 1 : 0,
              overflow: "hidden",
              transition: "all 0.3s ease-in-out",
              padding: activeIndex === index ? "0 20px 20px 20px" : "0 20px"
            }}>
              <p style={{
                color: "#58cc02",
                lineHeight: "1.6",
                margin: 0,
                opacity: 0.9
              }}>
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;