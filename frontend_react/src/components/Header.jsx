import { Link, useNavigate } from 'react-router-dom';
import './Header.css'


function Header() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const appId = localStorage.getItem('app_id');

    try {
      const response = await fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
          appId: Number(appId),
        }),
      });

      if (response.ok) {
        localStorage.clear();
        navigate('/login');
      } else {
        console.error('Ошибка при выходе:', response.statusText);
      }
    } catch (error) {
      console.error('Сетевая ошибка при logout:', error);
    }
  };

  return (
    <header className="header">
      <div className="nameForum">
        <Link to="/">Онлайн-голосования</Link>
      </div>
      <nav className="headForum">
        <div className="exit">
          {isAuthenticated && isAdmin &&
            <Link to="/admin">Админ-панель</Link>
          }
        </div>
        <div className="exit">
          {!isAuthenticated && <Link className="auth" to="/login">Вход</Link>}
          {!isAuthenticated && <Link className="auth" to="/register">Регистрация</Link>}
          {isAuthenticated && (
            <button onClick={handleLogout} className="logout-button">
              Выйти
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
