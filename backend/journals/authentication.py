from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

class CookieJWTAuthentication(JWTAuthentication):

    def authenticate(self, request):
        access_token = request.COOKIES.get("accessToken")
        refresh_token = request.COOKIES.get("refreshToken")

        if not access_token:
            return None

        try:
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)

        except InvalidToken:
            if not refresh_token:
                raise AuthenticationFailed("Invalid token")

            try:
                refresh = RefreshToken(refresh_token)

                new_access = str(refresh.access_token)
                

                request._new_access_token = new_access

                validated_token = self.get_validated_token(new_access)
                user = self.get_user(validated_token)

            except TokenError:
                raise AuthenticationFailed('Session Expired')
            except Exception:
                raise AuthenticationFailed('Invalid Token')

        return (user, validated_token)