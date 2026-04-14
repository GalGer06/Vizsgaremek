import { useEffect, useState } from 'react';
import { API_BASE_URL, TOKEN_KEY } from '../constants';
import type { LeaderboardEntry } from '../types';

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem('wdad_user');
        if (!token || !userStr) {
          setError('Not authenticated');
          return;
        }

        const user = JSON.parse(userStr);
        const response = await fetch(
          `${API_BASE_URL}/user/${user.id}/leaderboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }

        const data: LeaderboardEntry[] = await response.json();
        setLeaderboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="leaderboard-container">
        <h3>Rangsor</h3>
        <div className="leaderboard-loading">Betöltés...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <h3>Rangsor</h3>
        <div className="leaderboard-error">Hiba: {error}</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h3>Rangsor</h3>
      {leaderboard.length === 0 ? (
        <div className="leaderboard-empty">Nincsenek barátaid még</div>
      ) : (
        <div className="leaderboard-table">
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              className={`leaderboard-row ${
                entry.isCurrentUser ? 'current-user' : ''
              }`}
            >
              <div className="leaderboard-rank">
                {entry.rank === 1 && '🥇'}
                {entry.rank === 2 && '🥈'}
                {entry.rank === 3 && '🥉'}
                {entry.rank > 3 && `#${entry.rank}`}
              </div>
              <div className="leaderboard-username">
                {entry.username}
                {entry.isCurrentUser && ' (Te)'}
              </div>
              <div className="leaderboard-points">
                <span className="points-value">{entry.points} </span>
                <span className="points-label">pont</span>
              </div>
              <div className="leaderboard-level">
                Szint {entry.level}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
