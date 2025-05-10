import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DeliveriesPage from './pages/DeliveriesPage';
import DeliveryFormPage from './pages/DeliveryFormPage';
import ReportsPage from './pages/ReportsPage';

// Стили для навигации
const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: '#1e1e1e',
  padding: '10px 20px',
  marginBottom: '20px',
  borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

const navLinksStyle = {
  display: 'flex',
  gap: '20px',
};

const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontWeight: 'bold',
  padding: '8px 12px',
  borderRadius: '4px',
  transition: 'background-color 0.2s',
};

const activeLinkStyle = {
  ...navLinkStyle,
  backgroundColor: '#1976d2',
};

const logoutBtnStyle = {
  backgroundColor: 'transparent',
  border: '1px solid #666',
  color: 'white',
  padding: '8px 12px',
  cursor: 'pointer',
  borderRadius: '4px',
};

// Компонент навигации
const Navigation = () => {
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  // Определяем активную страницу
  const path = window.location.pathname;
  const isDeliveries = path.includes('/deliveries') && !path.includes('/reports');
  const isReports = path.includes('/reports');

  return (
    <nav style={navStyle}>
      <div style={navLinksStyle}>
        <Link to="/deliveries" style={isDeliveries ? activeLinkStyle : navLinkStyle}>
          Доставки
        </Link>
        <Link to="/reports" style={isReports ? activeLinkStyle : navLinkStyle}>
          Отчеты
        </Link>
      </div>
      <button onClick={handleLogout} style={logoutBtnStyle}>
        Выйти
      </button>
    </nav>
  );
};

// Упрощенный компонент для защищенных маршрутов
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('access_token');
  return isAuthenticated ? (
    <>
      <Navigation />
      {children}
    </>
  ) : <Navigate to="/login" />;
};

function App() {
  return (
    <div style={{ backgroundColor: '#121212', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/deliveries" element={
          <PrivateRoute><DeliveriesPage/></PrivateRoute>
        }/>
        <Route path="/deliveries/new" element={
          <PrivateRoute><DeliveryFormPage/></PrivateRoute>
        }/>
        <Route path="/deliveries/:id/edit" element={
          <PrivateRoute><DeliveryFormPage/></PrivateRoute>
        }/>
        <Route path="/reports" element={
          <PrivateRoute><ReportsPage/></PrivateRoute>
        }/>
        <Route path="*" element={<Navigate to="/deliveries"/>} />
      </Routes>
    </div>
  );
}

export default App;