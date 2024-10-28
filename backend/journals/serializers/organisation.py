from rest_framework import serializers
from journals.models import Organisation, OrganisationMembership
from django.db import transaction
from journals.constants import INITIAL_ACCOUNTS
from .account import AccountSerializer


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
            for account_data in INITIAL_ACCOUNTS:
                account_data['user'] = user.id
                account_data['organisation'] = organisation.id
                print(account_data)
                account_serializer = AccountSerializer(data=account_data)
                if account_serializer.is_valid():
                    account_serializer.save()
                else:
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
    
