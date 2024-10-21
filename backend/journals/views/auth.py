from rest_framework import generics, status
from rest_framework.response import Response
from journals.utils import flatten_errors, send_email, token_uid
from journals.models import FloraUser
from journals.serializers import RegisterSerializer, LoginSerializer, ForgotPasswordSerializeer, ResetPasswordSerializer, FloraUserSerializer
from django.shortcuts import get_object_or_404
from dotenv import load_dotenv
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
import os
from balance_buddy.settings import frontend_url
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken


load_dotenv()


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"detail": "Logout successful."}, status=status.HTTP_200_OK)
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
    queryset = FloraUser.objects.all()
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data['user']

            if not user.is_verified:
                try:
                    send_email.sent_email_confirmation_message(user)
                    return Response({ "error": "Unverified user", "details": "Check email to verify your account"}, status=status.HTTP_403_FORBIDDEN)
                except Exception as email_exception:
                    print(f"Email Sending Error: {email_exception}") 
                    return Response({
                        'error': 'Email sending failed',
                        'details': str(email_exception)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
               
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            user_serializer = FloraUserSerializer(user)
            data = user_serializer.data


            return Response({
                'refresh': str(refresh),
                'access': str(access),
                'user': data
            }, status=status.HTTP_200_OK)

class RegisterAPIVew(generics.CreateAPIView):
    queryset = FloraUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
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