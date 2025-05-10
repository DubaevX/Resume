from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from deliveries.views import TransportTypeViewSet, ServiceTypeViewSet, PackagingTypeViewSet, DeliveryStatusViewSet
from rest_framework.routers import DefaultRouter

# Создаем маршрутизатор для корневых справочников
api_router = DefaultRouter()
api_router.register('transport-types', TransportTypeViewSet, basename='transport-type')
api_router.register('service-types', ServiceTypeViewSet, basename='service-type')
api_router.register('packaging-types', PackagingTypeViewSet, basename='packaging-type')
api_router.register('delivery-statuses', DeliveryStatusViewSet, basename='delivery-status')

@api_view(['GET'])
def api_root(request, format=None):
    """
    Корневой URL для API приложения доставки
    """
    return Response({
        'admin': reverse('admin:index', request=request, format=format),
        'deliveries': reverse('delivery-list', request=request, format=format),
        'transport-types': reverse('transport-type-list', request=request, format=format),
        'service-types': reverse('service-type-list', request=request, format=format),
        'packaging-types': reverse('packaging-type-list', request=request, format=format),
        'delivery-statuses': reverse('delivery-status-list', request=request, format=format),
        'auth': {
            'login': reverse('token_obtain_pair', request=request, format=format),
            'refresh': reverse('token_refresh', request=request, format=format),
        }
    })

urlpatterns = [
    # API документация
    path('', api_root, name='api-root'),
    
    # Административный интерфейс
    path('admin/', admin.site.urls),
    
    # Аутентификация
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # API доставок
    path('api/deliveries/', include('deliveries.urls')),
    
    # API справочников на верхнем уровне
    path('api/', include(api_router.urls)),
]