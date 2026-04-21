import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, TOKEN_KEY } from '../constants';
import type { AuthUser } from '../types';

interface EnvironmentalPageProps {
  user: AuthUser | null;
}

interface Fact {
  id: number;
  title: string;
  description: string;
  image: string;
  color: string;
  impact: 'negative' | 'positive';
}

const FACTS: Fact[] = [
  {
    id: 1,
    title: 'Ipari Erdőirtás',
    description: 'Évente kb. 15 milliárd fát vágnak ki. Percenként 36 focipályányi erdő tűnik el.',
    image: 'deforestation_v3.jpg',
    color: '#ff6b6b',
    impact: 'negative'
  },
  {
    id: 2,
    title: 'CO2 Kibocsátás',
    description: 'Az emberiség évente több mint 36 milliárd tonna szén-dioxidot juttat a légkörbe.',
    image: 'pollution_v2.jpg',
    color: '#ff6b6b',
    impact: 'negative'
  },
  {
    id: 3,
    title: 'Műanyag szennyezés',
    description: 'Naponta 8 millió tonna műanyag kerül az óceánokba, ami súlyosan károsítja a vízi élővilágot.',
    image: 'plastic_pollution.jpg',
    color: '#ff6b6b',
    impact: 'negative'
  },
  {
    id: 4,
    title: 'Megújuló energia',
    description: 'A világ áramtermelésének már több mint 30%-a megújuló forrásokból származik.',
    image: 'solar_energy.jpg',
    color: '#51cf66',
    impact: 'positive'
  },
  {
    id: 5,
    title: 'Környezettudatosság',
    description: 'Egyre több ország tiltja be az egyszer használatos műanyagokat és fejleszti az újrahasznosítást.',
    image: 'eco_awareness_v3.jpg',
    color: '#51cf66',
    impact: 'positive'
  },
  {
    id: 6,
    title: 'Védett területek',
    description: 'Az elmúlt évtizedben jelentősen nőtt a védett tengeri és szárazföldi területek nagysága.',
    image: 'nature_reserve_v3.jpg',
    color: '#51cf66',
    impact: 'positive'
  },
  {
    id: 7,
    title: 'Hogyan Segíthetsz?',
    description: 'Válassz fenntartható közlekedést, csökkentsd a húsfogyasztást, hasznosíts újra és támogasd a helyi ökokezdeményezéseket. Minden apró döntésed formálja a jövőt.',
    image: 'how_to_help_v3.jpg',
    color: '#339af0',
    impact: 'positive'
  }
];

export const EnvironmentalPage: React.FC<EnvironmentalPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    // Fade in effect on mount
    const timer = setTimeout(() => setIsReady(true), 100);
    
    if (!user) return;
    const markSecretCompleted = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        await fetch(`${API_BASE_URL}/userdatas/user/${user.id}/achievements/11/complete`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Failed to award secret achievement:', error);
      }
    };
    markSecretCompleted();
  }, [user]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh', 
      position: 'fixed',
      top: 0,
      left: 0,
      overflowY: 'auto',
      scrollSnapType: 'y mandatory',
      scrollBehavior: 'smooth',
      backgroundColor: '#050505',
      color: 'white',
      zIndex: 9999,
      scrollbarWidth: 'none', 
      msOverflowStyle: 'none',
      opacity: isReady ? 1 : 0,
      transition: 'opacity 0.8s ease-in'
    }}>
      <style>{`
        .environmental-container::-webkit-scrollbar { display: none; }
        section { scroll-snap-align: start; scroll-snap-stop: always; }
        
        .content-card {
            position: relative;
            zIndex: 3;
            max-width: 850px;
            padding: 3.5rem;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(15px);
            border-radius: 40px;
            text-align: center;
            margin: 0 2rem;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            transition: all 0.8s ease-in-out;
        }

        .content-card h2 {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            margin-top: 0;
            font-weight: 900;
        }

        .content-card p {
            font-size: 1.6rem;
            line-height: 1.5;
            color: #e0e0e0;
            font-weight: 300;
        }

        @media (max-width: 768px) {
            .content-card {
                padding: 2rem;
                margin: 0 1rem;
                border-radius: 30px;
            }
            .content-card h2 {
                font-size: 2.2rem;
                margin-bottom: 1rem;
            }
            .content-card p {
                font-size: 1.1rem;
            }
            .back-btn {
                padding: 10px 18px !important;
                font-size: 0.9rem !important;
            }
        }

        @media (max-width: 480px) {
            .content-card {
                padding: 1.5rem;
                margin: 0 0.8rem;
            }
            .content-card h2 {
                font-size: 1.8rem;
            }
            .content-card p {
                font-size: 1rem;
            }
        }
      `}</style>

      {/* Persistent Floating Back Button */}
      <button
        onClick={() => navigate('/')}
        className="back-btn"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 10000,
          padding: '12px 24px',
          borderRadius: '30px',
          backgroundColor: '#51cf66',
          color: 'white',
          border: 'none',
          fontWeight: 900,
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        ← Vissza
      </button>

      <div className="environmental-container">
        {FACTS.map((fact) => (
            <section
            key={fact.id}
            style={{
                position: 'relative',
                height: '100vh', 
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
            >
            {/* Parallax Background */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${API_BASE_URL}/images/${fact.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                zIndex: 1
            }} />

            {/* Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
                zIndex: 2
            }} />

            {/* Content Card with Smooth Animation */}
            <div 
              className="content-card"
              style={{
                zIndex: 3,
                border: `2px solid ${fact.color}33`,
              }}
            >
                <span style={{
                color: fact.color,
                fontSize: '1.1rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '5px',
                display: 'block',
                marginBottom: '1rem'
                }}>
                {fact.id === 7 ? '🏗️ Te is Része vagy' : fact.impact === 'negative' ? '⚠️ Környezeti Kihívás' : '🌟 Fenntartható Megoldás'}
                </span>
                <h2 style={{ color: 'white' }}>{fact.title}</h2>
                <p>
                {fact.description}
                </p>
                {fact.id === 7 && (
                  <button 
                  onClick={() => navigate('/')}
                  className="button primary"
                  style={{ 
                      marginTop: '2rem',
                      padding: '18px 45px', 
                      borderRadius: '50px', 
                      fontWeight: 900,
                      fontSize: '1.3rem',
                      cursor: 'pointer',
                      backgroundColor: '#51cf66',
                      color: '#fff',
                      border: 'none',
                      transition: 'transform 0.2s ease',
                      boxShadow: '0 4px 15px rgba(81, 207, 102, 0.3)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                  Vissza a főoldalra
                  </button>
                )}
            </div>
            </section>
        ))}

        {/* Closing Section removed as it is now integrated into the last category item */}
      </div>
    </div>
  );
};
