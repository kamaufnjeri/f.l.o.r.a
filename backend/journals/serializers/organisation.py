from rest_framework import serializers
from journals.models import Organisation, OrganisationMembership, Category, SubCategory, FixedGroup
from django.db import transaction
from journals.constants import INITIAL_DATA
from .account import AccountSerializer, CategorySerializer, SubCategorySerializer


class OrganisationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    org_users = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Organisation
        fields = ["id", "org_name", "org_email", "country", "currency", "org_phone_number", "is_archived", "org_users", "super_admin"]

    def create(self, validated_data):
        with transaction.atomic():
            request = self.context.get('request')
            if request is None:
                raise serializers.ValidationError({'error': 'Request context not available'})
            user = request.user

            organisation = Organisation.objects.create(super_admin=user, **validated_data)


            for data in INITIAL_DATA:
                category_data = data["category"]
                group_name = category_data.pop('group')

                try:
                    group = FixedGroup.objects.get(name=group_name)
                except FixedGroup.DoesNotExist:
                    group, created = FixedGroup.objects.get_or_create(name=group_name)

                category_data.update({"user": user.id, "organisation": organisation.id, "group": group.id})
                category_serializer = CategorySerializer(data=category_data)
                if category_serializer.is_valid():
                    category = category_serializer.save()
                else:
                    raise serializers.ValidationError(category_serializer.errors)

                for sub_category_data in data["sub_categories"]:
                    sub_category_data["category"] = category.id
                    sub_category_data['organisation'] = str(organisation.id)
                    sub_category_serializer = SubCategorySerializer(data=sub_category_data)
                    if sub_category_serializer.is_valid():
                        sub_category = sub_category_serializer.save()
                    else:

                        raise serializers.ValidationError(sub_category_serializer.errors)

                    for account_data in sub_category_data.get("accounts", []):
                        account_data.update({
                            "user": user.id,
                            "organisation": organisation.id,
                            "belongs_to": sub_category.id
                        })
                        account_serializer = AccountSerializer(data=account_data)
                        if account_serializer.is_valid():
                            account_serializer.save()
                        else:
                            print('account errors', account_serializer.errors)

                            raise serializers.ValidationError(account_serializer.errors)

            user.current_org = organisation
            OrganisationMembership.objects.create(
                organisation=organisation,
                user=user,
                role='super_admin',
                is_active=True
            )
            user.save()

        return organisation
    
    def get_org_users(self, obj):
        memberships = obj.org_membership.all()
        users_data = []
        for membership in memberships:
            user = membership.user
            if user and user.is_active and not user.is_archived:
                is_super_admin = user.id == obj.super_admin.id
                user_data = {
                    "user_id": user.id,
                    "user_name": f"{user.first_name} {user.last_name}",
                    "user_email": user.email,
                    "user_role": membership.role,
                    "is_active": membership.is_active,
                    "is_super_admin": is_super_admin
                }
                users_data.append(user_data)
        return users_data
    
class OrgDetailSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    org_users = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Organisation
        fields = ["id", "org_name", "org_email", "country", "currency", "org_phone_number", "super_admin", "is_archived", "org_users"]


    def validate(self, data):      
        if self.partial:
            allowed_fields = {'org_name', 'org_email', 'org_phone_number', 'country', 'currency'}
            for field in data.keys():
                if field not in allowed_fields:
                    raise serializers.ValidationError(f"{field} is not allowed in a partial update.")

        return data
    
    def update(self, instance, validated_data):
        org_name = validated_data.get('org_name', instance.org_name)
        org_email = validated_data.get('org_email', instance.org_email)
        org_phone_number = validated_data.get('org_phone_number', instance.org_phone_number)
        country = validated_data.get('country', instance.country)
        currency = validated_data.get('currency', instance.currency)
        instance.org_name = org_name
        instance.org_email = org_email
        instance.org_phone_number = org_phone_number
        instance.country = country
        instance.currency = currency

        
        instance.save()

        return instance
    
    def get_org_users(self, obj):
        memberships = obj.org_membership.all()
        users_data = []
        for membership in memberships:
            user = membership.user
            if user and user.is_active and not user.is_archived:
                is_super_admin = user.id == obj.super_admin.id
                user_data = {
                    "user_id": user.id,
                    "user_name": f"{user.first_name} {user.last_name}",
                    "user_email": user.email,
                    "user_role": membership.role,
                    "is_active": membership.is_active,
                    "is_super_admin": is_super_admin

                }
                users_data.append(user_data)
        return users_data
    