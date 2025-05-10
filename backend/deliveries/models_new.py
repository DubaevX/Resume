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
    transport = models.ForeignKey(TransportType, on_delete=models.PROTECT)
    service = models.ForeignKey(ServiceType, on_delete=models.PROTECT)
    packaging = models.ForeignKey(PackagingType, on_delete=models.PROTECT)
    status = models.ForeignKey(DeliveryStatus, on_delete=models.PROTECT)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2)
    departure_time = models.DateTimeField()
    delivery_time = models.DateTimeField()
    attachment = models.FileField(upload_to='deliveries/', blank=True, null=True)
    created_by = models.ForeignKey('auth.User', on_delete=models.CASCADE)

    def __str__(self):
        return f"Delivery {self.id}" 