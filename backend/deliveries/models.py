from django.db import models

class TransportType(models.Model):
    name = models.CharField(max_length=50)
    def __str__(self): return self.name

class ServiceType(models.Model):
    name = models.CharField(max_length=50)
    def __str__(self): return self.name

class PackagingType(models.Model):
    name = models.CharField(max_length=50)
    def __str__(self): return self.name

class DeliveryStatus(models.Model):
    name = models.CharField(max_length=20)
    def __str__(self): return self.name

class Delivery(models.Model):
    TECHNICAL_CONDITION_CHOICES = [
        ('Исправно', 'Исправно'),
        ('Неисправно', 'Неисправно'),
    ]

    transport = models.ForeignKey(TransportType, on_delete=models.PROTECT, verbose_name="Модель транспорта")
    vehicle_number = models.CharField(max_length=50, verbose_name="Номер транспорта", default="Н/Д")
    service = models.ManyToManyField(ServiceType, verbose_name="Услуги", related_name="deliveries")
    packaging = models.ForeignKey(PackagingType, on_delete=models.PROTECT, verbose_name="Упаковка")
    status = models.ForeignKey(DeliveryStatus, on_delete=models.PROTECT, verbose_name="Статус доставки")
    distance_km = models.DecimalField(max_digits=6, decimal_places=2, verbose_name="Дистанция (км)")
    departure_time = models.DateTimeField(verbose_name="Время отправления")
    delivery_time = models.DateTimeField(verbose_name="Время доставки")
    attachment = models.FileField(upload_to='deliveries/', blank=True, null=True, verbose_name="Медиафайл")
    technical_condition = models.CharField(
        max_length=20,
        choices=TECHNICAL_CONDITION_CHOICES,
        default='Исправно',
        verbose_name="Техническое состояние"
    )
    created_by = models.ForeignKey('auth.User', on_delete=models.CASCADE, verbose_name="Кем создано")

    def __str__(self):
        return f"Delivery {self.id} ({self.vehicle_number})"
        
    @property
    def travel_time(self):
        """Вычисляет время в пути между отправкой и доставкой"""
        if self.departure_time and self.delivery_time:
            delta = self.delivery_time - self.departure_time
            hours, remainder = divmod(delta.seconds, 3600)
            minutes, _ = divmod(remainder, 60)
            return f"{hours:02d}:{minutes:02d}"
        return "Н/Д" 