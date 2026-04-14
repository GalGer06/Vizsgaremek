import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOKEN_KEY } from '../constants';
import type { AuthUser } from '../types';

interface SecretPageProps {
  user: AuthUser | null;
}

export const SecretPage: React.FC<SecretPageProps> = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return;
    }

    const markSecretCompleted = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        await fetch(`http://localhost:3000/userdatas/user/${user.id}/achievements/11/complete`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Failed to award secret achievement:', error);
      }
    };

    markSecretCompleted();
  }, [user]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      color: 'white',
      borderRadius: '20px',
      margin: '2rem auto',
      maxWidth: '800px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉 Gratulálunk! 🎉</h1>
      <p style={{ fontSize: '1.5rem', maxWidth: '600px' }}>
        Megtaláltad a titkos oldalt! Ez egy igazi felfedezőhöz méltó teljesítmény.
      </p>
      <div style={{ fontSize: '5rem', margin: '2rem' }}>🕵️‍♂️✨</div>
      <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
        Egy új kitüntetést is szereztél: <strong>Titkos felfedező</strong>
      </p>
      <button 
        onClick={() => navigate('/')}
        className="secret-back-button"
        style={{
          marginTop: '2rem',
          padding: '12px 24px',
          fontSize: '1rem',
          backgroundColor: '#007bff',
          color: '#ffffff',
          border: 'none',
          borderRadius: '30px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          zIndex: 10,
          display: 'inline-block',
          position: 'relative',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.backgroundColor = '#0056b3';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = '#007bff';
        }}
      >
        Vissza a főoldalra
      </button>
    </div>
  );
};
