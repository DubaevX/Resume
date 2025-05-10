import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

const containerStyle = {
  maxWidth: '400px',
  margin: '100px auto',
  padding: '20px',
  backgroundColor: '#1e1e1e',
  borderRadius: '8px',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const inputStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #333',
  backgroundColor: '#333',
  color: 'white'
};

const buttonStyle = {
  padding: '10px',
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '16px'
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await login(username, password);
      localStorage.setItem('access_token', data.access);
      navigate('/deliveries');
    } catch (error) {
      alert('Ошибка входа: ' + (error.response?.data?.detail || 'Неизвестная ошибка'));
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Вход в систему</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '6px' }}>Имя пользователя</label>
          <input 
            id="username"
            type="text" 
            style={inputStyle} 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '6px' }}>Пароль</label>
          <input 
            id="password"
            type="password" 
            style={inputStyle} 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={buttonStyle}>
          Войти
        </button>
      </form>
    </div>
  );
}