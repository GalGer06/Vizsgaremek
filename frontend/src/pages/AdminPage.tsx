import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL, TOKEN_KEY, TOPICS } from '../constants';
import type { AdminUser, AuthUser, Question } from '../types';

type Ticket = {
  id: number;
  type: 'BUG' | 'SUGGEST_QUESTION';
  description: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
  attachment?: any;
};

type AdminPageProps = {
  user: AuthUser | null;
};

export function AdminPage({ user }: AdminPageProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'tickets'>('users');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [addingQuestionFromTicket, setAddingQuestionFromTicket] = useState<Ticket | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[0]?.title || 'Alapfogalmak');
  const [usernameSearch, setUsernameSearch] = useState('');
  const [questionSearch, setQuestionSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Question>>({});
  const [userPoints, setUserPoints] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [savingPoints, setSavingPoints] = useState(false);
  const [pointAdjust, setPointAdjust] = useState<number>(30);

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const [usersResponse, questionsResponse, ticketsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/feladatok`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/tickets`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!usersResponse.ok || !questionsResponse.ok || !ticketsResponse.ok) {
          throw new Error('Nem sikerült betölteni az admin adatokat.');
        }

        const usersData = (await usersResponse.json()) as AdminUser[];
        const questionsData = (await questionsResponse.json()) as Question[];
        const ticketsData = (await ticketsResponse.json()) as Ticket[];

        setUsers(usersData);
        setQuestions(questionsData);
        setTickets(ticketsData);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Ismeretlen hiba történt.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.access) {
      void loadAdminData();
    }
  }, [user]);

  if (!user?.access) {
    return (
      <section>
        <div className="section-header">
          <h2>Admin oldal</h2>
          <button onClick={() => navigate(-1)} className="button secondary link-button">Vissza</button>
        </div>
        <p className="message error">Nincs admin jogosultságod ehhez az oldalhoz.</p>
      </section>
    );
  }

  const adminCount = users.filter((item) => item.access).length;
  const isSuperAdmin = user.username && ['Rikimik', 'GalGer'].includes(user.username);
  const isOriginalAdmin = user.username && ['Rikimik', 'GalGer'].includes(user.username);
  
  const searchValue = usernameSearch.trim().toLowerCase();
  
  // Sort users: Super Admins first (Rikimik then GalGer), then other admins, then regular users
  const sortedUsers = [...users].sort((a, b) => {
    const superAdmins = ['Rikimik', 'GalGer'];
    const aIsSuper = superAdmins.includes(a.username);
    const bIsSuper = superAdmins.includes(b.username);

    if (aIsSuper && bIsSuper) {
      return superAdmins.indexOf(a.username) - superAdmins.indexOf(b.username);
    }
    if (aIsSuper) return -1;
    if (bIsSuper) return 1;
    
    // Then other admins
    if (a.access && !b.access) return -1;
    if (!a.access && b.access) return 1;
    
    return 0;
  });

  const filteredUsers = sortedUsers.filter((listedUser) =>
    listedUser.username.toLowerCase().includes(searchValue),
  );

  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
    q.id.toString() === questionSearch.trim()
  );

  const filteredTickets = tickets.filter((t) =>
    t.description.toLowerCase().includes(ticketSearch.toLowerCase()) ||
    t.user.username.toLowerCase().includes(ticketSearch.toLowerCase()) ||
    t.user.email.toLowerCase().includes(ticketSearch.toLowerCase()) ||
    t.id.toString() === ticketSearch.trim()
  );

  const setAdminAccess = async (targetUserId: number, nextAccess: boolean) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    setUpdatingUserId(targetUserId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${targetUserId}/access`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ access: nextAccess }),
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Nem sikerült frissíteni a jogosultságot.');
      }

      setUsers((prev) =>
        prev.map((listedUser) =>
          listedUser.id === targetUserId ? { ...listedUser, access: nextAccess } : listedUser,
        ),
      );
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const deleteUser = async (targetUserId: number) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a felhasználót?')) {
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    setUpdatingUserId(targetUserId);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/user/${targetUserId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse.message ?? 'Nem sikerült törölni a felhasználót.');
      }

      setUsers((prev) => prev.filter((u) => u.id !== targetUserId));
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Ismeretlen hiba történt.';
      setError(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const viewUserDetails = async (targetUserId: number) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Hiányzó token. Jelentkezz be újra.');
      return;
    }

    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/user/${targetUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Nem sikerült lekérni a felhasználó adatait.');
      }

      const userData = (await response.json()) as AdminUser;
      setSelectedUser(userData);

      const pointsResponse = await fetch(`${API_BASE_URL}/userdatas/user/${targetUserId}/achievements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setUserPoints(pointsData.totalPoints || 0);
        setUserLevel(pointsData.level || 1);
      }
    } catch (viewError) {
      const message = viewError instanceof Error ? viewError.message : 'Ismeretlen hiba történt.';
      setError(message);
    }
  };

  const handleUpdatePoints = async (amount: number) => {
    if (!selectedUser) return;
    const token = localStorage.getItem(TOKEN_KEY);

    setSavingPoints(true);
    try {
      const response = await fetch(`${API_BASE_URL}/userdatas/user/${selectedUser.id}/points`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points: amount }),
      });

      if (!response.ok) throw new Error('Nem sikerült a pontok frissítése.');

      const updated = await response.json();
      setUserPoints(updated.totalPoints);
      setUserLevel(updated.level);
      alert('Pontok sikeresen frissítve!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt.');
    } finally {
      setSavingPoints(false);
    }
  };

  const resetAdminAnswers = async () => {
    if (!window.confirm('Biztosan törölni szeretnéd az összes eddigi válaszodat? Ez nem vonható vissza.')) {
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/feladatok/reset-answers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Nem sikerült a válaszok törlése.');

      alert('Válaszaid sikeresen törölve lettek!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt.');
    }
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setEditFormData({ ...q });
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    const token = localStorage.getItem(TOKEN_KEY);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/feladatok/${editingQuestion.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error('Nem sikerült a módosítás.');

      const updated = (await response.json()) as Question;
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      setEditingQuestion(null);
      alert('Kérdés sikeresen frissítve!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt.');
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...(editFormData.answers || [])];
    newAnswers[index] = value;
    setEditFormData({ ...editFormData, answers: newAnswers });
  };

  const updateTicketStatus = async (id: number, status: 'OPEN' | 'CLOSED') => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Hiba a státusz frissítésekor');
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Hiba történt');
    }
  };

  const deleteTicket = async (id: number) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a ticketet?')) return;
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Hiba a törléskor');
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Hiba történt');
    }
  };

  const addSuggestedQuestion = async (ticket: Ticket) => {
    if (!ticket.attachment) return;
    const token = localStorage.getItem(TOKEN_KEY);
    
    try {
      const response = await fetch(`${API_BASE_URL}/feladatok`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: selectedTopic,
          question: ticket.attachment.question,
          answers: ticket.attachment.answers,
          correct: ticket.attachment.correct,
          funfact: ticket.attachment.funfact || '',
          // No history needed anymore as it's optional in DTO
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Hiba a kérdés hozzáadásakor');
      }

      // Close the ticket automatically after successful addition
      await updateTicketStatus(ticket.id, 'CLOSED');
      
      setAddingQuestionFromTicket(null);
      alert('Kérdés sikeresen hozzáadva a(z) ' + selectedTopic + ' témakörhöz!');
      
      // Refresh questions list
      const qRes = await fetch(`${API_BASE_URL}/feladatok`);
      if (qRes.ok) setQuestions(await qRes.json());
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Hiba történt');
    }
  };

  return (
    <section style={{ color: 'white' }}>
      <div className="section-header" style={{ alignItems: 'center', paddingBottom: '10px' }}>
        <h2 style={{ color: 'white', margin: 0 }}>Admin dashboard</h2>
        <div className="admin-tabs" style={{ marginBottom: 0, display: 'flex', alignItems: 'stretch' }}>
          <button 
            className={`button ${activeTab === 'users' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('users')}
            style={{ margin: 0 }}
          >
            Felhasználók
          </button>
          <button 
            className={`button ${activeTab === 'questions' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('questions')}
            style={{ margin: 0 }}
          >
            Kérdések
          </button>
          <button 
            className={`button ${activeTab === 'tickets' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('tickets')}
            style={{ margin: 0 }}
          >
            Ticketek ({tickets.filter(t => t.status === 'OPEN').length})
          </button>
        </div>
        <button onClick={() => navigate(-1)} className="button secondary link-button" style={{ margin: 0 }}>Vissza</button>
      </div>

      <style>{`
        .admin-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .admin-card {
          background: var(--surface-main);
          border: 2px solid var(--border-blue);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          color: white;
        }
        .admin-users ul li,
        .admin-question-item,
        .ticket-item {
          background: var(--surface-main) !important;
          border: 2px solid var(--border-blue) !important;
          border-radius: 12px !important;
          padding: 20px !important;
          margin-bottom: 15px !important;
          color: white !important;
          list-style: none !important;
        }
        .admin-users ul {
          padding: 0;
          margin: 0;
        }
        .admin-users ul li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .user-info-text {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 150px;
        }

        .admin-user-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-direction: row;
        }

        .admin-user-actions button {
          white-space: nowrap;
          margin: 0;
          width: auto;
        }

        .admin-question-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .ticket-item {
          color: var(--text-main);
        }
        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          border-bottom: 1px solid var(--border-blue);
          padding-bottom: 10px;
          color: var(--text-bright);
          flex-wrap: wrap;
          gap: 10px;
        }
        .ticket-header small {
          color: var(--text-muted);
        }
        .ticket-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        .badge-bug { background: #ff4444; color: white; }
        .badge-suggest { background: #00C851; color: white; }
        .badge-open { border: 1px solid #ffbb33; color: #ffbb33; }
        .badge-closed { border: 1px solid #00C851; color: #00C851; }
        .ticket-body p {
          color: var(--text-main);
          font-size: 1.05rem;
          line-height: 1.5;
          word-break: break-word;
        }
        .ticket-attachment {
          background: rgba(0,0,0,0.3);
          padding: 15px;
          border-radius: 8px;
          margin-top: 10px;
          font-size: 0.95rem;
          color: var(--text-muted);
          border: 1px solid var(--border-blue);
          overflow-x: auto;
        }
        .ticket-attachment strong {
          color: var(--text-header);
        }
        .ticket-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
          flex-wrap: wrap;
        }
        @media screen and (max-width: 900px) {
          .admin-tabs {
            flex-direction: column;
            width: 100%;
          }
          .admin-tabs .button {
            width: 100%;
          }
          .admin-users ul li, .admin-question-item, .ticket-item {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
          .user-info-text {
            text-align: center;
            width: 100%;
          }
          .ticket-header {
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
          .ticket-actions {
            flex-direction: column;
          }
          .ticket-actions .button {
            width: 100%;
          }
          .admin-user-actions {
             flex-direction: column;
             width: 100%;
          }
          .admin-user-actions button {
             width: 100%;
          }
          .admin-modal-wide {
            padding: 15px;
            max-height: 90vh;
            overflow-y: auto;
            width: 95%;
            margin: 20px auto;
          }
          .admin-edit-answers {
            grid-template-columns: 1fr;
          }
        }
        .admin-modal-wide {
          max-width: 800px;
          max-height: 95vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .admin-edit-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
          overflow-y: auto;
        }
        .topic-selector-modal {
          background: var(--surface-main);
          padding: 20px;
          border-radius: 12px;
          border: 2px solid var(--duo-green);
          max-width: 400px;
          width: 90%;
        }
        .topic-selector-modal h4 {
          margin-top: 0;
          color: var(--text-bright);
        }
        .topic-select {
          width: 100%;
          padding: 10px;
          margin: 15px 0;
          background: var(--input-bg);
          color: white;
          border: 2px solid var(--border-blue);
          border-radius: 8px;
        }
      `}</style>

      {loading && <p className="message">Admin adatok betöltése...</p>}
      {error && <p className="message error">{error}</p>}

      {selectedUser && (
        <div className="user-details-overlay" onClick={() => setSelectedUser(null)} style={{ padding: '20px 0', alignItems: 'flex-start' }}>
          <article 
            className="user-details-modal" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: '95%', 
              maxWidth: '500px', 
              maxHeight: 'calc(100vh - 40px)', 
              overflowY: 'auto',
              margin: 'auto'
            }}
          >
            <header className="modal-header">
              <h3>Felhasználó részletei</h3>
              <button className="button secondary small" onClick={() => setSelectedUser(null)}>✕</button>
            </header>
            <div className="modal-body">
              <div className="user-details-avatar-row" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {selectedUser.profilePicture ? (
                  <img src={selectedUser.profilePicture} alt={selectedUser.username} className="profile-preview-large" style={{ width: '80px', height: '80px', border: '3px solid var(--wood-primary)' }} />
                ) : (
                  <div className="profile-preview-large" style={{ width: '80px', height: '80px', border: '3px solid var(--wood-primary)', fontSize: '2rem' }}>
                    <span className="placeholder-text">{selectedUser.username.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="notranslate" style={{ minWidth: '150px' }}>
                  <p style={{ margin: 0 }}><strong>Felhasználó:</strong> {selectedUser.username}</p>
                  <p style={{ margin: 0 }}><strong>Név:</strong> {selectedUser.name}</p>
                </div>
              </div>
              <p className="notranslate" style={{ wordBreak: 'break-word' }}><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Szerepkör:</strong> {selectedUser.access ? 'Admin' : 'Felhasználó'}</p>
              <p><strong>Regisztrált:</strong> {new Date(selectedUser.createdAt).toLocaleDateString('hu-HU')}</p>
              <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #ddd' }} />
              <div className="point-editor" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p><strong>Aktuális szint:</strong> {userLevel}</p>
                <p><strong>Aktuális pont:</strong> {userPoints} pont</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <label htmlFor="points-input"><strong>Módosítás:</strong></label>
                  <div style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                    <input
                      id="points-input"
                      type="number"
                      value={pointAdjust}
                      onChange={(e) => setPointAdjust(Number(e.target.value))}
                      className="input"
                      style={{ 
                        width: '80px', 
                        height: '45px', 
                        margin: 0, 
                        padding: '8px 12px',
                        boxSizing: 'border-box',
                        fontSize: '1.1rem'
                      }}
                    />
                    <button 
                      onClick={() => handleUpdatePoints(pointAdjust)} 
                      className="button accent small"
                      disabled={savingPoints}
                      style={{ 
                        backgroundColor: 'var(--duo-green)', 
                        borderBottomColor: 'var(--duo-green-shadow)',
                        height: '45px',
                        flex: '1',
                        minWidth: '110px',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                        padding: '0 15px',
                        boxSizing: 'border-box'
                      }}
                    >
                      Hozzáad (+)
                    </button>
                    <button 
                      onClick={() => handleUpdatePoints(-pointAdjust)} 
                      className="button accent small"
                      disabled={savingPoints}
                      style={{ 
                        backgroundColor: 'var(--error-light)', 
                        borderBottomColor: '#d32f2f',
                        height: '45px',
                        flex: '1',
                        minWidth: '100px',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                        padding: '0 15px',
                        boxSizing: 'border-box'
                      }}
                    >
                      Levon (-)
                    </button>
                  </div>
                </div>
                <small style={{ color: '#bb6161' }}>Minden 500 pont után egy szintlépés jár (automatikusan számolva). A pontszám nem mehet 0 alá.</small>
              </div>
            </div>
            <footer className="modal-footer" style={{ paddingBottom: '20px' }}>
              <button className="button secondary" onClick={() => setSelectedUser(null)}>Bezárás</button>
            </footer>
          </article>
        </div>
      )}

      {editingQuestion && (
        <div className="user-details-overlay" onClick={() => setEditingQuestion(null)}>
          <article className="user-details-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Kérdés szerkesztése</h3>
              <button className="button secondary small" onClick={() => setEditingQuestion(null)}>✕</button>
            </header>
            <form onSubmit={handleUpdateQuestion} className="modal-body admin-edit-form">
              <label>
                Kérdés:
                <textarea 
                  value={editFormData.question} 
                  onChange={e => setEditFormData({...editFormData, question: e.target.value})}
                  required
                />
              </label>
              
              <div className="admin-edit-answers">
                <p>Válaszlehetőségek:</p>
                {(editFormData.answers || []).map((ans, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ whiteSpace: 'nowrap', minWidth: '25px' }}>{idx + 1}.</span>&nbsp;
                    <input 
                      type="text" 
                      value={ans} 
                      onChange={e => handleAnswerChange(idx, e.target.value)} 
                      required 
                    />
                  </label>
                ))}
              </div>

              <label>
                Helyes válasz (a fenti szövegek egyike kell legyen):
                <input 
                  type="text" 
                  value={editFormData.correct} 
                  onChange={e => setEditFormData({...editFormData, correct: e.target.value})}
                  required 
                />
              </label>

              <label>
                Érdekesség:
                <textarea 
                  value={editFormData.funfact} 
                  onChange={e => setEditFormData({...editFormData, funfact: e.target.value})}
                />
              </label>

              <footer className="modal-footer" style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="button primary-green">Mentés</button>
                <button type="button" className="button secondary" onClick={() => setEditingQuestion(null)}>Mégse</button>
              </footer>
            </form>
          </article>
        </div>
      )}

      {addingQuestionFromTicket && (
        <div className="user-details-overlay" onClick={() => setAddingQuestionFromTicket(null)}>
          <article className="topic-selector-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Kérdés hozzáadása</h3>
              <button className="button secondary small" onClick={() => setAddingQuestionFromTicket(null)}>✕</button>
            </header>
            <div className="modal-body">
              <p>Melyik témakörhöz szeretnéd hozzáadni ezt a kérdést?</p>
              <select 
                className="topic-select"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                {TOPICS.map((topic) => (
                  <option key={topic.slug} value={topic.title}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>
            <footer className="modal-footer" style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="button primary" 
                onClick={() => addSuggestedQuestion(addingQuestionFromTicket)}
              >
                Hozzáadás
              </button>
              <button 
                className="button secondary" 
                onClick={() => setAddingQuestionFromTicket(null)}
              >
                Mégse
              </button>
            </footer>
          </article>
        </div>
      )}

      {!loading && !error && (
        <>
          {activeTab === 'users' && (
            <>
              <div className="admin-grid">
                <article className="admin-card">
                  <h3>Felhasználók</h3>
                  <p>{users.length}</p>
                </article>
                <article className="admin-card">
                  <h3>Adminok</h3>
                  <p>{adminCount}</p>
                </article>
                <article className="admin-card clickable" onClick={() => setActiveTab('questions')}>
                  <h3>Kérdések</h3>
                  <p>{questions.length}</p>
                  <span className="card-hint">Váltás a kérdésekre →</span>
                </article>
                <article className="admin-card">
                  <h3>Saját adatok</h3>
                  <button className="button danger small" onClick={resetAdminAnswers} style={{ width: '100%', marginTop: '10px' }}>
                    Saját válaszok törlése
                  </button>
                </article>
              </div>

              <div className="admin-users">
                <h3>Felhasználók kezelése</h3>
                <input
                  className="admin-search"
                  onChange={(event) => setUsernameSearch(event.target.value)}
                  placeholder="Keresés felhasználónév alapján"
                  type="search"
                  value={usernameSearch}
                />
                <ul>
                  {filteredUsers.map((listedUser) => (
                    <li key={listedUser.id} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div className="admin-user-avatar" style={{ flexShrink: 0 }}>
                        {listedUser.profilePicture ? (
                          <img src={listedUser.profilePicture} alt={listedUser.username} className="profile-img-small" style={{ width: '45px', height: '45px' }} />
                        ) : (
                          <div className="profile-avatar-placeholder" style={{ width: '45px', height: '45px', fontSize: '1rem' }}>
                            {listedUser.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="user-info-text notranslate">
                        <span
                          className="user-name-clickable"
                          onClick={() => void viewUserDetails(listedUser.id)}
                          style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold', fontSize: '1.1rem' }}
                        >
                          {listedUser.username}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{listedUser.email}</span>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '4px' }}>
                          {['Rikimik', 'GalGer'].includes(listedUser.username) ? 'szuperadmin' : (listedUser.access ? 'admin' : 'user')}
                        </span>
                      </div>
                      <div className="admin-user-actions">
                        <button
                          className="button primary small"
                          onClick={() => setSelectedUser(listedUser)}
                          type="button"
                          style={{ backgroundColor: '#2196F3', borderColor: '#1976D2', color: 'white' }}
                        >
                          Részletek
                        </button>
                        {!['Rikimik', 'GalGer'].includes(listedUser.username) && (
                          <>
                            {listedUser.access ? (
                              <button
                                className="button secondary small"
                                style={(['Rikimik', 'GalGer'].includes(listedUser.username)) ? { backgroundColor: '#2196F3', borderColor: '#1976D2', color: 'white', opacity: 1, cursor: 'default' } : {}}
                                disabled={!isSuperAdmin || (['Rikimik', 'GalGer'].includes(listedUser.username)) || updatingUserId === listedUser.id}
                                onClick={() => void setAdminAccess(listedUser.id, false)}
                                type="button"
                              >
                                {updatingUserId === listedUser.id ? '...' : (['Rikimik', 'GalGer'].includes(listedUser.username) ? 'Szuperadmin' : 'Admin visszavonás')}
                              </button>
                            ) : (
                              <button
                                className="button small"
                                style={{ backgroundColor: 'var(--duo-green)', borderBottomColor: 'var(--duo-green-shadow)', color: 'white' }}
                                disabled={updatingUserId === listedUser.id || !isSuperAdmin}
                                onClick={() => void setAdminAccess(listedUser.id, true)}
                                type="button"
                              >
                                {updatingUserId === listedUser.id ? '...' : 'Adminná tétel'}
                              </button>
                            )}
                            <button
                              className="button danger small"
                              disabled={updatingUserId === listedUser.id}
                              onClick={() => void deleteUser(listedUser.id)}
                              type="button"
                            >
                              {updatingUserId === listedUser.id ? '...' : 'Törlés'}
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {!filteredUsers.length && <p className="message">Nincs találat erre a felhasználónévre.</p>}
              </div>
            </>
          )}

          {activeTab === 'questions' && (
            <div className="admin-questions" id="admin-questions-section">
              <div className="admin-questions-header">
                <h3>Kérdések kezelése</h3>
              </div>
              
              <div className="admin-search-wrapper">
                <input
                  className="admin-search"
                  onChange={(event) => setQuestionSearch(event.target.value)}
                  placeholder="Keresés kérdés szövege vagy #ID alapján"
                  type="search"
                  value={questionSearch}
                />
              </div>

              <div className="admin-question-list">
                {filteredQuestions.map(q => (
                  <div key={q.id} className="admin-question-item">
                    <div className="admin-q-text" style={{ color: 'white' }}>
                      <strong>#{q.id}</strong> {q.question}
                    </div>
                    <button 
                      className="button secondary small" 
                      onClick={() => handleEditQuestion(q)}
                    >
                      Szerkesztés
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="admin-tickets">
              <h3>Ticketek kezelése</h3>
              
              <div className="admin-search-wrapper">
                <input
                  className="admin-search"
                  onChange={(event) => setTicketSearch(event.target.value)}
                  placeholder="Keresés leírás, felhasználónév vagy #ID alapján"
                  type="search"
                  value={ticketSearch}
                />
              </div>

              <div className="tickets-list">
                {filteredTickets.length === 0 ? (
                  <p className="message">Nincs beérkezett ticket{ticketSearch ? ' a megadott feltételekkel' : ''}.</p>
                ) : (
                  filteredTickets.map(ticket => (
                    <div key={ticket.id} className="ticket-item">
                      <div className="ticket-header">
                        <div>
                          <strong>#{ticket.id}</strong> - {ticket.user.username} ({ticket.user.email})
                          <br />
                          <small>{new Date(ticket.createdAt).toLocaleString('hu-HU')}</small>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <span className={`ticket-badge badge-${ticket.type.toLowerCase().replace('_', '-')}`}>
                            {ticket.type === 'BUG' ? 'HIBA' : 'KÉRDÉS JAVASLAT'}
                          </span>
                          <span className={`ticket-badge badge-${ticket.status.toLowerCase()}`}>
                            {ticket.status === 'OPEN' ? 'NYITOTT' : 'LEZÁRT'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="ticket-body">
                        <p style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
                        
                        {ticket.type === 'SUGGEST_QUESTION' && ticket.attachment && (
                          <div className="ticket-attachment">
                            <strong>Javasolt kérdés:</strong> {ticket.attachment.question}
                            <div style={{ paddingLeft: '10px', marginTop: '5px' }}>
                              {ticket.attachment.answers.map((ans: string, i: number) => (
                                <div key={i} style={{ color: ans === ticket.attachment.correct ? 'var(--duo-green)' : 'inherit' }}>
                                  <span style={{ whiteSpace: 'nowrap' }}>{i + 1}.</span> {ans} {ans === ticket.attachment.correct ? '(HELYES)' : ''}
                                </div>
                              ))}
                            </div>
                            {ticket.attachment.funfact && (
                              <div style={{ marginTop: '5px' }}>
                                <strong>Érdekesség:</strong> {ticket.attachment.funfact}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="ticket-actions">
                        {ticket.type === 'SUGGEST_QUESTION' && ticket.attachment && ticket.status === 'OPEN' && (
                          <button 
                            className="button accent small" 
                            style={{ backgroundColor: 'var(--duo-green)', borderBottomColor: 'var(--duo-green-shadow)', color: 'white' }}
                            onClick={() => setAddingQuestionFromTicket(ticket)}
                          >
                            Hozzáadás adatbázishoz
                          </button>
                        )}
                        {ticket.status === 'OPEN' ? (
                          <button 
                            className="button danger small" 
                            onClick={() => updateTicketStatus(ticket.id, 'CLOSED')}
                          >
                            Lezárás
                          </button>
                        ) : (
                          <button 
                            className="button primary small" 
                            style={{ backgroundColor: 'var(--duo-green)', borderBottomColor: 'var(--duo-green-shadow)', color: 'white' }}
                            onClick={() => updateTicketStatus(ticket.id, 'OPEN')}
                          >
                            Újranyitás
                          </button>
                        )}
                        <button 
                          className="button danger small" 
                          onClick={() => deleteTicket(ticket.id)}
                        >
                          Törlés
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
