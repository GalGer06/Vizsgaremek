import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOKEN_KEY } from '../constants';
import type { AuthUser } from '../types';

type TicketsPageProps = {
  user: AuthUser | null;
};

export function TicketsPage({ user }: TicketsPageProps) {
  const navigate = useNavigate();
  const [ticketType, setTicketType] = useState<'BUG' | 'SUGGEST_QUESTION'>('BUG');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Suggested question state
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [funfact, setFunfact] = useState('');

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const attachment = ticketType === 'SUGGEST_QUESTION' ? {
      question,
      answers,
      correct: answers[correctIndex],
      funfact
    } : null;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
        },
        body: JSON.stringify({
          type: ticketType,
          description,
          attachment
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Ticket sikeresen elküldve! Köszönjük a segítséget.' });
        setDescription('');
        setQuestion('');
        setAnswers(['', '', '', '']);
        setCorrectIndex(0);
        setFunfact('');
      } else {
        setMessage({ type: 'error', text: 'Hiba történt a küldés során. Kérjük próbáld újra később.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Hálózati hiba történt.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tickets-page card">
      <div className="card-header">
        <h2>Hibajelentés / Kérdés javaslat</h2>
        <p>Segíts nekünk fejleszteni az oldalt!</p>
      </div>

      <form onSubmit={handleSubmit} className="tickets-form">
        <div className="form-group">
          <label>Típus</label>
          <div className="ticket-type-selector">
            <button
              type="button"
              className={`button ${ticketType === 'BUG' ? 'primary' : 'secondary'}`}
              onClick={() => setTicketType('BUG')}
            >
              Hiba bejelentése
            </button>
            <button
              type="button"
              className={`button ${ticketType === 'SUGGEST_QUESTION' ? 'primary' : 'secondary'}`}
              onClick={() => setTicketType('SUGGEST_QUESTION')}
            >
              Kérdés javaslása
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            {ticketType === 'BUG' ? 'Hiba leírása' : 'Megjegyzés / Miért ajánlod ezt a kérdést?'}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder={ticketType === 'BUG' ? "Írd le részletesen a tapasztalt hibát..." : "Írj ide bármit, amit fontosnak tartasz..."}
          />
        </div>

        {ticketType === 'SUGGEST_QUESTION' && (
          <div className="suggested-question-fields">
            <div className="form-group">
              <label htmlFor="question">Kérdés</label>
              <input
                id="question"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Válaszlehetőségek</label>
              {answers.map((ans, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={ans}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[idx] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  placeholder={`${idx + 1}. válasz`}
                  required
                />
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="correct">Helyes válasz sorszáma</label>
              <select
                id="correct"
                value={correctIndex}
                onChange={(e) => setCorrectIndex(Number(e.target.value))}
                required
              >
                {answers.map((_, idx) => (
                  <option key={idx} value={idx}>
                    {idx + 1}. válasz
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="funfact">Érdekesség a kérdéshez</label>
              <textarea
                id="funfact"
                value={funfact}
                onChange={(e) => setFunfact(e.target.value)}
              />
            </div>
          </div>
        )}

        {message && (
          <div className={`message-banner ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="button primary" disabled={submitting}>
            {submitting ? 'Küldés...' : 'Ticket beküldése'}
          </button>
        </div>
      </form>

      <style>{`
        .tickets-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 20px;
        }
        .ticket-type-selector {
          display: flex;
          gap: 10px;
        }
        .suggested-question-fields {
          border-top: 1px solid var(--border-blue);
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        @media screen and (max-width: 600px) {
          .ticket-type-selector {
            flex-direction: column;
          }
          .ticket-type-selector button {
            width: 100%;
          }
          .tickets-page {
            padding: 20px;
            margin: 0;
            border-radius: 12px;
          }
          .form-actions button {
            width: 100%;
          }
        }
        .message-banner {
          padding: 15px;
          border-radius: 12px;
          font-weight: 600;
        }
        .message-banner.success {
          background: rgba(88, 204, 2, 0.2);
          color: var(--duo-green);
          border: 1px solid var(--duo-green);
        }
        .message-banner.error {
          background: var(--error-bg);
          color: var(--error-light);
          border: 1px solid var(--error-light);
        }
        textarea {
          min-height: 100px;
          background: var(--input-bg);
          border: 2px solid var(--border-blue);
          border-radius: 12px;
          color: white;
          padding: 12px;
          resize: vertical;
        }
        input {
          background: var(--input-bg);
          border: 2px solid var(--border-blue);
          border-radius: 12px;
          color: white;
          padding: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-weight: 700;
          color: var(--text-header);
        }
      `}</style>
    </div>
  );
}
