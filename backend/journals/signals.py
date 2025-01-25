# signals.py
from django.db.models.signals import post_save, pre_save, pre_delete
from django.dispatch import receiver
from rest_framework import serializers
from journals.models import AuditTrail
from journals.serializers import AccountSerializer, StockSerializer, CustomerSerializer, SupplierSerializer, JournalDetailSerializer
from journals.serializers import SalesDetailSerializer, PurchaseDetailSerializer, ServiceSerializer, ServiceIncomeDetailSerializer, SalesReturnSerializer
from journals.serializers import PurchaseReturnSerializer, PaymentSerializer
import uuid


def convert_uuids_to_str(data):
    if isinstance(data, dict):
        return {key: convert_uuids_to_str(value) for key, value in data.items()}
    
    elif isinstance(data, list):
        return [convert_uuids_to_str(item) for item in data]
    
    elif isinstance(data, uuid.UUID):
        return str(data)
    
def get_serializer_for_model(model_instance):
    model_class = model_instance.__class__
    model_name = model_class.__name__

    serializer_map = {
        'Account': AccountSerializer,
        'Stock': StockSerializer,
        'Customer': CustomerSerializer,
        'Supplier': SupplierSerializer,
        'Journal': JournalDetailSerializer,
        'Sales': SalesDetailSerializer,
        'Purchase': PurchaseDetailSerializer,
        'Service': ServiceSerializer,
        'ServiceIncome': ServiceIncomeDetailSerializer,
        'SalesReturn': SalesReturnSerializer,
        'PurchaseReturn': PurchaseReturnSerializer,
        'Payment': PaymentSerializer,
    }

    return serializer_map.get(model_name, None)

@receiver(post_save)
def create_audit_trail_on_add(sender, instance, created, **kwargs):
    if created:
        serializer_class = get_serializer_for_model(instance)


        if serializer_class:
            serialized_data = serializer_class(instance).data
            serialized_data_copy = convert_uuids_to_str(serialized_data)
           

            AuditTrail.objects.create(
                action='ADD',
                changed_by=instance.user,
                organisation=instance.organisation,
                model_name=sender.__name__,
                object_id=instance.pk,
                after=serialized_data_copy
            )

@receiver(pre_save)
def create_audit_trail_on_edit(sender, instance, **kwargs):
    if instance.pk:  # Only run for updates (not creation)
        try:
            old_instance = sender.objects.get(pk=instance.pk)
        except sender.DoesNotExist:
            return
        
        old_serializer_class = get_serializer_for_model(old_instance)
        new_serializer_class = get_serializer_for_model(instance)
        
        if old_serializer_class and new_serializer_class:
            old_serialized_data = old_serializer_class(old_instance).data
            old_serialized_data_copy = convert_uuids_to_str(old_serialized_data)
           
            new_serialized_data = new_serializer_class(instance).data
            new_serialized_data_copy = convert_uuids_to_str(new_serialized_data)
           
            if old_serialized_data != new_serialized_data:
                AuditTrail.objects.create(
                    action='EDIT',
                    changed_by=instance.user,
                    organisation=instance.organisation,
                    model_name=sender.__name__,
                    object_id=instance.pk,
                    before=old_serialized_data_copy,
                    after=new_serialized_data_copy  
                )

@receiver(pre_delete)
def create_audit_trail_on_delete(sender, instance, **kwargs):
    serializer_class = get_serializer_for_model(instance)
    if serializer_class:
        serialized_data = serializer_class(instance).data

        serialized_data_copy = convert_uuids_to_str(serialized_data)
           
        AuditTrail.objects.create(
            action='DELETE',
            changed_by=instance.user,
                organisation=instance.organisation,
            model_name=sender.__name__,
            object_id=instance.pk,
            before=serialized_data_copy  
        )
