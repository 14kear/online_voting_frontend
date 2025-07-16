import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/authFetch';
import './EditPoll.css';

function EditPoll() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  //состояние, которое отслеживает, выполняется ли в данный момент сохранение данных (отправка на сервер)
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // показываем poll
  useEffect(() => {
    async function fetchPoll() {
      try {
        const res = await authFetch(`http://localhost:8081/api/voting/polls/${id}`);
        const data = await res.json();
        if (res.ok) {
          setPoll(data.poll);
          setError(null);
        } else {
          setError(data.error || 'Ошибка загрузки опроса');
          setPoll(null);
        }
      } catch {
        setError('Ошибка загрузки опроса');
        setPoll(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPoll();
  }, [id]);

  const handleChange = (e) => {
    setPoll(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
    setError(null);
  };

  // ? защита от typeErr
  const validate = () => {
    const errors = {};
    if (!poll.Title?.trim()) errors.Title = 'Заполните поле Название';
    if (!poll.Description?.trim()) errors.Description = 'Заполните поле Описание';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await authFetch(`http://localhost:8081/api/voting/polls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: poll.Title,
          description: poll.Description,
          status: poll.Status,
        }),
      });
      if (res.ok) {
        navigate('/');
      } else {
        const errData = await res.json();
        setError(errData.error || 'Ошибка сохранения');
      }
    } catch {
      setError('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="loading">Загрузка...</p>;

  if (error && !poll) return <p className="error-message">{error}</p>;

  if (!poll) return <p className="notfound">Опрос не найден.</p>;

  return (
    <div className="container">
      <h2 className="title">Редактировать опрос</h2>
      {error && <div className="general-error">{error}</div>}
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label className="label">
          Название
          <input
            type="text"
            name="Title"
            className="input"
            value={poll.Title}
            onChange={handleChange}
            autoComplete="off"
            disabled={saving}
          />
          {fieldErrors.Title && (
            <div className="field-error">{fieldErrors.Title}</div>
          )}
        </label>

        <label className="label">
          Описание
          <textarea
            name="Description"
            className="textarea"
            value={poll.Description}
            onChange={handleChange}
            rows={4}
            disabled={saving}
          />
          {fieldErrors.Description && (
            <div className="field-error">{fieldErrors.Description}</div>
          )}
        </label>

        <label className="label">
          Статус
          <select
            name="Status"
            className="select"
            value={poll.Status}
            onChange={handleChange}
            disabled={saving}
          >
            <option value="active">Активен</option>
            <option value="not-active">Закрыт</option>
          </select>
        </label>

        <div className="buttons">
          <button
            type="button"
            className="btn cancel-btn"
            onClick={() => navigate('/')}
            disabled={saving}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="btn save-btn"
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPoll;
