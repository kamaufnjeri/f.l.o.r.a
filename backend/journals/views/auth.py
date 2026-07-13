from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors, send_email, token_uid
from journals.models import FloraUser
from journals.serializers import RegisterSerializer, LoginSerializer, ForgotPasswordSerializeer, ResetPasswordSerializer, FloraUserSerializer
from django.shortcuts import get_object_or_404
from dotenv import load_dotenv
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import IsAuthenticated, AllowAny
import os
from rest_framework.response import Response


load_dotenv()



class CookieTokenRefreshView(generics.GenericAPIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        refresh_token = request.COOKIES.get("refreshToken")

        if not refresh_token:
            return Response(
                {"error": "No refresh token found"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            refresh = RefreshToken(refresh_token)

            access = str(refresh.access_token)

            res = Response({"detail": "Token refreshed"}, status=status.HTTP_200_OK)

            # 🔥 update access cookie
            res.set_cookie(
                key="accessToken",
                value=str(access),
                httponly=True,
                secure=True,  # set True in production (HTTPS)
                samesite="None",
                max_age=60 * 60 * 24,  # 1 day
            )
            return res

        except TokenError:
            res = Response(
                {"error": "refresh_expired"},
                status=status.HTTP_401_UNAUTHORIZED
            )

            # clear cookies
            res.delete_cookie("accessToken")
            res.delete_cookie("refreshToken")

            return res
        
class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get("refresh")

            res = Response(
                {"detail": "Logout successful."},
                status=status.HTTP_200_OK
            )

            # always clear cookies
            res.delete_cookie("accessToken")
            res.delete_cookie("refreshToken")

            if not refresh_token:
                return res

            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass

            return res
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
class MeAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated] 
    
    def get(self, request, *args, **kwargs):
        user = request.user
        user_serializer = FloraUserSerializer(user)
        data = user_serializer.data
       
        return Response(data, status=status.HTTP_200_OK)
    

    
class ForgotPasswordAPIView(generics.GenericAPIView):    
    serializer_class = ForgotPasswordSerializeer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data['user']

            try:
                send_email.send_reset_password_email(user)
                return Response({"message": "Check email for reset password link"}, status=status.HTTP_200_OK)
            except Exception as email_exception:
                print(f"Email Sending Error: {email_exception}") 
                return Response({
                    'error': 'Email sending failed',
                    'details': str(email_exception)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResetPasswordAPIView(generics.UpdateAPIView):    
    serializer_class = ResetPasswordSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            try:
                uid = token_uid.decode_uid(kwargs.get("uidb64"))

                user = get_object_or_404(FloraUser, pk=uid)
            except (TypeError, ValueError, OverflowError):
                return Response({
                    'error': 'Bad Request',
                    'details': 'Invalid user ID.'
                }, status=status.HTTP_400_BAD_REQUEST)

            token = kwargs.get("token")
            
            if user and token_uid.confirm_token(user, token):
                user.set_password(serializer.validated_data['password'])
                user.save()
                return Response({'detail': 'Password has been reset.'}, status=status.HTTP_202_ACCEPTED)
            else:
                return Response({
                        'error': 'Bad Request',
                        'details': "Invalid or expired token."
                    }, status=status.HTTP_400_BAD_REQUEST)

class CustomLoginAPIView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        if user.is_archived:
            return Response(
                {
                    "error": "Archived user",
                    "details": "This account has been archived. Please contact support for assistance.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ❌ Not verified
        if not user.is_verified:
            try:
                send_email.sent_email_confirmation_message(user)
            except Exception as e:
                return Response(
                    {"error": "Email sending failed", "details": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response(
                {
                    "error": "Unverified user",
                    "details": "Check email to verify your account",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # 🔐 Generate tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        user_serializer = FloraUserSerializer(user)

        # 🔥 CREATE RESPONSE FIRST
        response = Response(
            {
                
                "user": user_serializer.data,
            },
            status=status.HTTP_200_OK,
        )

        # 🍪 SET HTTP-ONLY COOKIES
        response.set_cookie(
            key="accessToken",
            value=str(access),
            httponly=True,
            secure=True,  # set True in production (HTTPS)
            samesite="None",
            max_age=60 * 60 * 24,  # 1 day
        )

        response.set_cookie(
            key="refreshToken",
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite="None",
            max_age=60 * 60 * 24 * 7,  # 7 days
        )

        return response

class RegisterAPIVew(generics.CreateAPIView):
    queryset = FloraUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                user_exists = FloraUser.objects.filter(email=serializer.validated_data['email']).exists()
                if user_exists:
                    if user_exists and user_exists.is_archived:
                        return Response({
                            'error': 'Conflict',
                            'details': 'A user with this email exists but is archived. Please contact support to reactivate your account.'
                        }, status=status.HTTP_409_CONFLICT)
                    return Response({
                        'error': 'Conflict',
                        'details': 'A user with this email already exists.'
                    }, status=status.HTTP_409_CONFLICT)
                user = serializer.create(serializer.validated_data)
                
                try:
                    send_email.sent_email_confirmation_message(user)
                    user.save()
                    return Response({"message": "User created successfully. A confirmation email has been sent."}, 
                                    status=status.HTTP_201_CREATED)
                except Exception as email_exception:
                    print(f"Email Sending Error: {email_exception}") 
                    return Response({
                        'error': 'Email sending failed',
                        'details': str(email_exception)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                errors = flatten_errors(serializer.errors)
                print(f"Validation Error: {serializer.errors}") 
                return Response({
                    'error': 'Bad Request',
                    'details': errors
                }, status=status.HTTP_400_BAD_REQUEST)



class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            uid = token_uid.decode_uid(kwargs.get("uidb64"))

            user = get_object_or_404(FloraUser, pk=uid)
        except (TypeError, ValueError, OverflowError):
            return Response({
                'error': 'Bad Request',
                'details': 'Invalid user ID.'
            }, status=status.HTTP_400_BAD_REQUEST)

        token = kwargs.get("token")
        
        if user and token_uid.confirm_token(user, token):
            if user.is_verified:
                return Response({"message": "Email is already verified!"}, status=status.HTTP_200_OK)
            else:
                user.is_verified = True
                user.save()
                return Response({"message": "Email verified successfully!"}, status=status.HTTP_200_OK)
        else:
            return Response({
                    'error': 'Bad Request',
                    'details': "Invalid or expired token."
                }, status=status.HTTP_400_BAD_REQUEST)
        
   
class UserDetailsApiView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FloraUserSerializer
    queryset = FloraUser.objects.all()
    lookup_field = "pk"

     
    def get(self, request, *args, **kwargs):
        user_id = kwargs.get('pk')

        try:
            user = self.get_object()            

            serializer = self.get_serializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except FloraUser.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The user of ID {user_id} does not exist.'
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
        user_id = kwargs.get('pk')
        try:
            partial = kwargs.pop('partial', True)
            data = request.data.copy()
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response({
                "message": "User updated successfully.",
                "user": serializer.data,
            } , status=status.HTTP_200_OK)
        except FloraUser.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The user of ID {user_id} does not exist.'
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
        
    def delete(self, request, *args, **kwargs):
        user_id = kwargs.get('pk')

        try:
            instance = self.get_object()
            instance.is_archived = True
            instance.save()
            
            return Response({"message": "User archived successfully."}, status=status.HTTP_200_OK)
            
        except FloraUser.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The user with ID {user_id} does not exist.'
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
