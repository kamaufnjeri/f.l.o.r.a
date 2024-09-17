from rest_framework import serializers
from journals.models import SalesEntries


class SalesEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    stock = serializers.CharField(write_only=True)
    sales = serializers.CharField(write_only=True, required=False)
    cogs = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    initial_quantity = serializers.IntegerField(read_only=True)
    stock_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SalesEntries
        fields = '__all__'

    def get_stock_name(self, obj):
        return obj.stock.name