import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delivery_project.settings')
django.setup()

from django.contrib.auth.models import User

# Создаем нового тестового пользователя
username = 'admin2'
password = 'admin123'

# Сначала проверим, существует ли пользователь
try:
    user = User.objects.get(username=username)
    print(f"Пользователь {username} уже существует!")
    print(f"Статус активности: {user.is_active}")
    
    # Проверим и обновим статус, если необходимо
    if not user.is_active:
        user.is_active = True
        user.save()
        print(f"Статус активности пользователя {username} изменен на True")
        
    # Обновим пароль
    user.set_password(password)
    user.save()
    print(f"Пароль пользователя {username} обновлен")
    
except User.DoesNotExist:
    # Создаем нового пользователя
    user = User.objects.create_user(
        username=username, 
        password=password,
        is_staff=True,
        is_active=True,
        is_superuser=True
    )
    print(f"Пользователь {username} успешно создан!")

print(f"Логин: {username}")
print(f"Пароль: {password}") 