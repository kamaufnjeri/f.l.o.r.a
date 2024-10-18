from balance_buddy.settings import frontend_url, EMAIL_HOST_USER
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.mail import send_mail
from .token import token_uid
from journals.models import OrganisationMembership, FloraUser
from django.db import transaction
from django.utils import timezone


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

    def send_invite_emails(self, invite_emails, user):
        with transaction.atomic():
            if invite_emails and user:
                for email in invite_emails:
                    try:

                        email_user = FloraUser.objects.get(email=email)
                    except FloraUser.DoesNotExist:
                        email_user = None
                    try:
                        organisation_membership = OrganisationMembership.objects.get(organisation=user.current_org, user=email_user)
                    except OrganisationMembership.DoesNotExist:
                        organisation_membership = OrganisationMembership.objects.create(organisation=user.current_org, user=email_user, role='staff')
                    
                    uid64 = token_uid.encode_uid(organisation_membership)
                    invite_link = f"{frontend_url}/accept-invite/{uid64}"

                    subject = 'Join Our Organization'
                    html_message = render_to_string('email/invite_email.html', {
                        'invite_link': invite_link,
                        "user_name": f"{user.first_name} {user.last_name}", 
                        "organisation_name": user.current_org.org_name
                    })
                    plain_message = strip_tags(html_message)
                    created_at = timezone.now()
                    invite_data = {
                        "user_email": email,
                        "token": uid64,
                        "created_at": created_at.isoformat()
                    }
                    if organisation_membership.is_active:
                        raise ValueError(f'{email} already in {user.current_org.org_name}')
                    send_mail(
                        subject,
                        plain_message,
                        EMAIL_HOST_USER,
                        [email],
                        html_message=html_message,
                        fail_silently=False,
                    )

                    organisation_membership.invite_data = invite_data
                    organisation_membership.save()

send_email = SendEmail()