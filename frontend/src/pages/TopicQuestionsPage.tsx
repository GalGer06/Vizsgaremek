import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL, TOKEN_KEY, TOPICS } from '../constants';
import type { AuthUser, Question } from '../types';
import { normalizeText } from '../utils/text';

interface Props {
  user: AuthUser | null;
}

export function TopicQuestionsPage({ user }: Props) {
  const navigate = useNavigate();
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, boolean>>({});
  const [popups, setPopups] = useState<{ id: number; value: number }[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const topic = TOPICS.find((item) => item.slug === topicSlug);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const url = user 
          ? `${API_BASE_URL}/feladatok/user/${user.id}`
          : `${API_BASE_URL}/feladatok`;
        
        const token = localStorage.getItem(TOKEN_KEY);
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error('Nem sikerült lekérdezni a kérdéseket.');
        }
        const data = (await response.json()) as (Question & { isAnswered?: boolean; userSelectedAnswer?: string })[];
        
        // Mark answered questions as checked immediately and restore selected answer
        const alreadyChecked: Record<number, boolean> = {};
        const restoredSelections: Record<number, string> = {};
        
        data.forEach(q => {
          if (q.isAnswered) {
            alreadyChecked[q.id] = true;
            if (q.userSelectedAnswer) {
              restoredSelections[q.id] = q.userSelectedAnswer;
            }
          }
        });
        setCheckedAnswers(alreadyChecked);
        if (Object.keys(restoredSelections).length > 0) {
          setSelectedAnswers(restoredSelections);
        }
        
        setQuestions(data);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Ismeretlen hiba történt.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadQuestions();
  }, [user]);

  const filteredQuestions = useMemo(() => {
    if (!topic) {
      return [];
    }

    return questions.filter((question) => {
      const normalizedTitle = normalizeText(question.title);
      return topic.keywords.some((keyword) => normalizedTitle.includes(normalizeText(keyword)));
    });
  }, [questions, topic]);

  if (!topic) {
    return <p className="message error">Ismeretlen téma.</p>;
  }

  const handleSelectAnswer = (questionId: number, answer: string) => {
    if (checkedAnswers[questionId]) {
      return;
    }

    setSelectedAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));
  };

  const handleCheckAnswer = async (questionId: number) => {
    const question = filteredQuestions.find((q) => q.id === questionId);
    if (!selectedAnswers[questionId] || !question) {
      return;
    }

    const isCorrect = selectedAnswers[questionId] === question.correct;

    if (user) {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        // Save history including selected answer
        const response = await fetch(`${API_BASE_URL}/feladatok/${questionId}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token ?? ''}`,
          },
          body: JSON.stringify({ 
            isCorrect, 
            selectedAnswer: selectedAnswers[questionId] 
          }),
        });

        if (!response.ok) {
          throw new Error('Hiba történt a válasz mentésekor.');
        }

        const result = await response.json();
        
        // Use the server's verification for the UI to be 100% sure
        const verifiedCorrect = result.isCorrect;

        setCheckedAnswers((current) => ({
          ...current,
          [questionId]: true,
        }));

        if (verifiedCorrect) {
          // Show point popup animation
          const popupId = Date.now();
          setPopups((prev) => [...prev, { id: popupId, value: 30 }]);
          setTimeout(() => {
            setPopups((prev) => prev.filter((p) => p.id !== popupId));
          }, 2000);
        }

        // Smooth scroll to next question after result
        setTimeout(() => {
          const nextIndex = filteredQuestions.findIndex(q => q.id === questionId) + 1;
          if (nextIndex < filteredQuestions.length) {
            const nextQuestionId = filteredQuestions[nextIndex].id;
            setTimeout(() => {
              const nextCard = document.querySelector(`[data-question-id="${nextQuestionId}"]`);
              if (nextCard) {
                const targetPosition = nextCard.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight / 2) + (nextCard.clientHeight / 2);
                window.scrollTo({
                  top: targetPosition,
                  behavior: 'smooth'
                });
              }
            }, 100);
          } else {
            // No more questions in this topic
            setTimeout(() => {
              setShowCompletionModal(true);
            }, 1000);
          }
        }, 1500);

      } catch (err) {
        console.error('Hiba törént a mentés során:', err);
      }
    } else {
      // For guest users, just update UI
      setCheckedAnswers((current) => ({
        ...current,
        [questionId]: true,
      }));
    }
  };

  return (
    <section>
      {popups.map((popup) => (
        <div key={popup.id} className="new-points-popup">
          +{popup.value}
        </div>
      ))}
      
      {showCompletionModal && (
        <div className="user-details-overlay" onClick={() => setShowCompletionModal(false)}>
          <article className="user-details-modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <header className="modal-header">
              <h3 style={{ width: '100%', textAlign: 'center' }}>🎉 Gratulálunk!</h3>
            </header>
            <div className="modal-body">
              <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🌍</div>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-bright)' }}>
                Végére értél a(z) {topic.title} témának!
              </p>
              <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                Köszönjük, hogy velünk tanultál. Nézz körül más témák között is, vagy ajánlj nekünk új kérdéseket a Ticket oldalon!
              </p>
            </div>
            <footer className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                className="button secondary" 
                onClick={() => navigate('/topics')}
              >
                Más témák
              </button>
              <button 
                className="button primary-green" 
                onClick={() => navigate('/tickets')}
              >
                Kérdés beküldése
              </button>
            </footer>
          </article>
        </div>
      )}

      <div className="section-header">
        <h2>{topic.icon} {topic.title} kérdései</h2>
        <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
      </div>

      {loading && <p className="message">Kérdések betöltése...</p>}
      {error && <p className="message error">{error}</p>}

      {!loading && !error && filteredQuestions.length === 0 && (
        <p className="message">Ehhez a témához még nincs kérdés az adatbázisban.</p>
      )}

      <div className="question-list" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {filteredQuestions.map((question, index) => {
          const previousQuestion = filteredQuestions[index - 1];
          const isUnlocked = index === 0 || (previousQuestion ? checkedAnswers[previousQuestion.id] : false);

          if (!isUnlocked) {
            return null;
          }

          return (
          <article 
            key={question.id} 
            className="question-card" 
            data-question-id={question.id}
            style={{ 
              marginBottom: '0',
              border: '1px solid var(--border-blue)',
              padding: '30px',
              borderRadius: '20px'
            }}
          >
            <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', fontWeight: 800 }}>{question.question}</h3>
            
            <div className="new-answers-layout">
              {(question.answers ?? []).map((answer, index) => {
                const optionLabel = (index + 1).toString();
                const selected = selectedAnswers[question.id] === answer;
                const checked = checkedAnswers[question.id];
                const isCorrect = checked && answer === question.correct;
                const isWrongSelected = checked && selected && answer !== question.correct;

                return (
                  <button
                    key={`${question.id}-${optionLabel}`}
                    className={`new-answer-option ${selected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrongSelected ? 'wrong' : ''}`}
                    type="button"
                    onClick={() => handleSelectAnswer(question.id, answer)}
                    style={{ position: 'relative', overflow: 'hidden' }}
                  >
                    <strong style={{ whiteSpace: 'nowrap', position: 'absolute', left: '20px', zIndex: 1 }}>{optionLabel}.</strong>
                    <span style={{ width: '100%', textAlign: 'center', padding: '0 40px' }}>{answer}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="button btn-new-check check-answer-button"
              disabled={!selectedAnswers[question.id] || checkedAnswers[question.id]}
              onClick={() => handleCheckAnswer(question.id)}
            >
              Ellenőrzés
            </button>

            {checkedAnswers[question.id] && (
              <p className={`message answer-result ${selectedAnswers[question.id] === question.correct ? 'correct' : 'wrong'}`}>
                {selectedAnswers[question.id] === question.correct
                  ? 'Helyes válasz!'
                  : `Nem ez a jó válasz. A helyes: ${question.correct}`}
              </p>
            )}

            {checkedAnswers[question.id] && (
              <div style={{ marginTop: '20px', padding: '15px', borderRadius: '10px' }}>
                <p style={{ margin: '0 0 10px 0' }}><strong>Érdekesség:</strong> {question.funfact || 'Nincs plusz információ.'}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}><strong>Mikor lett a kérdés hozzáadva:</strong> {new Date(question.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </article>
        );})}
      </div>
    </section>
  );
}
