import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, TOKEN_KEY, USER_KEY } from '../constants';
import type { Question } from '../types';

export function DailyTasksPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, boolean>>({});
  const [popups, setPopups] = useState<{ id: number; value: number }[]>([]);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDailyQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const savedUser = localStorage.getItem(USER_KEY);
        const user = savedUser ? JSON.parse(savedUser) : null;
        const token = localStorage.getItem(TOKEN_KEY);
        
        // Use user-specific URL as primary for logged-in users
        let url = `${API_BASE_URL}/feladatok/daily`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        if (user && token) {
          url = `${API_BASE_URL}/feladatok/user/${user.id}`;
        }

        console.log(`Fetching questions from: ${url}`);
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error('Nem sikerült lekérdezni a kérdéseket.');
        }
        
        let data = (await response.json()) as (Question & { isAnswered?: boolean; userSelectedAnswer?: string })[];
        
        // Pick only the first 10 questions for consistent daily experience
        data = data.slice(0, 10);

        const alreadyChecked: Record<number, boolean> = {};
        const restoredSelections: Record<number, string> = {};
        
        // Restore selections and results from backend data
        data.forEach(q => {
          if (q.isAnswered) {
            console.log(`Restoring question ${q.id} (Answered: ${q.userSelectedAnswer})`);
            alreadyChecked[q.id] = true;
            if (q.userSelectedAnswer) {
              restoredSelections[q.id] = q.userSelectedAnswer;
            }
          }
        });

        // Forced batch update
        setCheckedAnswers(alreadyChecked);
        setSelectedAnswers(restoredSelections);
        setQuestions(data);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Ismeretlen hiba történt.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadDailyQuestions();
  }, [navigate]);

  const handleSelectAnswer = (questionId: number, answer: string) => {
    if (checkedAnswers[questionId]) return;
    setSelectedAnswers((curr) => ({ ...curr, [questionId]: answer }));
  };

  const handleCheckAnswer = async (questionId: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!selectedAnswers[questionId] || !question || checkedAnswers[questionId]) return;

    const isCorrect = selectedAnswers[questionId] === question.correct;
    
    // Update local state immediately for UI feedback
    setCheckedAnswers((curr) => ({ ...curr, [questionId]: true }));

    try {
      const savedUser = localStorage.getItem(USER_KEY);
      const user = savedUser ? JSON.parse(savedUser) : null;
      const token = localStorage.getItem(TOKEN_KEY);

      if (user && token) {
        console.log(`Recording answer for question ${questionId}: ${isCorrect ? 'correct' : 'wrong'}`);

        // 1. Record the answer in DB history
        await fetch(`${API_BASE_URL}/feladatok/${questionId}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            isCorrect: Boolean(isCorrect),
            selectedAnswer: String(selectedAnswers[questionId])
          }),
        });

        // 2. Award individual points if correct
        if (isCorrect) {
          const popupId = Date.now();
          setPopups((prev) => [...prev, { id: popupId, value: 30 }]);
          setTimeout(() => {
            setPopups((prev) => prev.filter((p) => p.id !== popupId));
          }, 2000);
        }

        // 3. Check for 500pt bonus (completion of all 3 daily questions correctly)
        // Note: we use the functional update to get the very latest count if needed, 
        // but since we just set it above, currentCheckedCount + 1 is accurate for this sync execution.
        const currentCheckedCount = Object.keys(checkedAnswers).length;
        const totalQuestions = questions.length;
        
        if (currentCheckedCount + 1 === totalQuestions) {
          const allOthersCorrect = questions.every(q => {
            if (q.id === questionId) return isCorrect; 
            return selectedAnswers[q.id] === q.correct;
          });

          if (allOthersCorrect) {
            console.log("AWARDING 500 BONUS POINTS");
            await fetch(`${API_BASE_URL}/userdatas/user/${user.id}/points`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ points: 500, isDailyBonus: true }),
            });
            setShowBonusModal(true);
          }
        }
      } else {
        console.warn("User or Token missing - points not saved. Looking for keys:", { USER_KEY, TOKEN_KEY });
        console.log("Actual localStorage items:", { 
          [USER_KEY]: localStorage.getItem(USER_KEY), 
          [TOKEN_KEY]: localStorage.getItem(TOKEN_KEY),
          'user': localStorage.getItem('user') // Debugging if it's named 'user' instead
        });
      }
    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  return (
    <section>
      {popups.map((popup) => (
        <div key={popup.id} className="new-points-popup">
          +{popup.value}
        </div>
      ))}
      
      {showBonusModal && (
        <div className="user-details-overlay" onClick={() => setShowBonusModal(false)}>
          <article className="user-details-modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <header className="modal-header">
              <h3 style={{ width: '100%', textAlign: 'center' }}>🎉 Gratulálunk!</h3>
            </header>
            <div className="modal-body">
              <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🏆</div>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-bright)' }}>
                Mind a 10 napi kérdést helyesen válaszoltad meg!
              </p>
              <p style={{ color: 'var(--duo-green)', fontSize: '1.5rem', fontWeight: '900' }}>
                +500 EXTRA PONT
              </p>
              <p style={{ color: 'var(--text-muted)' }}>
                Ezzel a teljesítménnyel szintet is léptél! Folytasd tovább a tanulást!
              </p>
            </div>
            <footer className="modal-footer" style={{ justifyContent: 'center' }}>
              <button 
                className="button primary-green" 
                onClick={() => setShowBonusModal(false)}
                style={{ minWidth: '150px' }}
              >
                Szuper!
              </button>
            </footer>
          </article>
        </div>
      )}

      <div className="section-header">
        <h2>🌱 Napi Feladatok</h2>
        <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
      </div>

      {loading && <p className="message">Kérdések összeállítása mára...</p>}
      {error && <p className="message error">{error}</p>}

      {!loading && !error && questions.length === 0 && (
        <p className="message">Nincsenek elérhető feladatok mára.</p>
      )}

      <div 
        className="question-list" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '40px', 
          paddingBottom: '60px'
        }}
      >
        {questions.map((question, index) => {
          const previousQuestion = questions[index - 1];
          const isUnlocked = index === 0 || (previousQuestion ? checkedAnswers[previousQuestion.id] : false);

          if (!isUnlocked) return null;

          return (
      <article 
        key={question.id} 
        className="question-card" 
        data-id={question.id}
        data-answered={checkedAnswers[question.id] ? 'true' : 'false'}
        style={{ 
          marginBottom: '0',
          border: '1px solid var(--border-blue)',
          padding: '30px',
          borderRadius: '20px'
        }}
      >
              <div className="daily-badge">Napi feladat #{index + 1}</div>
              <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', fontWeight: 800 }}>{question.question}</h3>
              <div className="new-answers-layout">
                {(question.answers ?? []).map((answer, i) => {
                  const label = (i + 1).toString();
                  const selected = selectedAnswers[question.id] === answer;
                  const checked = checkedAnswers[question.id];
                  return (
                    <button
                      key={i}
                      className={`new-answer-option ${selected ? 'selected' : ''} ${checked && answer === question.correct ? 'correct' : ''} ${checked && selected && answer !== question.correct ? 'wrong' : ''}`}
                      onClick={() => handleSelectAnswer(question.id, answer)}
                      disabled={checked}
                      style={{ position: 'relative', overflow: 'hidden' }}
                    >
                      <strong style={{ whiteSpace: 'nowrap', position: 'absolute', left: '20px', zIndex: 1 }}>{label}.</strong>
                      <span style={{ width: '100%', textAlign: 'center', padding: '0 40px' }}>{answer}</span>
                    </button>
                  );
                })}
              </div>
              <button
                className="button btn-new-check"
                onClick={() => handleCheckAnswer(question.id)}
                disabled={!selectedAnswers[question.id] || checkedAnswers[question.id]}
              >
                Válasz beküldése
              </button>
              {checkedAnswers[question.id] && (
                <div style={{ marginTop: '15px' }}>
                  <p className={`message ${selectedAnswers[question.id] === question.correct ? 'correct' : 'wrong'}`}>
                    {selectedAnswers[question.id] === question.correct ? 'Helyes válasz!' : `Sajnos nem. A helyes: ${question.correct}`}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
