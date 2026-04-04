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
  const [showPointPopup, setShowPointPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const topic = TOPICS.find((item) => item.slug === topicSlug);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/feladatok`);
        if (!response.ok) {
          throw new Error('Nem sikerült lekérdezni a kérdéseket.');
        }
        const data = (await response.json()) as Question[];
        setQuestions(data);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Ismeretlen hiba történt.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadQuestions();
  }, []);

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

    setCheckedAnswers((current) => ({
      ...current,
      [questionId]: true,
    }));

    if (isCorrect && user) {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        await fetch(`${API_BASE_URL}/userdatas/user/${user.id}/points`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token ?? ''}`,
          },
          body: JSON.stringify({ points: 30 }),
        });
        
        // Show point popup animation
        setShowPointPopup(true);
        setTimeout(() => setShowPointPopup(false), 2000);
      } catch (err) {
        console.error('Nem sikerült a pontokat jóváírni:', err);
      }
    }
  };

  return (
    <section>
      {showPointPopup && (
        <div className="points-popup">
          +30
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

      <div className="question-list">
        {filteredQuestions.map((question, index) => {
          const previousQuestion = filteredQuestions[index - 1];
          const isUnlocked = index === 0 || (previousQuestion ? checkedAnswers[previousQuestion.id] : false);

          if (!isUnlocked) {
            return null;
          }

          return (
          <article key={question.id} className="question-card">
            <h3>{question.question}</h3>
            <div className="answers-grid">
              {(question.answers ?? []).map((answer, index) => {
                const optionLabel = String.fromCharCode(65 + index);
                const selected = selectedAnswers[question.id] === answer;
                const checked = checkedAnswers[question.id];
                const isCorrect = checked && answer === question.correct;
                const isWrongSelected = checked && selected && answer !== question.correct;

                return (
                  <button
                    key={`${question.id}-${optionLabel}`}
                    className={`answer-option ${selected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrongSelected ? 'wrong' : ''}`}
                    type="button"
                    onClick={() => handleSelectAnswer(question.id, answer)}
                  >
                    <strong>{optionLabel}.</strong> {answer}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="button primary-green check-answer-button"
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
              <>
                <p><strong>Érdekesség:</strong> {question.funfact}</p>
                <p><strong>Történelmi háttér:</strong> {question.history}</p>
              </>
            )}
          </article>
        );})}
      </div>
    </section>
  );
}
