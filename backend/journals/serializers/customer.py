from rest_framework import serializers
from journals.models import Customer, Account, Invoice, FloraUser, Organisation, SubCategory
from django.db import transaction
from journals.utils import CustomerUtils


class CustomerSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    account = serializers.CharField(read_only=True)
    amount_due = serializers.SerializerMethodField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())

    class Meta:
        model = Customer
        fields = ["id", "name", "email", "phone_number", "account", "amount_due", "organisation", "user"]
    
    def get_amount_due(self, obj):
        invoices = Invoice.objects.filter(customer=obj)
        amount_due = sum(invoice.amount_due for invoice in invoices if invoice.amount_due > 0)
        return amount_due
    
    def validate(self, data):
        organisation_id = data.get('organisation')
        if 'name' in data:
            new_name = data['name']
            
            try:
                customer = Customer.objects.get(name=new_name, organisation_id=organisation_id)
                raise serializers.ValidationError(f"Customer with name {new_name} already exists in this organisation.")
            except Customer.DoesNotExist:
                pass  
        return data

    def create(self, data):
        try:
            with transaction.atomic():
                try:
                    belongs_to = SubCategory.objects.get(category__organisation=data.get('organisation'), value="accounts_receivable")
                except SubCategory.DoesNotExist:
                    raise serializers.ValidationError(f"Accounts Receivable account not found")
                account = Account.objects.create(name=f"{data.get('name')}", organisation=data.get('organisation'), user=data.get('user'), belongs_to=belongs_to)
                customer = Customer.objects.create(account=account, **data)
                return customer
            
        except Exception as e:
            raise Exception(str(e))


class CustomerDetailSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    customer_data = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Customer
        fields = ["id", "name", "email", "phone_number", "organisation", "customer_data"]

    def validate(self, data):
        organisation_id = data.pop('organisation')

        if 'name' in data:
            new_name = data['name']
            customer_id = self.instance.id  
            
            try:
                customer = Customer.objects.exclude(id=customer_id).get(name=new_name, organisation_id=organisation_id)
                raise serializers.ValidationError(f"Customer with name {new_name} already exists in this organisation.")
            except Customer.DoesNotExist:
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
    
    def get_customer_data(self, obj):
        date_param = self.context.get('date', None)

        customer_data = CustomerUtils(obj, period=date_param).get_customer_data()
        
        
        return customer_data
