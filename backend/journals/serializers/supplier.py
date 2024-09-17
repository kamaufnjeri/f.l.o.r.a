from journals.models import Supplier, Account
from rest_framework import serializers
from django.db import transaction

class SupplierSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    account = serializers.CharField(read_only=True)
    
    class Meta:
        model = Supplier
        fields = ["id", "name", "email", "phone_number", "account"]

    def create(self, data):
        try:
            with transaction.atomic():
                account = Account.objects.create(name=f"{data.get('name')} a/c", category="liability", sub_category="current_liability")
                supplier = Supplier.objects.create(account=account, **data)

                return supplier
        except Exception as e:
            raise Exception(str(e))