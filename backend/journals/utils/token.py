from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes

class TokenUid:
    def generate_token(self, user):
        token = default_token_generator.make_token(user)
        return token
    def confirm_token(self, user, token):
        return default_token_generator.check_token(user, token)
    def encode_uid(self, user):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        return uid
    def decode_uid(self, uidb64):
        uid = urlsafe_base64_decode(uidb64).decode()
        return uid

token_uid = TokenUid()