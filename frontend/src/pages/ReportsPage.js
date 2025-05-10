import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeliveries, getServiceTypes } from '../api';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const containerStyle = {
  maxWidth: '1200px',
  margin: '40px auto',
  padding: '20px',
  backgroundColor: '#121212',
  color: 'white',
  borderRadius: '8px',
};

const headerStyle = {
  marginBottom: '24px',
};

const titleStyle = {
  margin: '0 0 16px 0',
  fontSize: '24px',
};

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

const buttonStyle = {
  padding: '10px 16px',
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const chartContainerStyle = {
  backgroundColor: '#1e1e1e',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
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

const ReportsPage = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('departure_time');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Фильтры
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    service: '',
  });

  // Загрузка данных
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    
    Promise.all([
      getDeliveries(),
      getServiceTypes()
    ])
      .then(([deliveriesData, servicesData]) => {
        setDeliveries(deliveriesData);
        setFilteredDeliveries(deliveriesData);
        setServices(servicesData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
        if (err.response && err.response.status === 401) {
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('access_token');
          navigate('/login');
        }
      });
  }, [navigate]);

  // Применение фильтров
  useEffect(() => {
    if (!deliveries.length) return;
    
    let result = [...deliveries];
    
    // Фильтрация по датам
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter(d => new Date(d.departure_time) >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59);
      result = result.filter(d => new Date(d.departure_time) <= endDate);
    }
    
    // Фильтрация по услуге
    if (filters.service) {
      result = result.filter(delivery => {
        if (!delivery.service || !Array.isArray(delivery.service)) return false;
        return delivery.service.some(service => 
          service.id.toString() === filters.service || 
          service.name.includes(filters.service)
        );
      });
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      service: '',
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Функция для группировки доставок по месяцам
  const getDeliveriesByMonth = () => {
    const months = {};
    
    filteredDeliveries.forEach(delivery => {
      const date = new Date(delivery.departure_time);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
      
      if (!months[monthKey]) {
        months[monthKey] = { name: monthName, count: 0 };
      }
      
      months[monthKey].count++;
    });
    
    // Сортировка месяцев
    return Object.entries(months)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([_, value]) => value);
  };

  // Данные для графика
  const monthlyData = getDeliveriesByMonth();
  const chartData = {
    labels: monthlyData.map(month => month.name),
    datasets: [
      {
        label: 'Количество доставок',
        data: monthlyData.map(month => month.count),
        backgroundColor: '#1976d2',
        borderColor: '#0d47a1',
        borderWidth: 1,
      },
    ],
  };

  // Опции для графика
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff'
        }
      },
      title: {
        display: true,
        text: 'Количество доставок по месяцам',
        color: '#fff'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#fff'
        },
        grid: {
          color: '#333'
        }
      },
      x: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: '#333'
        }
      }
    }
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

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Отчет по доставкам</h1>
        <p>Используйте фильтры для анализа доставок за определенный период или по типу услуги</p>
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
          <label style={filterLabelStyle} htmlFor="service">Услуга:</label>
          <select
            id="service"
            name="service"
            value={filters.service}
            onChange={handleFilterChange}
            style={filterInputStyle}
          >
            <option value="">Все услуги</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
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

      {loading ? (
        <div>
          <div style={{ ...chartContainerStyle, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Загрузка графика...</p>
          </div>
          
          <h2>Список доставок</h2>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Загрузка данных...</p>
          </div>
        </div>
      ) : (
        <>
          <div style={chartContainerStyle}>
            {filteredDeliveries.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Нет данных для отображения графика</p>
              </div>
            )}
          </div>
          
          <h2>Список доставок ({filteredDeliveries.length})</h2>
          
          {filteredDeliveries.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle} onClick={() => handleSort('id')}>ID</th>
                    <th style={thStyle}>Модель</th>
                    <th style={thStyle}>Номер</th>
                    <th style={thStyle}>Услуги</th>
                    <th style={thStyle}>Упаковка</th>
                    <th style={thStyle} onClick={() => handleSort('distance_km')}>Дист. (км)</th>
                    <th style={thStyle} onClick={() => handleSort('departure_time')}>Отправление</th>
                    <th style={thStyle}>Статус</th>
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
                      <td style={tdStyle}>{delivery.distance_km}</td>
                      <td style={tdStyle}>{formatDateTime(delivery.departure_time)}</td>
                      <td style={tdStyle}>
                        <div style={statusBadgeStyle(delivery.status)}>
                          {delivery.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Нет доставок, соответствующих заданным фильтрам.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage; 