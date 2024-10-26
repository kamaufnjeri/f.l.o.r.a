from rest_framework import serializers
from journals.models import Customer, Account, Invoice, FloraUser, Organisation
from django.db import transaction


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

    def create(self, data):
        try:
            with transaction.atomic():
                account = Account.objects.create(name=f"{data.get('name')} a/c", organisation=data.get('organisation'), user=data.get('user'), group="asset", category="current_asset", sub_category='accounts_receivable')
                customer = Customer.objects.create(account=account, **data)
                return customer
            
        except Exception as e:
            raise Exception(str(e))
