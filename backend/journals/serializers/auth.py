from journals.models import FloraUser
from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import authenticate


class ForgotPasswordSerializeer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate(self, data):
        email = data.get('email')
        if not email:
            raise serializers.ValidationError("Email is required")
        try:
            user = FloraUser.objects.get(email=email)
        except FloraUser.DoesNotExist:
            raise serializers.ValidationError(f"User email {email} doesn't exist")
        data['user'] = user
        return data
    
class ResetPasswordSerializer(serializers.Serializer):
    confirm_password = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        if not confirm_password and password:
            raise serializers.ValidationError("Both password and confirm passwords required")
        
        if confirm_password != password:
            raise serializers.ValidationError({"password": "Password and confirm password do not match."})
        
        return data

    




class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")

        try:
            user = FloraUser.objects.get(email=email)
        except FloraUser.DoesNotExist:
            raise serializers.ValidationError(f"User email {email} doesn't exist")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid password.")
        
        data['user'] = user
        return data



class RegisterSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    confirm_password = serializers.CharField(write_only=True)
    

    class Meta:
        model = FloraUser
        fields = ["id", "first_name", "last_name", "phone_number", "email", "password", "confirm_password"]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data.get("password") != data.get("confirm_password"):
            raise serializers.ValidationError({"password": "Password and confirm password do not match."})
        return data

    def create(self, validated_data):
        try:
            with transaction.atomic():
                password = validated_data.pop('password')
                validated_data.pop("confirm_password")
                new_user = FloraUser.objects.create(**validated_data)
                new_user.set_password(password)
                new_user.save()
                return new_user
        except Exception as e:
            raise Exception(str(e))
        


