from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .views import (
    DeliveryViewSet, TransportTypeViewSet, ServiceTypeViewSet,
    PackagingTypeViewSet, DeliveryStatusViewSet
)

# Публичное представление для корневого URL
@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])  # Пустой список отключает аутентификацию для этого представления
def public_root_view(request):
    return Response({
        "message": "Система учета доставок - API",
        "endpoints": {
            "admin": "/admin/",
            "api": "/api/",
            "auth": "/api/auth/login/",
        },
        "frontend": "http://localhost:3001"
    })

router = DefaultRouter()
router.register(r'deliveries', DeliveryViewSet)
router.register(r'transport-types', TransportTypeViewSet)
router.register(r'service-types', ServiceTypeViewSet)
router.register(r'packaging-types', PackagingTypeViewSet)
router.register(r'delivery-statuses', DeliveryStatusViewSet)

urlpatterns = [
    path('', public_root_view, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
] 