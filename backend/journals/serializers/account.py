from rest_framework import serializers
from journals.models import Account, JournalEntries, Organisation, FloraUser
from django.db import models
from .journal_entries import JournalEntrySerializer
from journals.constants import ACCOUNT_STRUCTURE, GROUPS, CATEGORIES, SUB_CATEGORIES


def validate_choice(value, choices):
    if value not in dict(choices):
        valid_choices = ', '.join(dict(choices).keys())
        raise serializers.ValidationError(f'Invalid choice "{value}". Valid choices are: {valid_choices}')
    
class AccountSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    group = serializers.CharField(validators=[lambda value: validate_choice(value, GROUPS)])
    category = serializers.CharField(validators=[lambda value: validate_choice(value, CATEGORIES)])
    sub_category = serializers.CharField(validators=[lambda value: validate_choice(value, SUB_CATEGORIES)]) 
    account_balance = serializers.SerializerMethodField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())


    class Meta:
        fields = ['id', 'name', 'group', 'category', 'sub_category', 'opening_balance', 'opening_balance_type', 'account_balance', 'organisation', 'user']
        required_fields = ['name', 'category', 'sub_category']
        model = Account

    def get_account_balance(self, obj):
        to_date = self.context.get('to_date', None)
        
        if to_date:
            journal_entries = JournalEntries.objects.filter(
                models.Q(account=obj) &
                models.Q(
                    models.Q(journal__date__lte=to_date) |
                    models.Q(sales__date__lte=to_date) |
                    models.Q(purchase__date__lte=to_date) |
                    models.Q(purchase_return__date__lte=to_date) |
                    models.Q(sales_return__date__lte=to_date)
                )
            )
        else:
            journal_entries = JournalEntries.objects.filter(account=obj)
        
        debit_total = sum(entry.amount for entry in journal_entries if entry.debit_credit == 'debit')
        credit_total = sum(entry.amount for entry in journal_entries if entry.debit_credit == 'credit')

        if obj.opening_balance and obj.opening_balance_type:
            if obj.opening_balance_type == 'debit':
                debit_total += obj.opening_balance
            else:
                credit_total += obj.opening_balance
        
        if obj.group in ('asset', 'expense'):
            return debit_total - credit_total
        else:
            return credit_total - debit_total 


       
    def validate(self, data):
        group = data.get('group')
        category = data.get('category')
        sub_category = data.get('sub_category')

        categories = ACCOUNT_STRUCTURE[group]
        
        if category not in categories:
            raise serializers.ValidationError(
                f'Category "{category}" under group "{group}" is not valid. Valid categories are: {", ".join(categories.keys())}'
            )
        
        sub_categories = categories[category]
        
        if sub_category not in sub_categories:
            raise serializers.ValidationError(
                f'Subcategory "{sub_category}" under category "{category}" is not valid. Valid subcategories are: {", ".join(sub_categories)}'
            )
        
        opening_balance_type = ['debit', 'credit']
        
        if data.get('opening_balance_type') and data.get('opening_balance_type') not in opening_balance_type:
            raise serializers.ValidationError(f'Opening balance type can only be: {" and ".join(opening_balance_type)}')
        
        if (data.get('opening_balance') and not data.get('opening_balance_type')) or (
            data.get('opening_balance_type') and not data.get('opening_balance')
        ):
            raise serializers.ValidationError(
                f'Both opening balance and opening balance type must be given'
            )
        return data


class AccountDetailsSerializer(AccountSerializer):
    journal_entries = JournalEntrySerializer(many=True)

    class Meta:
        model = Account
        fields = AccountSerializer.Meta.fields + ['journal_entries']


    