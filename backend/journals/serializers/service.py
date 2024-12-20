from rest_framework import serializers
from django.db import transaction
from journals.models import Service, FloraUser, Organisation

from journals.utils import ServiceUtils



class ServiceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())

    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description',
            'user', 'organisation'
        ]


    def validate(self, data):
        organisation_id = data.get('organisation')
        if 'name' in data:
            new_name = data['name']
            
            try:
                service = Service.objects.get(name=new_name, organisation_id=organisation_id)
                raise serializers.ValidationError(f"Service with name {new_name} already exists in this organisation.")
            except Service.DoesNotExist:
                pass  
        return data


        
    def create(self, validated_data):
        try:
            with transaction.atomic():
                service = Service.objects.create(**validated_data)

                return service
        except Exception as e:
            raise Exception(str(e))
        

class ServiceDetailSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    service_data = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Service
        fields = ["id", "name", "description", "organisation", "service_data"]

    def validate(self, data):
        organisation_id = data.pop('organisation')

        if 'name' in data:
            new_name = data['name']
            service_id = self.instance.id  
            
            try:
                service = Service.objects.exclude(id=service_id).get(name=new_name, organisation_id=organisation_id)
                raise serializers.ValidationError(f"Service with name {new_name} already exists in this organisation.")
            except Service.DoesNotExist:
                pass  
        if self.partial:
            allowed_fields = {'name', 'description'}
            for field in data.keys():
                if field not in allowed_fields:
                    raise serializers.ValidationError(f"{field} is not allowed in a partial update.")

        return data
    
    def update(self, instance, validated_data):
        name = validated_data.get('name', instance.name)
        description = validated_data.get('description', instance.description)

        instance.name = name
        instance.description = description

        
        instance.save()

        return instance
    
    def get_service_data(self, obj):
        date_param = self.context.get('date', None)

        service_data = ServiceUtils(obj, period=date_param).get_service_data()
        
        
        return service_data



