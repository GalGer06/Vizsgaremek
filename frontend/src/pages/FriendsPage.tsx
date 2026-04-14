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
    if (!user) {
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
        fetch(`${API_BASE_URL}/user/${user.id}/friends`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/user/${user.id}/friend-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/user/${user.id}/friend-requests/sent`, {
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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const friendIds = new Set(friends.map((item) => item.id));
  const sentRequestReceiverIds = new Set(sentRequests.map((item) => item.receiver.id));

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
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    setAddingId(friendId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/friends/${friendId}`, {
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
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    setRemovingId(friendId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/friends/${friendId}`, {
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
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    setAcceptingRequestId(requestId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/friend-requests/accept/${requestId}`, {
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
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    setDecliningRequestId(requestId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/friend-requests/${requestId}`, {
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
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    setCancelingReceiverId(receiverId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/friend-requests/sent/${receiverId}`, {
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
    <section className="friends-page" style={{ color: 'white' }}>
      <div className="section-header">
        <h2 style={{ color: 'white' }}>Barátok</h2>
        <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
      </div>

      {error && <p className="message error">{error}</p>}

      <div className="friends-layout">
        <div className="friends-panel search-panel">
          <h3 style={{ color: 'white' }}>Felhasználó keresése</h3>
          <div className="friends-search-row">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Keresés felhasználónév alapján"
              type="search"
              style={{ color: 'white' }}
            />
          </div>

          <ul className="friends-list" style={{ listStyle: 'none', padding: 0 }}>
            {results.map((result) => (
              <li key={result.id} style={{ listStyle: 'none' }}>
                <div>
                  <strong style={{ color: 'white' }}>{result.username}</strong>
                  <p style={{ color: 'white' }}>{result.email}</p>
                </div>
                <button
                  className="button secondary"
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
                        ? 'Hozzáadás...'
                        : 'Hozzáadás'}
                </button>
              </li>
            ))}
            {!results.length && searchTerm.trim() && !searching && (
              <li className="friends-empty" style={{ color: 'white' }}>Nincs találat.</li>
            )}
          </ul>
        </div>

        <div className="friends-panel">
          <h3 style={{ color: 'white' }}>Beérkező kérelmek</h3>
          {loadingRequests && <p className="message" style={{ color: 'white' }}>Kérelmek betöltése...</p>}
          {!loadingRequests && (
            <ul className="friends-list" style={{ listStyle: 'none', padding: 0 }}>
              {requests.map((request) => (
                <li key={request.id} style={{ listStyle: 'none' }}>
                  <div>
                    <strong style={{ color: 'white' }}>{request.requester.username}</strong>
                    <p style={{ color: 'white' }}>{request.requester.email}</p>
                  </div>
                  <div className="friends-actions">
                    <button
                      className="button secondary"
                      type="button"
                      disabled={acceptingRequestId === request.id || decliningRequestId === request.id}
                      onClick={() => void acceptRequest(request.id)}
                    >
                      {acceptingRequestId === request.id ? 'Elfogadás...' : 'Elfogadás'}
                    </button>
                    <button
                      className="button secondary"
                      type="button"
                      disabled={acceptingRequestId === request.id || decliningRequestId === request.id}
                      onClick={() => void declineRequest(request.id)}
                    >
                      {decliningRequestId === request.id ? 'Elutasítás...' : 'Elutasítás'}
                    </button>
                  </div>
                </li>
              ))}
              {!requests.length && <li className="friends-empty" style={{ color: 'white' }}>Nincs beérkező barátkérelem.</li>}
            </ul>
          )}
        </div>

        <div className="friends-panel">
          <h3 style={{ color: 'white' }}>Elküldött kérelmek</h3>
          {loadingSentRequests && <p className="message" style={{ color: 'white' }}>Elküldött kérelmek betöltése...</p>}
          {!loadingSentRequests && (
            <ul className="friends-list" style={{ listStyle: 'none', padding: 0 }}>
              {sentRequests.map((request) => (
                <li key={request.id} style={{ listStyle: 'none' }}>
                  <div>
                    <strong style={{ color: 'white' }}>{request.receiver.username}</strong>
                    <p style={{ color: 'white' }}>{request.receiver.email}</p>
                  </div>
                  <button
                    className="button secondary"
                    type="button"
                    disabled={cancelingReceiverId === request.receiver.id}
                    onClick={() => void cancelSentRequest(request.receiver.id)}
                  >
                    {cancelingReceiverId === request.receiver.id ? 'Visszavonás...' : 'Visszavonás'}
                  </button>
                </li>
              ))}
              {!sentRequests.length && <li className="friends-empty" style={{ color: 'white' }}>Nincs elküldött barátkérelem.</li>}
            </ul>
          )}
        </div>

        <div className="friends-panel">
          <h3 style={{ color: 'white' }}>Barátlistám</h3>
          {loadingFriends && <p className="message" style={{ color: 'white' }}>Barátok betöltése...</p>}
          {!loadingFriends && (
            <ul className="friends-list" style={{ listStyle: 'none', padding: 0 }}>
              {friends.map((friend) => (
                <li key={friend.id} style={{ listStyle: 'none' }}>
                  <div>
                    <strong style={{ color: 'white' }}>{friend.username}</strong>
                    <p style={{ color: 'white' }}>{friend.email}</p>
                  </div>
                  <button
                    className="button secondary"
                    type="button"
                    disabled={removingId === friend.id}
                    onClick={() => void removeFriend(friend.id)}
                  >
                    {removingId === friend.id ? 'Eltávolítás...' : 'Eltávolítás'}
                  </button>
                </li>
              ))}
              {!friends.length && <li className="friends-empty" style={{ color: 'white' }}>Még nincs felvett barátod.</li>}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
