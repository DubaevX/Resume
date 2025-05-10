from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliveryViewSet

# Создаем единый маршрутизатор для доставок
router = DefaultRouter()
router.register('', DeliveryViewSet, basename='delivery')

# Все URL пути обрабатываются через router
urlpatterns = [
    path('', include(router.urls)),
]