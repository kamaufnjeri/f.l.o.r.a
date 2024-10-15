from balance_buddy.settings import frontend_url, EMAIL_HOST_USER
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.mail import send_mail
from .token import token_uid

class SendEmail:
    def sent_email_confirmation_message(self, user):
        token = token_uid.generate_token(user)
        uid = token_uid.encode_uid(user)
        confirmation_link = f"{frontend_url}/confirm-email/{uid}/{token}"
        subject = 'Confirm Your Email'
        html_message = render_to_string('email/confirmation_email.html', {'confirmation_link': confirmation_link})
        plain_message = strip_tags(html_message) 
        send_mail(
            subject,
            plain_message,
            EMAIL_HOST_USER,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )

    def send_reset_password_email(self, user):
        token = token_uid.generate_token(user)
        uid = token_uid.encode_uid(user)
        reset_link = f"{frontend_url}/reset-password/{uid}/{token}"
        subject = 'Reset Password'
        html_message = render_to_string('email/reset_password_email.html', {'reset_link': reset_link})
        plain_message = strip_tags(html_message)
        send_mail(
            subject,
            plain_message,
            EMAIL_HOST_USER,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )

send_email = SendEmail()