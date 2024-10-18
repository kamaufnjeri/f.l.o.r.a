from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from journals.utils import flatten_errors, send_email, token_uid
from django.shortcuts import get_object_or_404
from journals.models import Organisation, FloraUser, OrganisationMembership
from journals.serializers import OrganisationSerializer
from django.db import transaction
from datetime import timedelta, datetime
from django.utils import timezone

class OrganisationApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrganisationSerializer
    queryset = Organisation.objects.all()

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})

        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            print(f"Validation Error: {e.detail}") 
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Internal Error: {e}") 
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrganisationSentInviteApiView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        invite_emails = request.data
        try:
            user = request.user

        
            send_email.send_invite_emails(invite_emails, user)
            return Response({"message": "Invite sent successfully"}, status=status.HTTP_201_CREATED)

        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            print(f"Validation Error: {e.detail}") 
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Internal Error: {e}") 
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


       
       

class OrganizationAcceptInviteApiView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                data = request.data
                uidb64 = kwargs.get("uidb64")            
                try:
                    uid = token_uid.decode_uid(uidb64)
                    print(uid)
                    organisation_membership = OrganisationMembership.objects.get(pk=uid)
                except (TypeError, ValueError, OverflowError):
                    return Response({
                        'error': 'Bad Request',
                        'details': 'Invalid ID.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                invite_data = organisation_membership.invite_data
                
                print(invite_data)
                if data.get('email') != invite_data.get('user_email'):
                    return Response({
                        'error': 'Bad Request',
                        'details': 'Invite link not for the given email.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if uidb64 != invite_data.get('token'):
                    return Response({
                        'error': 'Bad Request',
                        'details': 'Token invalid.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                created_at_str = invite_data.get('created_at')

                created_at = datetime.fromisoformat(created_at_str)
                expiration_time = created_at + timedelta(hours=8)
                print(expiration_time)
                if timezone.now() > expiration_time:
                    return Response({
                        'error': 'Bad Request',
                        'details': 'Token is expired.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                user = None
                organisation = organisation_membership.organisation
                if data.get('is_login'):
                    user = self.handle_login(data)
                    if isinstance(user, Response):
                        return user
                
                else:
                    user = self.handle_registration(data)
                    if isinstance(user, Response):
                        return user
                    
                    organisation_membership.user = user
                user.current_org = organisation
                organisation_membership.invite_data = None
                organisation_membership.is_active = True
                organisation_membership.save()
                user.save()
                return Response({"message": f"Invite to join {organisation_membership.organisation.org_name} accepted"}, status=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            print(f"Validation Error: {e.detail}") 
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Internal Error: {e}") 
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def handle_login(self, data):
        try:
            user = FloraUser.objects.get(email=data['email'])
        except FloraUser.DoesNotExist:
            raise serializers.ValidationError(
                f'User {data["email"]} not found.Please register to continue'
            )
        if not user.check_password(data.get('password')):
            raise serializers.ValidationError(
                'Invalid password'
            )
        

        return user

    def handle_registration(self, data):
        confirm_password = data.pop('confirm_password')
        password = data.pop('password')
        data.pop('is_login')

        if password != confirm_password:
            raise serializers.ValidationError('Password does not match confirm password'
           )

        new_user = FloraUser(**data, is_verified=True)
        new_user.set_password(password)
        return new_user