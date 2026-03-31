import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL, TOPICS } from '../constants';
import type { Question } from '../types';
import { normalizeText } from '../utils/text';

export function TopicQuestionsPage() {
  const navigate = useNavigate();
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
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

  return (
    <section>
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
        {filteredQuestions.map((question) => (
          <article key={question.id} className="question-card">
            <h3>{question.question}</h3>
            <div className="answers-grid">
              {Object.entries(question.answers ?? {}).map(([key, value]) => (
                <div key={key} className="answer-chip">
                  <strong>{key.toUpperCase()}.</strong> {value}
                </div>
              ))}
            </div>
            <p><strong>Érdekesség:</strong> {question.funfact}</p>
            <p><strong>Történelmi háttér:</strong> {question.history}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
