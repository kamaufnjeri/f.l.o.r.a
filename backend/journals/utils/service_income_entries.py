from journals.models import Service, ServiceIncomeEntry
from rest_framework import serializers


class ServiceIncomeEntriesManager:
    def create_service_income_entries(self, service_income_entries_data, service_income):
        total_service_income = 0.00
        for entry in service_income_entries_data:
            service_id = entry.get('service')
            if isinstance(service_id, Service):
                service = service_id
            else:
                try:
                    service = Service.objects.get(id=service_id)
                except Service.DoesNotExist:
                    raise serializers.ValidationError(f"Service with id {service_id} not found")
                    
            entry['service'] = service
            service_income_quantity = entry.get('quantity')
            service_income_price = entry.get('price')
            service_income_total = service_income_price * service_income_quantity
            total_service_income += float(service_income_total)
            ServiceIncomeEntry.objects.create(
                service_income=service_income,
                service_income_total=service_income_total,
                **entry
            )

        return total_service_income

    def validate_service_income_entries(self, service_income_entries):
        format = [
            {"service": 1, "price": 20.00, "quantity": 100},
            {"service": 2, "price": 40.00, "quantity": 100}
        ]

        if not service_income_entries:
            raise serializers.ValidationError(f"Service Income entries required in the format: {str(format)}")
        
    