from journals.models import Supplier, Account, Bill, FloraUser, Organisation, SubCategory
from rest_framework import serializers
from django.db import transaction
from journals.utils import SupplierUtils

class SupplierSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    account = serializers.CharField(read_only=True)
    amount_due = serializers.SerializerMethodField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())

    class Meta:
        model = Supplier
        fields = ["id", "name", "email", "phone_number", "account", "amount_due" , 'organisation', 'user']

    def validate(self, data):
        organisation_id = data.get('organisation')
        if 'name' in data:
            new_name = data['name']
            
            try:
                supplier = Supplier.objects.get(name=new_name, organisation_id=organisation_id)
                raise serializers.ValidationError(f"Supplier with name {new_name} already exists in this organisation.")
            except Supplier.DoesNotExist:
                pass  
        return data

    

    def get_amount_due(self, obj):
        invoices = Bill.objects.filter(supplier=obj)
        amount_due = sum(invoice.amount_due for invoice in invoices if invoice.amount_due > 0)
        return amount_due

    def create(self, data):
        try:
            with transaction.atomic():
                try:
                    belongs_to = SubCategory.objects.get(category__organisation=data.get('organisation'), value="accounts_payable")
                except SubCategory.DoesNotExist:
                    raise serializers.ValidationError(f"Accounts Payable account not found")
                account = Account.objects.create(name=f"{data.get('name')}", organisation=data.get('organisation'), user=data.get('user'), belongs_to=belongs_to)
                supplier = Supplier.objects.create(account=account, **data)

                return supplier
        except Exception as e:
            raise Exception(str(e))

class SupplierDetailSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    supplier_data = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Supplier
        fields = ["id", "name", "email", "phone_number", "organisation", "supplier_data"]

    def validate(self, data):
        organisation_id = data.pop('organisation')

        if 'name' in data:
            new_name = data['name']
            supplier_id = self.instance.id  
            
            try:
                supplier = Supplier.objects.exclude(id=supplier_id).get(name=new_name, organisation_id=organisation_id)
                raise serializers.ValidationError(f"Supplier with name {new_name} already exists in this organisation.")
            except Supplier.DoesNotExist:
                pass  
        if self.partial:
            allowed_fields = {'name', 'email', 'phone_number'}
            for field in data.keys():
                if field not in allowed_fields:
                    raise serializers.ValidationError(f"{field} is not allowed in a partial update.")

        return data
    
    def update(self, instance, validated_data):
        name = validated_data.get('name', instance.name)
        email = validated_data.get('email', instance.email)
        phone_number = validated_data.get('phone_number', instance.phone_number)

        instance.name = name
        instance.email = email
        instance.phone_number = phone_number

        account = instance.account
        
        if account:
            account.name = name
            account.save()
        instance.save()

        return instance
    
    def get_supplier_data(self, obj):
        date_param = self.context.get('date', None)

        supplier_data = SupplierUtils(obj, period=date_param).get_supplier_data()
        
        
        return supplier_data
