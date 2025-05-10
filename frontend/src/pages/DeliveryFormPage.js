import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  createDelivery, 
  updateDelivery, 
  getTransportTypes,
  getServiceTypes,
  getPackagingTypes,
  getDeliveryStatuses,
  getDelivery
} from '../api';

const containerStyle = {
  maxWidth: '600px',
  margin: '40px auto',
  padding: '20px',
  backgroundColor: '#1e1e1e',
  borderRadius: '8px',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const formGroupStyle = {
  marginBottom: '16px'
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 'bold'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #333',
  backgroundColor: '#333',
  color: 'white'
};

const selectStyle = {
  ...inputStyle,
  height: '40px'
};

const buttonStyle = {
  padding: '12px',
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginTop: '20px'
};

const fileInputStyle = {
  marginTop: '8px'
};

const checkboxGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '8px'
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer'
};

const checkboxStyle = {
  marginRight: '8px'
};

const radioGroupStyle = {
  display: 'flex',
  gap: '16px',
  marginTop: '8px'
};

export default function DeliveryFormPage() {
  const { id } = useParams();
  const editMode = Boolean(id);
  const token = localStorage.getItem('access_token');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    transport_id: '', 
    vehicle_number: '', 
    service_ids: [], 
    packaging_id: '', 
    status_id: '',
    distance_km: '', 
    departure_time: '', 
    delivery_time: '', 
    attachment: null,
    technical_condition: 'Исправно'
  });
  
  const [refs, setRefs] = useState({
    transports: [],
    services: [],
    packagings: [],
    statuses: []
  });
  
  // Вычисляем время в пути
  const [travelTime, setTravelTime] = useState('00:00');

  // Функция для форматирования даты в формат, поддерживаемый input[type="datetime-local"]
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Формат: YYYY-MM-DDThh:mm
  };

  // Функция для вычисления времени в пути
  const calculateTravelTime = (departureTime, deliveryTime) => {
    if (!departureTime || !deliveryTime) return '00:00';
    
    const departure = new Date(departureTime);
    const delivery = new Date(deliveryTime);
    
    if (isNaN(departure.getTime()) || isNaN(delivery.getTime())) return '00:00';
    
    const diffMs = delivery.getTime() - departure.getTime();
    if (diffMs <= 0) return '00:00';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Redirect to login if no token
    if (!token) {
      alert('You need to log in to access this page');
      navigate('/login');
      return;
    }

    // Загрузить справочники
    const fetchData = async () => {
      try {
        // Попытка загрузить данные с API
        const transportsRes = await getTransportTypes().catch(err => {
          console.warn('Could not load transport types:', err);
          return [];
        });
        
        const servicesRes = await getServiceTypes().catch(err => {
          console.warn('Could not load service types:', err);
          return [];
        });
        
        const packagingsRes = await getPackagingTypes().catch(err => {
          console.warn('Could not load packaging types:', err);
          return [];
        });
        
        const statusesRes = await getDeliveryStatuses().catch(err => {
          console.warn('Could not load delivery statuses:', err);
          return [];
        });

        console.log('Reference data loaded:', {
          transports: transportsRes,
          services: servicesRes,
          packagings: packagingsRes,
          statuses: statusesRes
        });

        // Используем данные API, если они доступны
        const refsData = {
          transports: Array.isArray(transportsRes) && transportsRes.length ? transportsRes : [],
          services: Array.isArray(servicesRes) && servicesRes.length ? servicesRes : [],
          packagings: Array.isArray(packagingsRes) && packagingsRes.length ? packagingsRes : [],
          statuses: Array.isArray(statusesRes) && statusesRes.length ? statusesRes : []
        };

        // Если хотя бы один из справочников пуст, загружаем заглушечные данные
        if (refsData.transports.length === 0 || 
            refsData.services.length === 0 || 
            refsData.packagings.length === 0 || 
            refsData.statuses.length === 0) {
          console.warn('Using fallback data for reference tables');
          
          // Смешиваем заглушечные данные с полученными данными
          setRefs({
            transports: refsData.transports.length > 0 ? refsData.transports : [
              { id: 1, name: 'Автомобиль' }, 
              { id: 2, name: 'Мотоцикл' },
              { id: 3, name: 'Грузовик' },
              { id: 4, name: 'Фургон' },
              { id: 5, name: 'Велосипед' }
            ],
            services: refsData.services.length > 0 ? refsData.services : [
              { id: 1, name: 'Доставка до двери' }, 
              { id: 2, name: 'Перемещение между складами' },
              { id: 3, name: 'Срочная доставка' },
              { id: 4, name: 'Стандартная доставка' },
              { id: 5, name: 'Доставка с возвратом' }
            ],
            packagings: refsData.packagings.length > 0 ? refsData.packagings : [
              { id: 1, name: 'Пакет' }, 
              { id: 2, name: 'Коробка' },
              { id: 3, name: 'Пузырьковая упаковка' },
              { id: 4, name: 'Пластиковый контейнер' },
              { id: 5, name: 'Термопакет' }
            ],
            statuses: refsData.statuses.length > 0 ? refsData.statuses : [
              { id: 1, name: 'Создан' }, 
              { id: 2, name: 'В пути' },
              { id: 3, name: 'Доставлен' },
              { id: 4, name: 'Отменен' },
              { id: 5, name: 'Отложен' }
            ]
          });
        } else {
          setRefs(refsData);
        }
        
        // Загрузить данные для редактирования, если в режиме редактирования
        if (editMode) {
          try {
            const deliveryData = await getDelivery(id);
            console.log('Полученные данные:', deliveryData);
            
            // Форматируем даты для input[type="datetime-local"]
            deliveryData.departure_time = formatDateForInput(deliveryData.departure_time);
            deliveryData.delivery_time = formatDateForInput(deliveryData.delivery_time);
            
            // Преобразуем service из объектов в массив ID для service_ids
            if (deliveryData.service && Array.isArray(deliveryData.service)) {
              deliveryData.service_ids = deliveryData.service.map(service => service.id);
            } else {
              deliveryData.service_ids = [];
            }
            
            // Преобразуем поля для select-ов
            if (typeof deliveryData.transport === 'object' && deliveryData.transport) {
              deliveryData.transport_id = deliveryData.transport.id;
            } else if (typeof deliveryData.transport === 'number') {
              deliveryData.transport_id = deliveryData.transport;
            }
            
            if (typeof deliveryData.packaging === 'object' && deliveryData.packaging) {
              deliveryData.packaging_id = deliveryData.packaging.id;
            } else if (typeof deliveryData.packaging === 'number') {
              deliveryData.packaging_id = deliveryData.packaging;
            }
            
            if (typeof deliveryData.status === 'object' && deliveryData.status) {
              deliveryData.status_id = deliveryData.status.id;
            } else if (typeof deliveryData.status === 'number') {
              deliveryData.status_id = deliveryData.status;
            }
            
            console.log('Преобразованные данные для формы:', {
              transport_id: deliveryData.transport_id,
              packaging_id: deliveryData.packaging_id,
              status_id: deliveryData.status_id,
              service_ids: deliveryData.service_ids,
              technical_condition: deliveryData.technical_condition
            });
            
            setForm(deliveryData);
            
            // Вычисляем время в пути
            setTravelTime(calculateTravelTime(deliveryData.departure_time, deliveryData.delivery_time));
          } catch (deliveryErr) {
            console.error('Could not load delivery details:', deliveryErr);
            if (deliveryErr.response && deliveryErr.response.status === 401) {
              alert('Your session has expired. Please log in again.');
              localStorage.removeItem('access_token');
              navigate('/login');
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    };

    fetchData();
  }, [id, editMode, token, navigate]);

  // Обновляем время в пути при изменении времени отправки или доставки
  useEffect(() => {
    setTravelTime(calculateTravelTime(form.departure_time, form.delivery_time));
  }, [form.departure_time, form.delivery_time]);

  const handleChange = e => {
    const { name, value, files, type, checked } = e.target;
    
    if (name === 'service' && type === 'checkbox') {
      const serviceId = parseInt(value);
      let newServiceIds = [...form.service_ids];
      
      if (checked) {
        // Добавить ID услуги, если она отмечена
        if (!newServiceIds.includes(serviceId)) {
          newServiceIds.push(serviceId);
        }
      } else {
        // Удалить ID услуги, если она снята
        newServiceIds = newServiceIds.filter(id => id !== serviceId);
      }
      
      setForm(f => ({ ...f, service_ids: newServiceIds }));
    } else {
      setForm(f => ({ ...f, [name]: files ? files[0] : value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    try {
      const data = new FormData();
      
      // Преобразуем ID в числа для отправки
      const transport_id = parseInt(form.transport_id);
      const packaging_id = parseInt(form.packaging_id);
      const status_id = parseInt(form.status_id);
      
      // Добавляем основные поля с правильными именами для бэкенда
      data.append('transport_id', transport_id);
      data.append('vehicle_number', form.vehicle_number);
      data.append('packaging_id', packaging_id);
      data.append('status_id', status_id);
      data.append('distance_km', form.distance_km);
      data.append('departure_time', form.departure_time);
      data.append('delivery_time', form.delivery_time);
      data.append('technical_condition', form.technical_condition);
      
      // Добавляем вложение, если оно есть и это объект File
      if (form.attachment && form.attachment instanceof File) {
        data.append('attachment', form.attachment);
      }
      
      // Добавляем выбранные услуги
      if (form.service_ids.length > 0) {
        form.service_ids.forEach(serviceId => {
          data.append('service_ids', parseInt(serviceId));
        });
      } else {
        // Если нет выбранных услуг, отправляем пустой массив
        data.append('service_ids', '');
      }
      
      console.log('Отправка данных: ', {
        transport_id: transport_id,
        packaging_id: packaging_id,
        status_id: status_id,
        services: form.service_ids.map(id => parseInt(id)),
        technical_condition: form.technical_condition
      });
      
      if (editMode) {
        await updateDelivery(id, data);
        alert('Доставка успешно обновлена!');
      } else {
        await createDelivery(data);
        alert('Доставка успешно создана!');
      }
      
      navigate('/deliveries');
    } catch (error) {
      console.error('Error saving delivery:', error);
      if (error.response && error.response.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('access_token');
        navigate('/login');
      } else {
        alert('Произошла ошибка при сохранении доставки: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        {editMode ? 'Редактирование доставки' : 'Создание новой доставки'}
      </h2>
      
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="transport_id">Модель транспорта</label>
          <select 
            id="transport_id"
            name="transport_id" 
            value={form.transport_id || ''} 
            onChange={handleChange}
            style={selectStyle}
            required
          >
            <option value="">-- Выберите модель транспорта --</option>
            {refs.transports.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="vehicle_number">Номер транспорта</label>
          <input 
            id="vehicle_number"
            type="text"
            name="vehicle_number" 
            value={form.vehicle_number} 
            onChange={handleChange}
            style={inputStyle}
            required
            placeholder="Например: V01, №123"
          />
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle}>Услуги (можно выбрать несколько)</label>
          <div style={checkboxGroupStyle}>
            {refs.services.map(option => (
              <label key={option.id} style={checkboxLabelStyle}>
                <input 
                  type="checkbox"
                  name="service"
                  value={option.id}
                  checked={form.service_ids.includes(option.id)}
                  onChange={handleChange}
                  style={checkboxStyle}
                />
                {option.name}
              </label>
            ))}
          </div>
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="packaging_id">Упаковка</label>
          <select 
            id="packaging_id"
            name="packaging_id" 
            value={form.packaging_id || ''} 
            onChange={handleChange}
            style={selectStyle}
            required
          >
            <option value="">-- Выберите тип упаковки --</option>
            {refs.packagings.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="status_id">Статус доставки</label>
          <select 
            id="status_id"
            name="status_id" 
            value={form.status_id || ''} 
            onChange={handleChange}
            style={selectStyle}
            required
          >
            <option value="">-- Выберите статус --</option>
            {refs.statuses.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="technical_condition">Техническое состояние</label>
          <div style={radioGroupStyle}>
            <label style={checkboxLabelStyle}>
              <input 
                type="radio"
                name="technical_condition"
                value="Исправно"
                checked={form.technical_condition === 'Исправно'}
                onChange={handleChange}
                style={checkboxStyle}
              />
              Исправно
            </label>
            <label style={checkboxLabelStyle}>
              <input 
                type="radio"
                name="technical_condition"
                value="Неисправно"
                checked={form.technical_condition === 'Неисправно'}
                onChange={handleChange}
                style={checkboxStyle}
              />
              Неисправно
            </label>
          </div>
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="distance_km">Дистанция (км)</label>
          <input 
            id="distance_km"
            type="number"
            step="0.01"
            name="distance_km" 
            value={form.distance_km} 
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle}>Время в пути</label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, fontSize: '0.9em' }} htmlFor="departure_time">Отправление</label>
              <input 
                id="departure_time"
                type="datetime-local" 
                name="departure_time" 
                value={form.departure_time} 
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, fontSize: '0.9em' }} htmlFor="delivery_time">Доставка</label>
              <input 
                id="delivery_time"
                type="datetime-local" 
                name="delivery_time" 
                value={form.delivery_time} 
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
            <div style={{ width: '80px', display: 'flex', flexDirection: 'column' }}>
              <label style={{ ...labelStyle, fontSize: '0.9em' }}>В пути</label>
              <div style={{
                ...inputStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '40px',
                backgroundColor: '#444'
              }}>
                {travelTime}
              </div>
            </div>
          </div>
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="attachment">Медиафайл</label>
          <input 
            id="attachment"
            type="file" 
            name="attachment" 
            onChange={handleChange}
            style={fileInputStyle}
          />
          {form.attachment && !form.attachment.name && (
            <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
              Текущий файл: {form.attachment}
            </div>
          )}
        </div>
        
        <button type="submit" style={buttonStyle}>
          {editMode ? 'Обновить' : 'Создать'}
        </button>
      </form>
    </div>
  );
}