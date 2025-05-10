# Система учета доставок

Веб-приложение для учета и мониторинга доставок с Django REST Framework бэкендом и React фронтендом.

## Функциональность

- Создание, просмотр, редактирование и удаление доставок
- Учет транспортных средств, услуг, упаковок и статусов
- Фильтрация и поиск доставок
- Визуальные отчеты с графиками
- JWT аутентификация

## Требования

- Python 3.9+
- Node.js 14+
- npm 6+

## Установка и запуск

### Бэкенд (Django)

1. Клонируйте репозиторий:
```
git clone <ссылка-на-репозиторий>
cd <название-проекта>
```

2. Создайте и активируйте виртуальное окружение:
```
python -m venv venv
source venv/bin/activate  # для Linux/Mac
venv\Scripts\activate     # для Windows
```

3. Установите зависимости:
```
cd backend
pip install -r requirements.txt
```

4. Примените миграции:
```
python manage.py migrate
```

5. Создайте суперпользователя:
```
python manage.py createsuperuser
```

6. Запустите сервер разработки:
```
python manage.py runserver
```

Сервер будет доступен по адресу: http://localhost:8000/

### Фронтенд (React)

1. Перейдите в директорию фронтенда:
```
cd frontend
```

2. Установите зависимости:
```
npm install
```

3. Запустите приложение в режиме разработки:
```
npm start
```

Приложение будет доступно по адресу: http://localhost:3000/

## Настройка для production

### Бэкенд

1. Обновите настройки в файле `backend/delivery_project/settings.py`:
```python
DEBUG = False
ALLOWED_HOSTS = ['ваш-домен.com', 'www.ваш-домен.com']
```

2. Настройте production базу данных (например, PostgreSQL)
3. Настройте CORS для разрешения запросов только с вашего домена

### Фронтенд

1. Соберите production версию:
```
cd frontend
npm run build
```

2. Разместите содержимое папки `build` на вашем веб-сервере

## Структура проекта

### Бэкенд
- `/deliveries/` - основное приложение с моделями и API
- `/delivery_project/` - настройки проекта

### Фронтенд
- `/src/pages/` - компоненты страниц
- `/src/components/` - переиспользуемые компоненты
- `/src/api.js` - методы для взаимодействия с API

## API Endpoints

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/auth/login/` | POST | Авторизация (JWT) |
| `/api/deliveries/` | GET, POST | Получение списка и создание доставок |
| `/api/deliveries/{id}/` | GET, PATCH, DELETE | Работа с конкретной доставкой |
| `/api/transport-types/` | GET | Получение списка типов транспорта |
| `/api/service-types/` | GET | Получение списка услуг |
| `/api/packaging-types/` | GET | Получение списка типов упаковки |
| `/api/delivery-statuses/` | GET | Получение списка статусов доставки | 