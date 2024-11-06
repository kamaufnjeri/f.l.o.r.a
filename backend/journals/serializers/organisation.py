from rest_framework import serializers
from journals.models import Organisation, OrganisationMembership, Category, SubCategory, FixedGroup
from django.db import transaction
from journals.constants import INITIAL_DATA
from .account import AccountSerializer, CategorySerializer, SubCategorySerializer


class OrganisationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    class Meta:
        model = Organisation
        fields = ["id", "org_name", "org_email", "country", "currency", "org_phone_number"]

    def create(self, validated_data):
        with transaction.atomic():
            request = self.context.get('request')
            if request is None:
                raise serializers.ValidationError({'error': 'Request context not available'})
            user = request.user

            organisation = Organisation.objects.create(org_admin=user, **validated_data)

            for data in INITIAL_DATA:
                category_data = data["category"]
                group_name = category_data.pop('group')

                try:
                    group = FixedGroup.objects.get(name=group_name)
                except FixedGroup.DoesNotExist:
                    raise serializers.ValidationError(f"Group {group_name} not found")

                category_data.update({"user": user.id, "organisation": organisation.id, "group": group.id})
                category_serializer = CategorySerializer(data=category_data)
                if category_serializer.is_valid():
                    print(category_data)
                    category = category_serializer.save()
                else:
                    print('category errors', category_serializer.errors)
                    raise serializers.ValidationError(category_serializer.errors)

                for sub_category_data in data["sub_categories"]:
                    sub_category_data["category"] = category.id
                    sub_category_data['organisation'] = str(organisation.id)
                    sub_category_serializer = SubCategorySerializer(data=sub_category_data)
                    if sub_category_serializer.is_valid():
                        print(sub_category_data)
                        sub_category = sub_category_serializer.save()
                    else:
                        print('sub category errors', sub_category_serializer.errors)

                        raise serializers.ValidationError(sub_category_serializer.errors)

                    for account_data in sub_category_data.get("accounts", []):
                        account_data.update({
                            "user": user.id,
                            "organisation": organisation.id,
                            "belongs_to": sub_category.id
                        })
                        print(account_data)
                        account_serializer = AccountSerializer(data=account_data)
                        if account_serializer.is_valid():
                            print(account_data)
                            account_serializer.save()
                        else:
                            print('account errors', account_serializer.errors)

                            raise serializers.ValidationError(account_serializer.errors)

            user.current_org = organisation
            OrganisationMembership.objects.create(
                organisation=organisation,
                user=user,
                role='admin',
                is_active=True
            )
            user.save()

        return organisation
    
