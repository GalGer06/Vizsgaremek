import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, TOKEN_KEY } from '../constants';
import type { Question } from '../types';

export function DailyTasksPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, boolean>>({});
  const [showPointPopup, setShowPointPopup] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [popupValue, setPopupValue] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDailyQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const savedUser = localStorage.getItem('user');
        const user = savedUser ? JSON.parse(savedUser) : null;
        
        let url = `${API_BASE_URL}/feladatok/daily`;
        const token = localStorage.getItem(TOKEN_KEY);
        const headers: Record<string, string> = {};
        
        if (user && token) {
          url = `${API_BASE_URL}/feladatok/user/${user.id}`;
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error('Nem sikerült lekérdezni a kérdéseket.');
        }
        
        let data = (await response.json()) as (Question & { isAnswered?: boolean; userSelectedAnswer?: string })[];
        
        // If we fetched the full list, we need to pick the daily 3
        if (url.includes('/user/')) {
            const today = new Date();
            const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
            let seed = 0;
            for (let i = 0; i < dateString.length; i++) seed += dateString.charCodeAt(i);
            
            const shuffled = [...data].sort((a, b) => {
                const valA = (a.id * seed) % 101;
                const valB = (b.id * seed) % 101;
                return valA - valB;
            });
            data = shuffled.slice(0, 3);
        }

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

    void loadDailyQuestions();
  }, []);

  const handleSelectAnswer = (questionId: number, answer: string) => {
    if (checkedAnswers[questionId]) return;
    setSelectedAnswers((curr) => ({ ...curr, [questionId]: answer }));
  };

  const handleCheckAnswer = async (questionId: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!selectedAnswers[questionId] || !question) return;

    const isCorrect = selectedAnswers[questionId] === question.correct;
    setCheckedAnswers((curr) => ({ ...curr, [questionId]: true }));

    try {
      const savedUser = localStorage.getItem('user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      if (user) {
        const token = localStorage.getItem(TOKEN_KEY);
        
        // Save history including selected answer
        await fetch(`${API_BASE_URL}/feladatok/${questionId}/answer`, {
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

        if (isCorrect) {
          const pointsUpdate = { points: 30 };
          
          // Check if this is the 12th correct answer
          const newChecked = { ...checkedAnswers, [questionId]: true };
          const newlyCorrectCount = questions.filter(q => (q.id === questionId || newChecked[q.id]) && (q.id === questionId ? isCorrect : selectedAnswers[q.id] === q.correct)).length;
          const previouslyCorrectCount = questions.filter(q => q.isAnswered && q.userSelectedAnswer === q.correct).length;

          if (newlyCorrectCount >= 12 && previouslyCorrectCount < 12) {
            pointsUpdate.points = 530; // 30 for the question + 500 bonus
            setPopupValue(530);
            setShowBonusModal(true);
          } else {
            setPopupValue(30);
          }

          await fetch(`${API_BASE_URL}/userdatas/user/${user.id}/points`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token ?? ''}`,
            },
            body: JSON.stringify(pointsUpdate),
          });
          setShowPointPopup(true);
          setTimeout(() => setShowPointPopup(false), 2000);
        }
      }
    } catch (err) {
      console.error('Points error:', err);
    }
  };

  return (
    <section>
      {showPointPopup && <div className="new-points-popup">+{popupValue}</div>}
      
      {showBonusModal && (
        <div className="user-details-overlay" onClick={() => setShowBonusModal(false)}>
          <article className="user-details-modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <header className="modal-header">
              <h3 style={{ width: '100%', textAlign: 'center' }}>🎉 Gratulálunk!</h3>
            </header>
            <div className="modal-body">
              <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🏆</div>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-bright)' }}>
                Teljesítettél 12 napi kérdést helyesen!
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

      <div className="question-list">
        {questions.map((question, index) => {
          const previousQuestion = questions[index - 1];
          const isUnlocked = index === 0 || (previousQuestion ? checkedAnswers[previousQuestion.id] : false);

          if (!isUnlocked) return null;

          return (
            <article key={question.id} className="question-card">
              <div className="daily-badge">Napi feladat #{index + 1}</div>
              <h3>{question.question}</h3>
              <div className="new-answers-layout">
                {(question.answers ?? []).map((answer, i) => {
                  const label = String.fromCharCode(65 + i);
                  const selected = selectedAnswers[question.id] === answer;
                  const checked = checkedAnswers[question.id];
                  return (
                    <button
                      key={i}
                      className={`new-answer-option ${selected ? 'selected' : ''} ${checked && answer === question.correct ? 'correct' : ''} ${checked && selected && answer !== question.correct ? 'wrong' : ''}`}
                      onClick={() => handleSelectAnswer(question.id, answer)}
                      disabled={checked}
                    >
                      <strong>{label}.</strong> {answer}
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
                <p className={`message ${selectedAnswers[question.id] === question.correct ? 'correct' : 'wrong'}`}>
                  {selectedAnswers[question.id] === question.correct ? 'Helyes válasz!' : `Sajnos nem. A helyes: ${question.correct}`}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
