import uuid
import decimal
from datetime import date, datetime
from django.db import transaction
from django.db.models.signals import post_save, pre_save, pre_delete
from django.dispatch import receiver

from journals.models import AuditTrail, Organisation, FloraUser
from journals.serializers import (
    AccountSerializer,
    StockSerializer,
    CustomerSerializer,
    SupplierSerializer,
    JournalDetailSerializer,
    SalesDetailSerializer,
    PurchaseDetailSerializer,
    ServiceSerializer,
    ServiceIncomeDetailSerializer,
    SalesReturnSerializer,
    PurchaseReturnSerializer,
    PaymentSerializer,    
)



def convert_json_values(data):
    if isinstance(data, dict):
        return {k: convert_json_values(v) for k, v in data.items()}

    if isinstance(data, list):
        return [convert_json_values(v) for v in data]

    if isinstance(data, uuid.UUID):
        return str(data)

    if isinstance(data, decimal.Decimal):
        return float(data)

    if isinstance(data, (date, datetime)):
        return data.isoformat()

    return data


def prettify_audit_data(data):
    data = convert_json_values(data)

    if not isinstance(data, dict):
        return data

    if data.get("user"):
        user = FloraUser.objects.filter(pk=data["user"]).first()
        data["user"] = f'{user.get_full_name()} - {user.email}' if user else data["user"]

    if data.get("organisation"):
        org = Organisation.objects.filter(pk=data["organisation"]).first()
        data["organisation"] = f'{org.org_name} - {org.org_email}' if org else data["organisation"]

    return data


def get_serializer_for_model(instance):
    serializer_map = {
        "Account": AccountSerializer,
        "Stock": StockSerializer,
        "Customer": CustomerSerializer,
        "Supplier": SupplierSerializer,
        "Journal": JournalDetailSerializer,
        "Sales": SalesDetailSerializer,
        "Purchase": PurchaseDetailSerializer,
        "Service": ServiceSerializer,
        "ServiceIncome": ServiceIncomeDetailSerializer,
        "SalesReturn": SalesReturnSerializer,
        "PurchaseReturn": PurchaseReturnSerializer,
        "Payment": PaymentSerializer,
    }

    return serializer_map.get(instance.__class__.__name__)


def serialize_instance(instance):
    serializer_class = get_serializer_for_model(instance)

    if not serializer_class:
        return None

    fresh_instance = instance.__class__.objects.get(pk=instance.pk)

    return prettify_audit_data(serializer_class(fresh_instance).data)



@receiver(post_save)
def create_audit_trail_on_add(sender, instance, created, **kwargs):
    if not created:
        return

    serializer_class = get_serializer_for_model(instance)

    if not serializer_class:
        return

    def log():
        AuditTrail.objects.create(
            action="ADD",
            model_name=sender.__name__,
            object_id=instance.pk,
            changed_by=getattr(instance, "user", None),
            organisation=getattr(instance, "organisation", None),
            after=serialize_instance(instance),
        )

    transaction.on_commit(log)

@receiver(pre_save)
def cache_old_instance(sender, instance, **kwargs):
    if not instance.pk:
        return

    serializer_class = get_serializer_for_model(instance)

    if not serializer_class:
        return

    try:
        old_instance = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    instance._audit_before = prettify_audit_data(
        serializer_class(old_instance).data
    )


@receiver(post_save)
def create_audit_trail_on_edit(sender, instance, created, **kwargs):
    if created:
        return

    serializer_class = get_serializer_for_model(instance)

    if not serializer_class:
        return

    before = getattr(instance, "_audit_before", None)

    if before is None:
        return

    def log():
        after = serialize_instance(instance)
        

        if before != after:
            AuditTrail.objects.create(
                action="EDIT",
                model_name=sender.__name__,
                object_id=instance.pk,
                changed_by=getattr(instance, "user", None),
                organisation=getattr(instance, "organisation", None),
                before=before,
                after=after,
            )

    transaction.on_commit(log)

@receiver(pre_delete)
def create_audit_trail_on_delete(sender, instance, **kwargs):
    serializer_class = get_serializer_for_model(instance)

    if not serializer_class:
        return

    AuditTrail.objects.create(
        action="DELETE",
        model_name=sender.__name__,
        object_id=instance.pk,
        changed_by=getattr(instance, "user", None),
        organisation=getattr(instance, "organisation", None),
        before=prettify_audit_data(serializer_class(instance).data),
    )

