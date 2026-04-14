import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { API_BASE_URL, TOKEN_KEY } from '../constants';
import type { AuthUser, FriendUser, IncomingFriendRequest, SentFriendRequest } from '../types';

type FriendsPageProps = {
  user: AuthUser | null;
};

export function FriendsPage({ user }: FriendsPageProps) {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<IncomingFriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SentFriendRequest[]>([]);
  const [results, setResults] = useState<FriendUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingSentRequests, setLoadingSentRequests] = useState(true);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [acceptingRequestId, setAcceptingRequestId] = useState<number | null>(null);
  const [decliningRequestId, setDecliningRequestId] = useState<number | null>(null);
  const [cancelingReceiverId, setCancelingReceiverId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadSocialData = async () => {
    // Check user first
    const u = user || JSON.parse(localStorage.getItem('wdad_user') || 'null');
    if (!u) {
      console.log('No user found');
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      setLoadingFriends(false);
      setLoadingRequests(false);
      setLoadingSentRequests(false);
      return;
    }

    setLoadingFriends(true);
    setLoadingRequests(true);
    setLoadingSentRequests(true);
    setError('');

    try {
      const [friendsResponse, requestsResponse, sentRequestsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/user/${u.id}/friends`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/user/${u.id}/friend-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/user/${u.id}/friend-requests/sent`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!friendsResponse.ok || !requestsResponse.ok || !sentRequestsResponse.ok) {
        throw new Error('Nem sikerült betölteni a barát adatokat.');
      }

      const friendsData = (await friendsResponse.json()) as FriendUser[];
      const requestsData = (await requestsResponse.json()) as IncomingFriendRequest[];
      const sentRequestsData = (await sentRequestsResponse.json()) as SentFriendRequest[];
      setFriends(friendsData);
      setRequests(requestsData);
      setSentRequests(sentRequestsData);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setLoadingFriends(false);
      setLoadingRequests(false);
      setLoadingSentRequests(false);
    }
  };

  useEffect(() => {
    void loadSocialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const friendIds = new Set(friends?.map((item) => item.id) || []);
  const sentRequestReceiverIds = new Set(sentRequests?.map((item) => item?.receiver?.id).filter(id => id !== undefined) || []);

  const runSearch = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      setError('');
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/user/search/by-username?username=${encodeURIComponent(trimmed)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Nem sikerült keresni a felhasználók között.');
      }

      const data = (await response.json()) as FriendUser[];
      setResults(data);
    } catch (searchError) {
      const message = searchError instanceof Error ? searchError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void runSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const addFriend = async (friendId: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const u = user || JSON.parse(localStorage.getItem('wdad_user') || 'null');
    if (!token || !u) {
      setError('Hiányzó token vagy felhasználó. Jelentkezz be újra.');
      return;
    }

    setAddingId(friendId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${u.id}/friends/${friendId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Nem sikerült hozzáadni a barátot.');
      }

      await response.json().catch(() => ({}));
      await loadSocialData();
    } catch (addError) {
      const message = addError instanceof Error ? addError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setAddingId(null);
    }
  };

  const removeFriend = async (friendId: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const u = user || JSON.parse(localStorage.getItem('wdad_user') || 'null');
    if (!token || !u) {
      setError('Hiányzó token vagy felhasználó. Jelentkezz be újra.');
      return;
    }

    setRemovingId(friendId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${u.id}/friends/${friendId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Nem sikerült eltávolítani a barátot.');
      }

      const updatedFriends = (await response.json()) as FriendUser[];
      setFriends(updatedFriends);
    } catch (removeError) {
      const message = removeError instanceof Error ? removeError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setRemovingId(null);
    }
  };

  const acceptRequest = async (requestId: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const u = user || JSON.parse(localStorage.getItem('wdad_user') || 'null');
    if (!token || !u) {
      setError('Hiányzó token vagy felhasználó. Jelentkezz be újra.');
      return;
    }

    setAcceptingRequestId(requestId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${u.id}/friend-requests/accept/${requestId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Nem sikerült elfogadni a barátkérelmet.');
      }

      const data = (await response.json()) as {
        friends: FriendUser[];
        requests: IncomingFriendRequest[];
      };

      setFriends(data.friends);
      setRequests(data.requests);
      await loadSocialData();
    } catch (acceptError) {
      const message = acceptError instanceof Error ? acceptError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setAcceptingRequestId(null);
    }
  };

  const declineRequest = async (requestId: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const u = user || JSON.parse(localStorage.getItem('wdad_user') || 'null');
    if (!token || !u) {
      setError('Hiányzó token vagy felhasználó. Jelentkezz be újra.');
      return;
    }

    setDecliningRequestId(requestId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${u.id}/friend-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Nem sikerült elutasítani a barátkérelmet.');
      }

      const updatedRequests = (await response.json()) as IncomingFriendRequest[];
      setRequests(updatedRequests);
    } catch (declineError) {
      const message = declineError instanceof Error ? declineError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setDecliningRequestId(null);
    }
  };

  const cancelSentRequest = async (receiverId: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const u = user || JSON.parse(localStorage.getItem('wdad_user') || 'null');
    if (!token || !u) {
      setError('Hiányzó token vagy felhasználó. Jelentkezz be újra.');
      return;
    }

    setCancelingReceiverId(receiverId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${u.id}/friend-requests/sent/${receiverId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Nem sikerült visszavonni a kérelmet.');
      }

      const updatedSentRequests = (await response.json()) as SentFriendRequest[];
      setSentRequests(updatedSentRequests);
    } catch (cancelError) {
      const message = cancelError instanceof Error ? cancelError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setCancelingReceiverId(null);
    }
  };

  return (
    <section className="friends-page" style={{ padding: '0px' }}>
      <div className="section-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', margin: 0 }}>Barátok</h2>
        <button onClick={() => navigate('/')} className="button secondary">Vissza a főoldalra</button>
      </div>

      {error && <p className="message error" style={{ background: '#ff4d4d22', padding: '15px', borderRadius: '12px', border: '2px solid #ff4d4d', color: '#ff4d4d', marginBottom: '30px' }}>{error}</p>}

      <div className="friends-layout">
        <div className="friends-panel search-panel">
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-header)' }}>Felhasználó keresése</h3>
          <div className="friends-search-row">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Írj be egy nevet..."
              type="search"
              style={{ padding: '15px', borderRadius: '12px', border: '2px solid var(--border-blue)', background: 'var(--input-bg)', color: 'white', fontSize: '1rem' }}
            />
          </div>

          <ul className="friends-list">
            {results.map((result) => (
              <li key={result.id}>
                <div>
                  <strong>{result.username}</strong>
                  <p>{result.email}</p>
                </div>
                <button
                  className="button"
                  style={{ fontSize: '0.85rem', padding: '10px 18px' }}
                  type="button"
                  disabled={
                    friendIds.has(result.id) ||
                    sentRequestReceiverIds.has(result.id) ||
                    addingId === result.id
                  }
                  onClick={() => void addFriend(result.id)}
                >
                  {friendIds.has(result.id)
                    ? 'Már barát'
                    : sentRequestReceiverIds.has(result.id)
                      ? 'Kérés elküldve'
                      : addingId === result.id
                        ? '...'
                        : 'Felvétel'}
                </button>
              </li>
            ))}
            {!results.length && searchTerm.trim() && !searching && (
              <li className="friends-empty" style={{ opacity: 0.7, fontStyle: 'italic', background: 'transparent', border: 'none' }}>Nincs találat.</li>
            )}
          </ul>
        </div>

        <div className="friends-panel">
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-header)' }}>Beérkező kérelmek</h3>
          {loadingRequests && <p className="message">Kérelmek betöltése...</p>}
          {!loadingRequests && (
            <ul className="friends-list">
              {requests.map((request) => (
                <li key={request.id}>
                  <div>
                    <strong>{request.requester.username}</strong>
                    <p>{request.requester.email}</p>
                  </div>
                  <div className="friends-actions">
                    <button
                      className="button"
                      style={{ fontSize: '0.85rem', padding: '8px 14px', background: 'var(--duo-green)', borderBottomColor: 'var(--duo-green-shadow)' }}
                      type="button"
                      disabled={acceptingRequestId === request.id || decliningRequestId === request.id}
                      onClick={() => void acceptRequest(request.id)}
                    >
                      ✔
                    </button>
                    <button
                      className="button danger"
                      style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                      type="button"
                      disabled={acceptingRequestId === request.id || decliningRequestId === request.id}
                      onClick={() => void declineRequest(request.id)}
                    >
                      ✖
                    </button>
                  </div>
                </li>
              ))}
              {!requests.length && <li className="friends-empty" style={{ opacity: 0.7, fontStyle: 'italic', background: 'transparent', border: 'none' }}>Nincs beérkező kérelem.</li>}
            </ul>
          )}
        </div>

        <div className="friends-panel">
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-header)' }}>Barátlistám</h3>
          {loadingFriends && <p className="message">Barátok betöltése...</p>}
          {!loadingFriends && (
            <ul className="friends-list">
              {friends.map((friend) => (
                <li key={friend.id}>
                  <div>
                    <strong>{friend.username}</strong>
                    <p>{friend.level}. szint</p>
                  </div>
                  <button
                    className="button danger"
                    style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                    type="button"
                    disabled={removingId === friend.id}
                    onClick={() => void removeFriend(friend.id)}
                  >
                    Törlés
                  </button>
                </li>
              ))}
              {!friends.length && <li className="friends-empty" style={{ opacity: 0.7, fontStyle: 'italic', background: 'transparent', border: 'none' }}>Még nincsenek barátaid.</li>}
            </ul>
          )}
        </div>

        <div className="friends-panel">
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-header)' }}>Elküldött várólistán</h3>
          {loadingSentRequests && <p className="message">Betöltés...</p>}
          {!loadingSentRequests && (
            <ul className="friends-list">
              {sentRequests.map((request) => (
                <li key={request.id}>
                  <div>
                    <strong>{request.receiver?.username || 'Ismeretlen felhasználó'}</strong>
                    <p>Függőben...</p>
                  </div>
                  <button
                    className="button secondary"
                    style={{ fontSize: '0.85rem', padding: '8px 14px', background: '#666' }}
                    type="button"
                    disabled={cancelingReceiverId === request.receiver?.id}
                    onClick={() => request.receiver?.id && void cancelSentRequest(request.receiver.id)}
                  >
                    Mégse
                  </button>
                </li>
              ))}
              {!sentRequests.length && <li className="friends-empty" style={{ opacity: 0.7, fontStyle: 'italic', background: 'transparent', border: 'none' }}>Nincs elküldött kérelem.</li>}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
