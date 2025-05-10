import os
import django

# Установка Django окружения
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delivery_project.settings')
django.setup()

# Импорт моделей после настройки Django
from deliveries.models import TransportType, ServiceType, PackagingType, DeliveryStatus
from django.contrib.auth.models import User
from django.db.utils import IntegrityError

def create_test_data():
    # Создание типов транспорта
    transport_types = [
        "Автомобиль", "Мотоцикл", "Грузовик", "Фургон", "Велосипед"
    ]
    for name in transport_types:
        TransportType.objects.get_or_create(name=name)
    print(f"Создано {len(transport_types)} типов транспорта")
    
    # Создание типов услуг
    service_types = [
        "Доставка до двери", "Перемещение между складами", 
        "Срочная доставка", "Стандартная доставка", "Доставка с возвратом"
    ]
    for name in service_types:
        ServiceType.objects.get_or_create(name=name)
    print(f"Создано {len(service_types)} типов услуг")
    
    # Создание типов упаковки
    packaging_types = [
        "Пакет", "Коробка", "Пузырьковая упаковка", 
        "Пластиковый контейнер", "Термопакет"
    ]
    for name in packaging_types:
        PackagingType.objects.get_or_create(name=name)
    print(f"Создано {len(packaging_types)} типов упаковки")
    
    # Создание статусов доставки
    statuses = [
        "Создан", "В пути", "Доставлен", "Отменен", "Отложен"
    ]
    for name in statuses:
        DeliveryStatus.objects.get_or_create(name=name)
    print(f"Создано {len(statuses)} статусов доставки")
    
    # Создание пользователя admin, если его еще нет
    try:
        User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        print("Создан admin пользователь (admin/admin)")
    except IntegrityError:
        print("Пользователь admin уже существует")

if __name__ == "__main__":
    print("Запуск создания тестовых данных...")
    create_test_data()
    print("Тестовые данные созданы успешно!") 