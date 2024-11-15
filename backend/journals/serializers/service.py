from rest_framework import serializers
from django.db import transaction
from journals.models import Service, FloraUser, Organisation, ServiceIncomeEntry, ServiceIncome, Account, Discount
from .journal_entries import JournalEntrySerializer
from .discount import DiscountSerializer
from .bill_invoice import InvoiceSerializer
from .account import AccountDetailsSerializer
from journals.utils import ServiceIncomeEntriesManager, JournalEntriesManager, ServiceUtils, get_date_description_type_url


service_income_entries_manager = ServiceIncomeEntriesManager()
journal_entries_manager = JournalEntriesManager()



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


class ServiceIncomeEntrySerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    service = serializers.CharField(write_only=True)
    service_income = serializers.CharField(write_only=True, required=False)
    service_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ServiceIncomeEntry
        fields = ["id", "service", "service_income", "service_name", "price", "quantity"]

    def get_service_name(self, obj):
        return obj.service.name
    

class DetailedServiceIncomeEntrySerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ServiceIncomeEntry
        fields = ["id", "price", "quantity", "details"]

    def get_details(self, obj):
        details = get_date_description_type_url(obj)
        details['serial_number'] = obj.service_income.serial_number
        details['total'] = float(obj.price) * float(obj.quantity)

        return details

    

class ServiceIncomeSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    service_income_entries = ServiceIncomeEntrySerializer(many=True, write_only=True)
    journal_entries = JournalEntrySerializer(many=True, write_only=True)
    discount_allowed = DiscountSerializer(allow_null=True, required=False, write_only=True)
    invoice = InvoiceSerializer(required=False, write_only=True)
    items_data = serializers.SerializerMethodField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())
 
    class Meta:
        model = ServiceIncome
        fields = [
            'id', 'date', 'description', 'service_income_entries', 
            'journal_entries', 'discount_allowed', 'invoice', 
            'serial_number', 'items_data', 'user', 'organisation'
        ]

    def get_items_data(self, obj):
        """Return the type based on the invoice attribute."""
        type = 'regular'
        service_income_entries = ServiceIncomeEntrySerializer(obj.service_income_entries.all(), many=True)
        items_list = [entry['service_name'] for entry in service_income_entries.data]
        total_amount = sum((float(entry['price']) * float(entry['quantity']) )for entry in service_income_entries.data)
        amount_due = 0
        cash_paid = 0

        if hasattr(obj, 'invoice') and obj.invoice is not None:
            amount_due = obj.invoice.amount_due
            type = 'invoice'
        else:
            type = type
            cash_paid = total_amount
            
            if hasattr(obj, 'discount_allowed') and obj.discount_allowed is not None:
                cash_paid -= float(obj.discount_allowed.discount_amount)

        
        return {
            "list": items_list,
            "type": type,
            "total_amount": total_amount,
            "amount_due": amount_due,
            'cash': cash_paid
        }
    
    
    
    def validate(self, data):
        service_income_entries = data.get('service_income_entries')
        journal_entries = data.get('journal_entries')

        service_income_entries_manager.validate_service_income_entries(service_income_entries)
        journal_entries_manager.validate_journal_entries(journal_entries)

        return data
    
    def create(self, validated_data):
        with transaction.atomic():
            service_income_entries_data = validated_data.pop('service_income_entries')
            journal_entries = validated_data.pop('journal_entries')
            discount_allowed = validated_data.pop('discount_allowed', None)
            service_income = ServiceIncome.objects.create(**validated_data)
            total_sevice_income = service_income_entries_manager.create_service_income_entries(service_income_entries_data, service_income)
            try:
                service_income_account = Account.objects.get(name="Service Income", organisation=validated_data.get('organisation'))
            except Account.DoesNotExist:
                raise serializers.ValidationError('Service Income Account not found')
            if discount_allowed and (discount_allowed.get('discount_amount') > 0.00 and discount_allowed.get('discount_percentage') > 0.00):
                discount = Discount.objects.create(service_income=service_income, discount_type='service_income', **discount_allowed)
                try:
                    discount_account = Account.objects.get(name='Discount Allowed', organisation_id=validated_data.get('organisation'))
                except Account.DoesNotExist:
                    raise serializers.ValidationError('Discount Allowed account not found')
                discount_account_data = journal_entries_manager.create_journal_entry(discount_account, discount.discount_amount, 'debit')
                journal_entries.append(discount_account_data)
            service_income_account_data = journal_entries_manager.create_journal_entry(service_income_account, total_sevice_income, "credit")
            journal_entries.append(service_income_account_data)
            journal_entries_manager.validate_double_entry(journal_entries)
            journal_entries_manager.create_journal_entries(journal_entries, "service_income", service_income, AccountDetailsSerializer)

        return service_income
    

class ServiceIncomeDetailSerializer(ServiceIncomeSerializer):
    service_income_entries = ServiceIncomeEntrySerializer(many=True, read_only=True)
    journal_entries = JournalEntrySerializer(many=True, read_only=True)
    discount_allowed = DiscountSerializer(allow_null=True, required=False, read_only=True)
    invoice = InvoiceSerializer(read_only=True)


    class Meta:
        model = ServiceIncome
        fields = ServiceIncomeSerializer.Meta.fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        journal_entries = data.get('journal_entries', [])
        
        sorted_journal_entries = sorted(journal_entries, key=lambda entry: entry.get('debit_credit') == 'credit')
        
        debit_total = sum(float(entry.get('amount')) for entry in sorted_journal_entries if entry.get('debit_credit') == 'debit')
        credit_total = sum(float(entry.get('amount')) for entry in sorted_journal_entries if entry.get('debit_credit') == 'credit')
        data['journal_entries'] = sorted_journal_entries
        data['journal_entries_total'] = {
            "debit_total": debit_total,
            "credit_total": credit_total
        }

        return data
    
    