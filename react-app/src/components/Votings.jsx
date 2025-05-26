import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import { useNavigate } from 'react-router-dom';
import './Votes.css';

function Votes() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
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

  const handleOpenPoll = (id) => {
    navigate(`/vote/${id}`);
  };

  return (
    <div className="votes-container">
      <h1>Онлайн голосования</h1>

      {!isAuthenticated ? (
        <p className="error">Для просмотра голосований необходимо войти.</p>
      ) : loading ? (
        <p>Загрузка…</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : polls.length === 0 ? (
        <p>Голосований пока нет.</p>
      ) : (
        <ul className="votes-list">
          {polls.map((poll) => (
            <li
              key={poll.ID}
              className="vote-item"
              onClick={() => handleOpenPoll(poll.ID)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{poll.Title}</h3>
              {poll.Description && (
                <p className="vote-description">{poll.Description}</p>
              )}
              <div className="vote-meta">
                <span>Статус: {poll.Status || '—'}</span>
                <span>
                  {new Date(
                    poll.CreatedAt || poll.UpdatedAt
                  ).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Votes;
