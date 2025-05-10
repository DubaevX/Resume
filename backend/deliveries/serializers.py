from rest_framework import serializers
from .models import Delivery, TransportType, ServiceType, PackagingType, DeliveryStatus

class TransportTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportType
        fields = '__all__'

class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = '__all__'

class PackagingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackagingType
        fields = '__all__'

class DeliveryStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryStatus
        fields = '__all__'

class DeliverySerializer(serializers.ModelSerializer):
    # For read operations, show the name of the related objects
    transport = serializers.StringRelatedField(read_only=True)
    packaging = serializers.StringRelatedField(read_only=True)
    status = serializers.StringRelatedField(read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)
    # service = serializers.StringRelatedField(many=True, read_only=True) # Option 1 for read
    service = ServiceTypeSerializer(many=True, read_only=True) # Option 2 for read (more detail)

    # For write operations, expect IDs
    transport_id = serializers.PrimaryKeyRelatedField(
        queryset=TransportType.objects.all(), source='transport', write_only=True
    )
    packaging_id = serializers.PrimaryKeyRelatedField(
        queryset=PackagingType.objects.all(), source='packaging', write_only=True
    )
    status_id = serializers.PrimaryKeyRelatedField(
        queryset=DeliveryStatus.objects.all(), source='status', write_only=True
    )
    service_ids = serializers.PrimaryKeyRelatedField(
        queryset=ServiceType.objects.all(), source='service', many=True, write_only=True
    )

    class Meta:
        model = Delivery
        fields = [
            'id', 'transport', 'transport_id', 'vehicle_number', 
            'service', 'service_ids', 'packaging', 'packaging_id', 
            'status', 'status_id', 'distance_km', 'departure_time', 
            'delivery_time', 'attachment', 'technical_condition', 'created_by'
        ]
        read_only_fields = ('created_by',)
        # depth = 1 # Alternatively, to get nested representations for read

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        # Сделаем вывод отладочной информации
        print(f"Creating delivery with data: {validated_data}")
        services_data = validated_data.pop('service', None)
        delivery = super().create(validated_data)
        if services_data:
            delivery.service.set(services_data)
        return delivery

    def update(self, instance, validated_data):
        print(f"Raw update data: {self.context['request'].data}")
        print(f"Validated update data: {validated_data}")
        
        # Добавляем более подробную обработку ошибок
        try:
            services_data = validated_data.pop('service', None)
            
            # Обновляем основные поля
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            instance.save()
            
            # Обрабатываем связи многие-ко-многим отдельно
            if services_data is not None:
                instance.service.set(services_data)
                
            return instance
        except Exception as e:
            print(f"ERROR in update: {str(e)}")
            raise