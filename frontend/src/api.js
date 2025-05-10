import axios from 'axios';

// Использование переменной окружения или дефолтное значение для локальной разработки
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Создание экземпляра axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
});

// Добавление перехватчика для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Функция для обработки ошибок авторизации
const handleAuthError = (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
  throw error;
};

// API для справочников
export const getTransportTypes = async () => {
  try {
    const response = await api.get('/transport-types/');
    return response.data;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

export const getServiceTypes = async () => {
  try {
    const response = await api.get('/service-types/');
    return response.data;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

export const getPackagingTypes = async () => {
  try {
    const response = await api.get('/packaging-types/');
    return response.data;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

export const getDeliveryStatuses = async () => {
  try {
    const response = await api.get('/delivery-statuses/');
    return response.data;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

// API для доставок
export const getDeliveries = async () => {
  try {
    const response = await api.get('/deliveries/');
    return response.data;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

export const getDelivery = async (id) => {
  try {
    console.log(`Fetching delivery with ID: ${id}`);
    const response = await api.get(`/deliveries/${id}/`);
    console.log(`Delivery data received:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching delivery ${id}:`, error.response ? error.response.data : error.message);
    handleAuthError(error);
    throw error;
  }
};

export const createDelivery = async (data) => {
  try {
    const response = await api.post('/deliveries/', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    return response.data;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

export const updateDelivery = async (id, data) => {
  try {
    console.log(`Updating delivery ${id} with data:`, Array.from(data.entries()));
    const response = await api.patch(`/deliveries/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating delivery ${id}:`, error.response ? error.response.data : error.message);
    handleAuthError(error);
    throw error;
  }
};

export const deleteDelivery = async (id) => {
  try {
    await api.delete(`/deliveries/${id}/`);
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

// API для аутентификации
export const login = async (username, password) => {
  try {
    console.log('Attempting login with:', { username });
    const response = await axios.post(`${API_URL}/auth/login/`, { 
      username, 
      password 
    });
    console.log('Login response:', response.data);
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    return { data: response.data };
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
};

export const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token');
    
    const response = await api.post('/auth/refresh/', { refresh });
    localStorage.setItem('access_token', response.data.access);
    return response.data;
  } catch (error) {
    logout();
    throw error;
  }
};