from journals.models import Supplier, Account, Bill, FloraUser, Organisation
from rest_framework import serializers
from django.db import transaction

class SupplierSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    account = serializers.CharField(read_only=True)
    amount_due = serializers.SerializerMethodField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())

    class Meta:
        model = Supplier
        fields = ["id", "name", "email", "phone_number", "account", "amount_due" , 'organisation', 'user']

    def get_amount_due(self, obj):
        invoices = Bill.objects.filter(supplier=obj)
        amount_due = sum(invoice.amount_due for invoice in invoices if invoice.amount_due > 0)
        return amount_due

    def create(self, data):
        try:
            with transaction.atomic():
                account = Account.objects.create(name=f"{data.get('name')} a/c", group="liability",  organisation=data.get('organisation'), user=data.get('user'), category="current_liability", sub_category='accounts_payable')
                supplier = Supplier.objects.create(account=account, **data)

                return supplier
        except Exception as e:
            raise Exception(str(e))