import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import { useNavigate } from 'react-router-dom';
import './Votes.css';

function Votes() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPollErrorId, setOpenPollErrorId] = useState(null); // id опроса с ошибкой

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const isAdmin = localStorage.getItem('isAdmin') === 'true'; 
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadPolls = async () => {
      try {
        const res = await authFetch('http://localhost:8081/api/voting/polls');
        const data = await res.json();

        if (res.ok && Array.isArray(data.polls)) {
          setPolls(data.polls);
        } else {
          console.warn('Непредвиденный формат данных:', data);
          setPolls([]);
        }
      } catch (err) {
        setError('Ошибка загрузки голосований');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPolls();
  }, [isAuthenticated]);

  const handleOpenPoll = (poll) => {
    if (poll.Status === 'not-active') {
      setOpenPollErrorId(poll.ID);
      return;
    }
    setOpenPollErrorId(null);
    navigate(`/vote/${poll.ID}`);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Удалить это голосование?')) return;

    try {
      const res = await authFetch(`http://localhost:8081/api/voting/polls/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPolls(prev => prev.filter(p => p.ID !== id));
      } else {
        console.error('Ошибка удаления');
      }
    } catch (err) {
      console.error('Ошибка запроса на удаление', err);
    }
  };

  const handleEdit = (id, e) => {
    e.stopPropagation();
    navigate(`/edit-vote/${id}`);
  };

  return (
    <div className="votes-container">
      <h1>Голосования</h1>

      {!isAuthenticated ? (
        <p className="error">Для просмотра голосований необходимо войти.</p>
      ) : loading ? (
        <p className="loading">Загрузка…</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : polls.length === 0 ? (
        <p className="notfound">Голосований пока нет.</p>
      ) : (
        <ul className="votes-list">
          {polls.map((poll) => (
            <li
              key={poll.ID}
              className="vote-item"
              onClick={() => handleOpenPoll(poll)}
              style={{ cursor: poll.Status === 'not-active' ? 'default' : 'pointer' }}
            >
              <h3>{poll.Title}</h3>
              {poll.Description && <p className="vote-description">{poll.Description}</p>}
              <div className="vote-meta">
                <span>Статус: {poll.Status || '—'}</span>
                <span>{new Date(poll.CreatedAt || poll.UpdatedAt).toLocaleString()}</span>
              </div>

              {openPollErrorId === poll.ID && (
                <div className="field-error">Голосование закрыто — голосовать нельзя.</div>
              )}

              {isAdmin && (
                <div className="admin-actions">
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={(e) => handleEdit(poll.ID, e)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={(e) => handleDelete(poll.ID, e)}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Votes;
