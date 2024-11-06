from rest_framework import serializers
from journals.models import Invoice, Journal, Sales, Customer, Discount, Account, ServiceIncome
from .account import AccountDetailsSerializer
from .service import ServiceIncomeSerializer, ServiceIncomeEntrySerializer
from .journal import JournalSerializer
from .bill_invoice import InvoiceSerializer
from .journal_entries import JournalEntrySerializer
from .sales import SalesSerializer
from .account import AccountDetailsSerializer
from .stock import StockDetailsSerializer
from django.db import transaction
import decimal
from journals.utils import JournalEntriesManager, SalesEntriesManager, ServiceIncomeEntriesManager

journal_entries_manager = JournalEntriesManager()
sales_entries_manager = SalesEntriesManager()
service_income_entries_manager = ServiceIncomeEntriesManager()



class JournalInvoiceSerializer(JournalSerializer):
    invoice = InvoiceSerializer()
    class Meta:
        model = Journal
        fields = JournalSerializer.Meta.fields

    def validate(self, data):
        journal_entries = data.get('journal_entries')
        journal_entries_manager.validate_journal_entries(journal_entries)
        return data
    
    def create(self, validated_data):
        with transaction.atomic():
            
            journal_entries = validated_data.pop('journal_entries')
            invoice = validated_data.pop('invoice')
            customer_id = invoice.get('customer')
            try:
                customer = Customer.objects.get(id=customer_id.id)
            except Customer.DoesNotExist:
                raise serializers.ValidationError(f"Customer with ID {customer_id} not found")
            invoice['customer'] = customer
            amount_due = invoice.get('amount_due')
            journal = Journal.objects.create(**validated_data)
            invoice = Invoice.objects.create(journal=journal, total_amount=amount_due, status="unpaid", organisation=validated_data.get('organisation'), user=validated_data.get('user'), **invoice)

            account = customer.account

            journal_entries.append({
                "amount": amount_due,
                "debit_credit": "debit",
                "account": account.id
            })
            journal_entries_manager.create_journal_entries(journal_entries, "journal", journal, AccountDetailsSerializer)

        return journal
    
class SalesInvoiceSerializer(SalesSerializer):
    journal_entries = JournalEntrySerializer(many=True, required=False)

    class Meta:
        model = Sales
        fields = SalesSerializer.Meta.fields + ['invoice']

    def validate(self, data):
        sales_entries = data.get('sales_entries')
        sales_entries_manager.validate_sales_entries(sales_entries)
        return data
    
    def create(self, validated_data): 
        with transaction.atomic():
            sales_entries = validated_data.pop('sales_entries')
            journal_entries = []
            invoice = validated_data.pop('invoice')
            discount_allowed = validated_data.pop('discount_allowed')
            customer_id = invoice.get('customer')
            try:
                customer = Customer.objects.get(id=customer_id.id)
            except Customer.DoesNotExist:
                raise serializers.ValidationError(f"Customer with ID {customer_id} not found")
            invoice['customer'] = customer
            amount_due = invoice.get('amount_due')
            receivables_account = customer.account

            sales = Sales.objects.create(**validated_data)
            invoice = Invoice.objects.create(sales=sales, total_amount=amount_due, organisation=validated_data.get('organisation'), user=validated_data.get('user'), status="unpaid", **invoice)
            if discount_allowed.get('discount_amount') > 0.00 and discount_allowed.get('discount_percentage') > 0.00:
                discount = Discount.objects.create(sales=sales, discount_type='sales', **discount_allowed)
                try:
                    discount_account = Account.objects.get(name='Discount Allowed', organisation_id=validated_data.get('organisation'))
                except Account.DoesNotExist:
                    raise serializers.ValidationError("Discount Allowed account not found")
                discount_account_data = journal_entries_manager.create_journal_entry(discount_account, discount.discount_amount, 'debit')
                journal_entries.append(discount_account_data)

            total_sales_price = sales_entries_manager.create_sales_entries(sales_entries, sales, StockDetailsSerializer)
            receivables_account_data = journal_entries_manager.create_journal_entry(receivables_account, amount_due, "debit")
            journal_entries.append(receivables_account_data)
            journal_entries = journal_entries_manager.sales_journal_entries_dict(journal_entries, total_sales_price, validated_data.get('organisation'))
            journal_entries_manager.validate_double_entry(journal_entries)
            journal_entries_manager.create_journal_entries(journal_entries, "sales", sales, AccountDetailsSerializer)
        return sales
    

class ServiceIncomeInvoiceSerializer(ServiceIncomeSerializer):
    journal_entries = JournalEntrySerializer(many=True, required=False)


    class Meta:
        model = ServiceIncome
        fields = ServiceIncomeSerializer.Meta.fields

    def validate(self, data):
        service_income_entries = data.get('service_income_entries')

        service_income_entries_manager.validate_service_income_entries(service_income_entries)

        return data
    
    def create(self, validated_data): 
        with transaction.atomic():
            service_income_entries_data = validated_data.pop('service_income_entries')
            journal_entries = []
            invoice = validated_data.pop('invoice')
            discount_allowed = validated_data.pop('discount_allowed')
            customer_id = invoice.get('customer')
            try:
                customer = Customer.objects.get(id=customer_id.id)
            except Customer.DoesNotExist:
                raise serializers.ValidationError(f"Customer with ID {customer_id} not found")
            
            try:
                service_income_account = Account.objects.get(name="Service Income", organisation=validated_data.get('organisation'))
            except Account.DoesNotExist:
                raise serializers.ValidationError('Service Income Account not found')
            invoice['customer'] = customer
            amount_due = invoice.get('amount_due')
            receivables_account = customer.account

            service_income = ServiceIncome.objects.create(**validated_data)
            invoice = Invoice.objects.create(service_income=service_income, total_amount=amount_due, organisation=validated_data.get('organisation'), user=validated_data.get('user'), status="unpaid", **invoice)
            total_service_income = service_income_entries_manager.create_service_income_entries(service_income_entries_data, service_income)

            if discount_allowed.get('discount_amount') > 0.00 and discount_allowed.get('discount_percentage') > 0.00:
                discount = Discount.objects.create(service_income=service_income, discount_type='service_income', **discount_allowed)
                try:
                    discount_account = Account.objects.get(name='Discount Allowed', organisation_id=validated_data.get('organisation'))
                except Account.DoesNotExist:
                    raise serializers.ValidationError("Discount Allowed account not found")
                discount_account_data = journal_entries_manager.create_journal_entry(discount_account, decimal.Decimal(discount.discount_amount), 'debit')
                journal_entries.append(discount_account_data)

            receivables_account_data = journal_entries_manager.create_journal_entry(receivables_account, decimal.Decimal(amount_due), "debit")
            journal_entries.append(receivables_account_data)
            service_income_account_data = journal_entries_manager.create_journal_entry(service_income_account, decimal.Decimal(total_service_income), "credit")
            journal_entries.append(service_income_account_data)
            print(journal_entries)
            journal_entries_manager.validate_double_entry(journal_entries)
            journal_entries_manager.create_journal_entries(journal_entries, "service_income", service_income, AccountDetailsSerializer)

        return service_income