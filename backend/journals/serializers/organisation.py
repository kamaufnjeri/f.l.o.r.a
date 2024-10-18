from rest_framework import serializers
from journals.models import Organisation, OrganisationMembership
from django.db import transaction

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
            user.current_org = organisation
            OrganisationMembership.objects.create(
                organisation=organisation,
                user=user,
                role='admin',
                is_active=True
            )
            user.save()

        return organisation
    
