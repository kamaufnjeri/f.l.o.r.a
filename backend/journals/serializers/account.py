from rest_framework import serializers
from journals.models import Account, JournalEntries, Organisation, FloraUser, SubCategory, Category, FixedGroup
from django.db import models, transaction
from .journal_entries import JournalEntrySerializer
from journals.constants import ACCOUNT_STRUCTURE, GROUPS, CATEGORIES, SUB_CATEGORIES
from journals.utils import AccountUtils


class FixedGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixedGroup
        fields = ["name", "value", "id"]


class CategorySerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    group = serializers.PrimaryKeyRelatedField(queryset=FixedGroup.objects.all()) 
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())
    value = serializers.CharField(read_only=True)


    class Meta:
        model = Category
        fields = ["id", "name", "value", "organisation", "user", "group"]

    def validate(self, data):
        organisation_id = data.get('organisation')

        try:
            category = Category.objects.get(name=data.get('name'), organisation_id=organisation_id)
            raise serializers.ValidationError(f"Category {data.get('name')} already exists")
        except Category.DoesNotExist:
            return data
        
    def create(self, validated_data):
        try:
            with transaction.atomic():
                value = validated_data.get('name').lower().replace(" ", "_")
                category = Category.objects.create(**validated_data, value=value)

        
                return category
        except Exception as e:
            raise Exception(str(e))

    

class SubCategorySerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    organisation = serializers.CharField(write_only=True)
    value = serializers.CharField(read_only=True)

    class Meta:
        model = SubCategory
        fields = ["id", "name", "value", "category", "organisation"]

    def validate(self, data):
        organisation_id = data.get('organisation')

        try:
            sub_category = SubCategory.objects.get(name=data.get('name'), category__organisation_id=organisation_id)
            raise serializers.ValidationError(f"Sub category {data.get('name')} already exists")
        except SubCategory.DoesNotExist:
            return data
        
    def create(self, validated_data):
        try:
            with transaction.atomic():
                validated_data.pop('organisation')
                value = validated_data.get('name').lower().replace(" ", "_")
                sub_category = SubCategory.objects.create(**validated_data, value=value)
                return sub_category
        except Exception as e:
            raise Exception(str(e))




class AccountSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    belongs_to = serializers.PrimaryKeyRelatedField(queryset=SubCategory.objects.all())
    account_balance = serializers.SerializerMethodField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())
    sub_category = serializers.SerializerMethodField(read_only=True)
    group = serializers.SerializerMethodField(read_only=True)
    category = serializers.SerializerMethodField(read_only=True)


    class Meta:
        fields = ['id', 'name', 'belongs_to', 'opening_balance', 'opening_balance_type', 'account_balance', 'organisation', 'user', 'sub_category', "category", "group"]
        required_fields = ['name', "belongs_to"]
        model = Account

    def get_sub_category(self, obj):
        if obj.belongs_to:
            return obj.belongs_to.name
        return None
    
    def get_group(self, obj):
        if obj.belongs_to and obj.belongs_to.category and obj.belongs_to.category.group:
            return obj.belongs_to.category.group.name
        return None

    def get_category(self, obj):
        if obj.belongs_to and obj.belongs_to.category:
            
            return obj.belongs_to.category.name
        return None


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
                    models.Q(sales_return__date__lte=to_date) |
                    models.Q(payments__date__lte=to_date) |
                    models.Q(service_income__date__lte=to_date)
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
        
        if obj.belongs_to and obj.belongs_to.category and obj.belongs_to.category.group:

            if obj.belongs_to.category.group.value in ('asset', 'expense'):

                return debit_total - credit_total
            else:
                return credit_total - debit_total 


       
    def validate(self, data):
        organisation_id = data.get('organisation')

        opening_balance_type = ['debit', 'credit']
        try:
            account = Account.objects.get(name=data.get('name'), organisation_id=organisation_id)
            raise serializers.ValidationError(f"Account {data.get('name')} already exists")
        except Account.DoesNotExist:
            if data.get('opening_balance_type') and data.get('opening_balance_type') not in opening_balance_type:
                raise serializers.ValidationError(f'Opening balance type can only be: {" and ".join(opening_balance_type)}')
            
            if (data.get('opening_balance') and not data.get('opening_balance_type')) or (
                data.get('opening_balance_type') and not data.get('opening_balance')
            ):
                raise serializers.ValidationError(
                    f'Both opening balance and opening balance type must be given'
                )
            

            return data

    def create(self, validated_data):
        try:
            with transaction.atomic():
                account = Account.objects.create(**validated_data)
                print(validated_data)
                return account
        except Exception as e:
            raise Exception(str(e))


class AccountDetailsSerializer(AccountSerializer):
    account_data = serializers.SerializerMethodField(read_only=True)
   
    
    class Meta:
        model = Account
        fields = AccountSerializer.Meta.fields + ['account_data']

    def validate(self, data):
        organisation_id = data.pop('organisation')

        if 'name' in data:
            new_name = data['name']
            account_id = self.instance.id  
            
            try:
                account = Account.objects.exclude(id=account_id).get(name=new_name, organisation_id=organisation_id)
                raise serializers.ValidationError(f"Account with name {new_name} already exists in this organisation.")
            except Account.DoesNotExist:
                pass  
        if self.partial:
            allowed_fields = {'name'}
            for field in data.keys():
                if field not in allowed_fields:
                    raise serializers.ValidationError(f"{field} is not allowed in a partial update.")

        return data

   
    
    def get_account_data(self, obj):
        date_param = self.context.get('date', None)

        account_data = AccountUtils(obj, period=date_param).get_account_data()
        
        
        return account_data

    

   
    