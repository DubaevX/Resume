from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Delivery, TransportType, ServiceType, PackagingType, DeliveryStatus
from .serializers import DeliverySerializer, TransportTypeSerializer, ServiceTypeSerializer, PackagingTypeSerializer, DeliveryStatusSerializer
from rest_framework.response import Response
from rest_framework import status

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all().order_by('-departure_time')
    serializer_class = DeliverySerializer
    permission_classes = (IsAuthenticated,)
    
    def update(self, request, *args, **kwargs):
        print(f"Update request data: {request.data}")
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        try:
            serializer.is_valid(raise_exception=True)
            print(f"Validated data: {serializer.validated_data}")
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in update: {str(e)}")
            if hasattr(e, 'detail'):
                return Response(
                    {"error": str(e.detail)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class TransportTypeViewSet(viewsets.ModelViewSet):
    queryset = TransportType.objects.all()
    serializer_class = TransportTypeSerializer
    permission_classes = (IsAuthenticated,)

class ServiceTypeViewSet(viewsets.ModelViewSet):
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer
    permission_classes = (IsAuthenticated,)

class PackagingTypeViewSet(viewsets.ModelViewSet):
    queryset = PackagingType.objects.all()
    serializer_class = PackagingTypeSerializer
    permission_classes = (IsAuthenticated,)

class DeliveryStatusViewSet(viewsets.ModelViewSet):
    queryset = DeliveryStatus.objects.all()
    serializer_class = DeliveryStatusSerializer
    permission_classes = (IsAuthenticated,)