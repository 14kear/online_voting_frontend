import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Отменяет стандартное действие браузера, предотвращает перезагрузку страницы при отправке формы
    
    const app_id = 1;

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({app_id: app_id, email, password}),
      });

      if (response.ok){
        const data = await response.json();

        if (data.accessToken && data.refreshToken){
          localStorage.setItem('access_token', data.accessToken);
          localStorage.setItem('refresh_token', data.refreshToken);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('app_id', app_id);
          localStorage.setItem('user_id', data.userId);

          const adminCheck = await fetch(`http://localhost:8080/auth/admin/${data.userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
                  },
          });

          const blockedCheck = await fetch(`http://localhost:8080/auth/block-status/${data.userId}`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
                  },
          });

        if (adminCheck.ok && blockedCheck.ok){
          const adminData = await adminCheck.json();
          const blockedData = await blockedCheck.json();
          if (blockedData.isBlocked === false){
              if (adminData.isAdmin === true){
              localStorage.setItem('isAdmin', 'true');
            }else{
              localStorage.setItem('isAdmin', 'false');
            }
          }else {
            localStorage.clear();
            navigate('/register')
          }
        }
        navigate('/')

        }else{
          setError('Ошибка авторизации: недопустимые токены');
        }
      }else{
        setError('Неверный email или пароль');
      }
    }catch (error){
      setError('Ошибка при подключении к серверу');
      console.error(error);
    }
  };

  return (
    <div className="login">
      <h1>Вход</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}> 
        <div>
          <label>Имя пользователя:</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

export default Login;