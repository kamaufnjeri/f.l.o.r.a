from rest_framework import serializers
from journals.models import Discount


class DiscountSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    discount_type = serializers.CharField(read_only=True)
    class Meta:
        model = Discount
        fields = ['id', 'discount_type', 'discount_percentage', 'discount_amount']