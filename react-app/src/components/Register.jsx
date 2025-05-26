import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const app_id = 1;

    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          app_id: app_id,
        }),
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const data = await response.json();
  
        if (data.message === "user already exists") {
          setError("Такой пользователь уже существует");
        } else {
          setError(data.message || 'Ошибка регистрации');
        }
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    }
  };

  return (
    <div className="login">
      <h1>Регистрация</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleRegister}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Пароль:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
}

export default Register;
