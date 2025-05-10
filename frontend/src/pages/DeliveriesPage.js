import React, { useEffect, useState } from 'react';
import { getDeliveries } from '../api';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
  maxWidth: '1200px',
  margin: '40px auto',
  padding: '20px',
  backgroundColor: '#121212',
  color: 'white',
  borderRadius: '8px',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};

const titleStyle = {
  margin: '0',
  fontSize: '24px',
};

const buttonStyle = {
  padding: '10px 16px',
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '16px',
};

const thStyle = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid #333',
  backgroundColor: '#1e1e1e',
  cursor: 'pointer',
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid #333',
};

const statusBadgeStyle = (status) => ({
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '4px',
  fontWeight: 'bold',
  backgroundColor: status === 'Проведено' ? '#4caf50' : '#ffc107',
  color: status === 'Проведено' ? 'white' : 'black',
});

const filterContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  marginBottom: '24px',
  padding: '16px',
  backgroundColor: '#1e1e1e',
  borderRadius: '4px',
};

const filterGroupStyle = {
  flex: '1',
  minWidth: '200px',
};

const filterLabelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 'bold',
};

const filterInputStyle = {
  width: '100%',
  padding: '8px',
  backgroundColor: '#333',
  border: '1px solid #444',
  borderRadius: '4px',
  color: 'white',
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('departure_time');
  const [sortDirection, setSortDirection] = useState('desc');
  const navigate = useNavigate();
  
  // Фильтры
  const [filters, setFilters] = useState({
    minDistance: '',
    maxDistance: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    getDeliveries()
      .then(data => {
        setDeliveries(data);
        setFilteredDeliveries(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching deliveries:', err);
        setLoading(false);
        if (err.response && err.response.status === 401) {
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('access_token');
          navigate('/login');
        }
      });
  }, [navigate]);

  // Применение фильтров и сортировки
  useEffect(() => {
    let result = [...deliveries];
    
    // Фильтрация по дистанции
    if (filters.minDistance !== '') {
      result = result.filter(d => parseFloat(d.distance_km) >= parseFloat(filters.minDistance));
    }
    
    if (filters.maxDistance !== '') {
      result = result.filter(d => parseFloat(d.distance_km) <= parseFloat(filters.maxDistance));
    }
    
    // Фильтрация по датам
    if (filters.startDate !== '') {
      const startDate = new Date(filters.startDate);
      result = result.filter(d => new Date(d.departure_time) >= startDate);
    }
    
    if (filters.endDate !== '') {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59);
      result = result.filter(d => new Date(d.departure_time) <= endDate);
    }
    
    // Сортировка
    result.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      if (sortField === 'departure_time' || sortField === 'delivery_time') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      } else if (sortField === 'distance_km') {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredDeliveries(result);
  }, [deliveries, filters, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      minDistance: '',
      maxDistance: '',
      startDate: '',
      endDate: '',
    });
  };

  // Функция форматирования времени
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Рассчитывает время в пути между отправкой и доставкой
  const calculateTravelTime = (departureTime, deliveryTime) => {
    const departure = new Date(departureTime);
    const delivery = new Date(deliveryTime);
    const diffMs = delivery.getTime() - departure.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Список доставок</h1>
        <button 
          style={buttonStyle} 
          onClick={() => navigate('/deliveries/new')}
        >
          + Новая доставка
        </button>
      </div>
      
      <div style={filterContainerStyle}>
        <div style={filterGroupStyle}>
          <label style={filterLabelStyle} htmlFor="startDate">Дата с:</label>
          <input
            id="startDate"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            style={filterInputStyle}
          />
        </div>
        
        <div style={filterGroupStyle}>
          <label style={filterLabelStyle} htmlFor="endDate">Дата по:</label>
          <input
            id="endDate"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            style={filterInputStyle}
          />
        </div>
        
        <div style={filterGroupStyle}>
          <label style={filterLabelStyle} htmlFor="minDistance">Мин. расстояние (км):</label>
          <input
            id="minDistance"
            type="number"
            name="minDistance"
            value={filters.minDistance}
            onChange={handleFilterChange}
            style={filterInputStyle}
          />
        </div>
        
        <div style={filterGroupStyle}>
          <label style={filterLabelStyle} htmlFor="maxDistance">Макс. расстояние (км):</label>
          <input
            id="maxDistance"
            type="number"
            name="maxDistance"
            value={filters.maxDistance}
            onChange={handleFilterChange}
            style={filterInputStyle}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            style={{ ...buttonStyle, backgroundColor: '#666' }}
            onClick={resetFilters}
          >
            Сбросить
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', overflowX: 'auto' }}>
        {loading ? (
          <p>Загрузка данных...</p>
        ) : filteredDeliveries.length > 0 ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle} onClick={() => handleSort('id')}>ID</th>
                <th style={thStyle} onClick={() => handleSort('transport')}>Модель</th>
                <th style={thStyle}>Номер</th>
                <th style={thStyle}>Услуги</th>
                <th style={thStyle}>Упаковка</th>
                <th style={thStyle}>Статус</th>
                <th style={thStyle}>Тех. сост.</th>
                <th style={thStyle} onClick={() => handleSort('distance_km')}>Дист. (км)</th>
                <th style={thStyle} onClick={() => handleSort('departure_time')}>Отправление</th>
                <th style={thStyle} onClick={() => handleSort('delivery_time')}>Доставка</th>
                <th style={thStyle}>Время в пути</th>
                <th style={thStyle}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map(delivery => (
                <tr key={delivery.id}>
                  <td style={tdStyle}>{delivery.id}</td>
                  <td style={tdStyle}>{delivery.transport}</td>
                  <td style={tdStyle}>{delivery.vehicle_number}</td>
                  <td style={tdStyle}>
                    {Array.isArray(delivery.service) 
                      ? delivery.service.map(s => s.name).join(', ')
                      : delivery.service}
                  </td>
                  <td style={tdStyle}>{delivery.packaging}</td>
                  <td style={tdStyle}>
                    <div style={statusBadgeStyle(delivery.status)}>
                      {delivery.status}
                    </div>
                  </td>
                  <td style={tdStyle}>{delivery.technical_condition || 'Исправно'}</td>
                  <td style={tdStyle}>{delivery.distance_km}</td>
                  <td style={tdStyle}>{formatDateTime(delivery.departure_time)}</td>
                  <td style={tdStyle}>{formatDateTime(delivery.delivery_time)}</td>
                  <td style={tdStyle}>
                    {calculateTravelTime(delivery.departure_time, delivery.delivery_time)}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        style={{ ...buttonStyle, padding: '6px 10px', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/deliveries/${delivery.id}/edit`)}
                      >
                        Редактировать
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Нет доставок, соответствующих фильтрам. Измените критерии поиска или создайте новую доставку.</p>
        )}
      </div>
    </div>
  );
}