from rest_framework import serializers
from journals.models import Customer, Account
from django.db import transaction


class CustomerSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    account = serializers.CharField(read_only=True)

    class Meta:
        model = Customer
        fields = ["id", "name", "email", "phone_number", "account"]

    def create(self, data):
        try:
            with transaction.atomic():
                account = Account.objects.create(name=f"{data.get('name')} a/c", category="asset", sub_category="current_asset")
                customer = Customer.objects.create(account=account, **data)
                return customer
            
        except Exception as e:
            raise Exception(str(e))
