from django.contrib import admin
from .models import TransportType, ServiceType, PackagingType, DeliveryStatus, Delivery

admin.site.register(TransportType)
admin.site.register(ServiceType)
admin.site.register(PackagingType)
admin.site.register(DeliveryStatus)
admin.site.register(Delivery)