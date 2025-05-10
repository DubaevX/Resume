import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delivery_project.settings')
django.setup()

from django.contrib.auth.models import User

# Создаем пользователя
username = 'testuser'
password = 'password123'

try:
    user = User.objects.create_user(username=username, password=password)
    print(f"Пользователь {username} успешно создан!")
    print(f"Логин: {username}")
    print(f"Пароль: {password}")
except Exception as e:
    print(f"Ошибка при создании пользователя: {e}") 