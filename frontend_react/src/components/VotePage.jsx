import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/authFetch';
import './VotePage.css';

function VotingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const user = localStorage.getItem('user_id');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const resPoll = await authFetch(`http://localhost:8081/api/voting/polls/${id}`);
        const pollData = await resPoll.json();
        if (!resPoll.ok || !pollData.poll) throw new Error('Ошибка загрузки голосования');
        setPoll(pollData.poll);

        const resOptions = await authFetch(`http://localhost:8081/api/voting/polls/${id}/options`);
        let optionsData = { options: [] };
        if (resOptions.ok) {
          optionsData = await resOptions.json();
        }
        setOptions(Array.isArray(optionsData.options) ? optionsData.options : []);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!selected) return;

    setSaving(true);
    try {
      const res = await authFetch('http://localhost:8081/api/voting/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          option_id: Number(selected),
          poll_id: Number(id),
          user_id: Number(user),
        }),
      });

      if (res.ok) {
        navigate('/');
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Ошибка при сохранении голоса');
      }
    } catch (err) {
      setError('Вы уже голосовали!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="voting-detail-container">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Назад
      </button>

      {poll && (
        <>
          <h2>{poll.Title}</h2>
          <p>{poll.Description}</p>
        </>
      )}

      {error && <p className="error">{error}</p>}

      {!loading && poll && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <ul className="options-list">
            {options.length === 0 ? (
              <li>Нет доступных вариантов для голосования</li>
            ) : (
              options.map((opt) => (
                <li key={opt.ID}>
                  <label>
                    <input
                      type="radio"
                      name="option"
                      value={opt.ID}
                      checked={selected === opt.ID}
                      onClick={() =>
                        setSelected((prev) => (prev === opt.ID ? null : opt.ID))
                      }
                      readOnly
                      disabled={saving}
                    />
                    {opt.Text}
                  </label>
                </li>
              ))
            )}
          </ul>

          <button type="submit" disabled={saving || !selected}>
            {saving ? 'Сохранение...' : 'Сохранить голос'}
          </button>
        </form>
      )}
    </div>
  );
}

export default VotingDetail;
