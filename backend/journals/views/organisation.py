from journals.permissions.user_in_organisation import IsSuperAdmin
from journals.serializers.organisation import OrgDetailSerializer
from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from journals.utils import flatten_errors, send_email, token_uid
from journals.models import Organisation, FloraUser, OrganisationMembership
from journals.serializers import OrganisationSerializer, FloraUserSerializer
from django.db import transaction
from datetime import timedelta, datetime
from django.utils import timezone
from journals.permissions import IsSuperAdmin


class ChangeCurrentOrgApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                org_id = request.data.get('org_id')
                user = request.user

                if user.current_org.id == org_id:
                    return Response(
                        {
                            "error": "Bad Request",
                            "details": "Organisation is already the current organisation.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                try:
                    organisation = Organisation.objects.get(pk=org_id)
                except Organisation.DoesNotExist:
                    return Response({
                        'error': 'Bad Request',
                        'details': 'Organisation does not exist'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if user.current_org == organisation:
                    return Response(
                        {
                            "error": "Bad Request",
                            "details": "Organisation is already the current organisation.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                elif not user.org_membership.filter(
                    organisation=organisation,
                    is_active=True,
                ).exists():
                    return Response(
                        {
                            "error": "Forbidden",
                            "details": "You are not a member of this organisation.",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

                user.current_org = organisation
                user.save()

                return Response(
                    {
                        "message": "Organisation changed successfully",
                        "user": FloraUserSerializer(user).data,
                    },
                    status=status.HTTP_200_OK,
                )
        except Exception as e:
            print(f"Internal Error: {e}") 
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrganisationApiView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrganisationSerializer
    queryset = Organisation.objects.all()

    def post(self, request, *args, **kwargs):

        try:
            serializer_data = request.data.copy()
            serializer_data['organisation'] = kwargs.get('organisation_id')
            serializer_data['user'] = request.user.id
            serializer = self.serializer_class(data=serializer_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            user_data = FloraUserSerializer(request.user).data
            return Response(user_data, status=status.HTTP_201_CREATED)
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
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, *args, **kwargs):
        invite_data = request.data
        try:
            user = request.user
    
            send_email.send_invite_emails(invite_data, user)
            return Response({"message": "Invite sent successfully", "user": FloraUserSerializer(request.user).data}, status=status.HTTP_201_CREATED)
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
                   
                else:
                    user = self.handle_registration(data)
                    
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
            raise serializers.ValidationError(
                'Password does not match confirm password'
            )

        user = FloraUser(**data, is_verified=True)
        user.set_password(password)
        user.save()   # ✅ save here

        return user
    
class OrganisationDetailsApiView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = OrgDetailSerializer
    queryset = Organisation.objects.all()
    lookup_field = "id"          # model field
    lookup_url_kwarg = "organisation_id"  # URL parameter

     
    def get(self, request, *args, **kwargs):
        org_id = kwargs.get('organisation_id')

        try:
            org = self.get_object()            

            serializer = self.get_serializer(org)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Organisation.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The org of ID {org_id} does not exist.'
            }, status=status.HTTP_404_NOT_FOUND)

        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'error': 'Internal Server Error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def patch(self, request, *args, **kwargs):
        org_id = kwargs.get('organisation_id')
        try:
            instance = self.get_object()
           
            partial = kwargs.pop('partial', True)
            data = request.data.copy()
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response({
                "message": "Organisation updated successfully.",
                "user": FloraUserSerializer(request.user).data,
            } , status=status.HTTP_200_OK)
        except Organisation.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The org of ID {org_id} does not exist.'
            }, status=status.HTTP_404_NOT_FOUND)

        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'error': 'Internal Server Error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
   
class OrganisationArchiveApiView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrgDetailSerializer
    queryset = Organisation.objects.all()
    lookup_field = "pk"          # model field

        
    def patch(self, request, *args, **kwargs):
        org_id = kwargs.get('pk')
        try:
            instance = self.get_object()
            is_archived = request.data.get("is_archived")

            if request.user.id != instance.super_admin.id:
                 return Response({
                    'error': 'Forbidden',
                    'details': "Only super admin can archive organisation"
                }, status=status.HTTP_403_FORBIDDEN)

            instance.is_archived = is_archived
            instance.save()

            return Response(
                {
                    "message": (
                        "Organisation archived successfully."
                        if instance.is_archived
                        else "Organisation unarchived successfully."
                    ),
                    "user": FloraUserSerializer(request.user).data,
                },
                status=status.HTTP_200_OK,
            )
        
        except Organisation.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The org of ID {org_id} does not exist.'
            }, status=status.HTTP_404_NOT_FOUND)

        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'error': 'Internal Server Error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class OrganisationMembershipApiView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    serializer_class = OrgDetailSerializer
    queryset = OrganisationMembership.objects.all()
    lookup_field = "id"          # model field
    lookup_url_kwarg = 'organisation_id'


    def patch(self, request, *args, **kwargs):
        org_id = kwargs.get('organisation_id')
        try:
            user_id = request.data.get('user_id')
            user_role = request.data.get('user_role')
            membership = OrganisationMembership.objects.get(organisation_id=org_id, user_id=user_id)
            
            user = membership.user
            if user.id == request.user.id:
                return Response({
                    'error': 'Bad Request',
                    'details': 'You cannot change your role in the organisation.'
                }, status=status.HTTP_400_BAD_REQUEST)          
            if membership.role == 'super_admin':
                
                return Response({
                    'error': 'Bad Request',
                    'details': 'Cannot change role of super_admin in the organisation.'
                }, status=status.HTTP_400_BAD_REQUEST)
                

            if user_role == membership.role:
                return Response({
                    'error': 'Bad Request',
                    'details': 'Role is same.'
                }, status=status.HTTP_400_BAD_REQUEST) 

            membership.role = user_role
            membership.save()

            return Response(
                {
                    "message":"Member role changed successfully.", 
                    "user": FloraUserSerializer(request.user).data,
                },
                status=status.HTTP_200_OK,
            )
            
        except Organisation.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The org of ID {org_id} does not exist.'
            }, status=status.HTTP_404_NOT_FOUND)

        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            raise e
            return Response({
                'error': 'Internal Server Error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    def delete(self, request, *args, **kwargs):
        org_id = kwargs.get('organisation_id')

        try:
            user_id = request.data.get('user_id')
            membership = OrganisationMembership.objects.get(organisation_id=org_id, user_id=user_id)
            
            user = membership.user
            if user.id == request.user.id:
                return Response({
                    'error': 'Bad Request',
                    'details': 'You cannot remove yourself from the organisation.'
                }, status=status.HTTP_400_BAD_REQUEST)          
            if membership.role == 'super_admin':
            
                return Response({
                    'error': 'Bad Request',
                    'details': 'Cannot remove super dmin from the organisation.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            if user.current_org and user.current_org.id == org_id:
                user.current_org = None
                user.save()
                
            membership.delete()

            return Response({"message": "Member removed from organisation successfully.", "user": FloraUserSerializer(request.user).data}, status=status.HTTP_200_OK)

        except OrganisationMembership.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The membership does not exist.'
            }, status=status.HTTP_404_NOT_FOUND)

        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'error': 'Internal Server Error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)