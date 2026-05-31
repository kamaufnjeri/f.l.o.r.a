from journals.models import Service, ServiceIncomeEntry
from rest_framework import serializers


class ServiceIncomeEntriesManager:
    def get_service(self, entry):
        service = entry.get('service')
        if not isinstance(service, Service):
        
            try:
                service = Service.objects.get(id=service)
            except Service.DoesNotExist:
                raise serializers.ValidationError(f"Service with id {service} not found")
        return service
    
    def create_service_income_entry(self, entry, service_income):
        service = self.get_service(entry=entry)
        
        entry['service'] = service
        service_income_quantity = entry.get('quantity')
        service_income_price = entry.get('price')
        service_income_total = float(service_income_price) * float(service_income_quantity)
        service_income_entry =  ServiceIncomeEntry.objects.create(
            service_income=service_income,
            service_income_total=service_income_total,
            **entry
        )

        return service_income_total, service_income_entry.id
    
    def update_service_income_entry(self, entry, service_income):
        service = self.get_service(entry)
        service_income_entry = ServiceIncomeEntry.objects.get(
            service_income=service_income,
            id=entry.get('id')
        )
        service_income_quantity = entry.get('quantity')
        service_income_price = entry.get('price')
        entry['service'] = service
        
        total_service_income_price = float(service_income_price) * float(service_income_quantity)
       
        service_income_entry.quantity = service_income_quantity
        service_income_entry.price = service_income_price
        service_income_entry.service_income_total = total_service_income_price
        service_income_entry.save()

        return total_service_income_price, service_income_entry.id



    def create_service_income_entries(self, service_income_entries_data, service_income):
        total_service_income = 0.00
        for entry in service_income_entries_data:
            serrvice_income_amount, _ = self.create_service_income_entry(entry, service_income)
            
            total_service_income += float(serrvice_income_amount)

        return total_service_income

    def validate_service_income_entries(self, service_income_entries):
        format = [
            {"service": 1, "price": 20.00, "quantity": 100},
            {"service": 2, "price": 40.00, "quantity": 100}
        ]

        if not service_income_entries:
            raise serializers.ValidationError(f"Service Income entries required in the format: {str(format)}")
        
    def update_service_income_entries(self, service_income_entries, service_income):
        total_service_income_price = 0.00
        entries_id = []
        for entry_data in service_income_entries:
            if entry_data.get('id'):
                service_income_price, entry_id = self.update_service_income_entry(entry=entry_data, service_income=service_income)
                total_service_income_price += float(service_income_price)
                entries_id.append(entry_id)
            else:
                service_income_price, entry_id = self.create_service_income_entry(entry=entry_data, service_income=service_income)
                total_service_income_price += float(service_income_price)
                entries_id.append(entry_id)
        return total_service_income_price, entries_id