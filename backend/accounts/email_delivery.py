import logging
import smtplib
import socket
from dataclasses import dataclass

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection

logger = logging.getLogger(__name__)


@dataclass
class DeliveryError(Exception):
    public_message: str
    code: str = 'email_delivery_failed'

    def __str__(self):
        return self.public_message


def _gmail_password(password: str) -> str:
    """Google app passwords are often copied with spaces. Normalize them safely."""
    host = str(getattr(settings, 'EMAIL_HOST', '') or '').lower()
    if host in {'smtp.gmail.com', 'smtp.googlemail.com'}:
        return ''.join(str(password or '').split())
    return str(password or '')


def email_configuration_status():
    host = str(getattr(settings, 'EMAIL_HOST', '') or '').strip()
    user = str(getattr(settings, 'EMAIL_HOST_USER', '') or '').strip()
    password = _gmail_password(getattr(settings, 'EMAIL_HOST_PASSWORD', ''))
    from_email = str(getattr(settings, 'DEFAULT_FROM_EMAIL', '') or '').strip()
    backend = str(getattr(settings, 'EMAIL_BACKEND', '') or '')
    return {
        'backend': backend,
        'host': host,
        'port': int(getattr(settings, 'EMAIL_PORT', 587) or 587),
        'tls': bool(getattr(settings, 'EMAIL_USE_TLS', False)),
        'ssl': bool(getattr(settings, 'EMAIL_USE_SSL', False)),
        'user_configured': bool(user),
        'password_configured': bool(password),
        'from_configured': bool(from_email),
    }


def validate_email_configuration():
    if settings.DEBUG and 'console.EmailBackend' in str(getattr(settings, 'EMAIL_BACKEND', '')):
        return

    status = email_configuration_status()
    if not status['host']:
        raise DeliveryError('Email delivery is not configured yet.', 'email_host_missing')
    if not status['user_configured']:
        raise DeliveryError('The sender email account is not configured on the server.', 'email_user_missing')
    if not status['password_configured']:
        raise DeliveryError('The sender email app password is not configured on the server.', 'email_password_missing')
    if status['tls'] and status['ssl']:
        raise DeliveryError('Email TLS/SSL configuration is invalid.', 'email_security_conflict')


def _classify_exception(exc: Exception) -> DeliveryError:
    if isinstance(exc, smtplib.SMTPAuthenticationError):
        return DeliveryError(
            'Gmail rejected the sender credentials. Use a Google App Password with 2-Step Verification enabled.',
            'smtp_authentication_failed',
        )
    if isinstance(exc, (socket.timeout, TimeoutError)):
        return DeliveryError(
            'The email server connection timed out. Please try again shortly.',
            'smtp_timeout',
        )
    if isinstance(exc, (smtplib.SMTPConnectError, ConnectionRefusedError)):
        return DeliveryError(
            'The application could not connect to the email server.',
            'smtp_connection_failed',
        )
    if isinstance(exc, smtplib.SMTPRecipientsRefused):
        return DeliveryError('The destination email address was rejected by the mail server.', 'recipient_rejected')
    if isinstance(exc, smtplib.SMTPSenderRefused):
        return DeliveryError('The configured sender address was rejected by the mail server.', 'sender_rejected')
    if isinstance(exc, smtplib.SMTPException):
        return DeliveryError('The email server refused the verification message.', 'smtp_error')
    if isinstance(exc, OSError):
        return DeliveryError('The application could not reach the email service.', 'email_network_error')
    return DeliveryError('Unable to send the verification code right now. Please try again.', 'email_delivery_failed')


def send_verification_email(destination: str, code: str, ttl_seconds: int):
    validate_email_configuration()

    subject = 'Your BXC verification code'
    text = (
        f'Your BXC verification code is {code}.\n\n'
        f'This code is valid for {ttl_seconds} seconds.\n'
        'If you did not request this code, you can ignore this email.'
    )
    html = f'''\
<!doctype html>
<html>
  <body style="font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;color:#111">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:28px">
      <div style="font-size:28px;font-weight:800;margin-bottom:18px">BXC</div>
      <h2 style="margin:0 0 10px">Verification code</h2>
      <p style="margin:0 0 18px;color:#555">Use this code to finish creating your BXC account.</p>
      <div style="font-size:34px;font-weight:800;letter-spacing:8px;background:#fff4cf;border-radius:12px;padding:18px;text-align:center">{code}</div>
      <p style="margin:18px 0 0;color:#666">This code expires in {ttl_seconds} seconds.</p>
      <p style="margin:8px 0 0;color:#888;font-size:13px">If you did not request this code, you can ignore this message.</p>
    </div>
  </body>
</html>'''

    password = _gmail_password(getattr(settings, 'EMAIL_HOST_PASSWORD', ''))
    try:
        connection = get_connection(
            backend=getattr(settings, 'EMAIL_BACKEND', None),
            host=getattr(settings, 'EMAIL_HOST', None),
            port=getattr(settings, 'EMAIL_PORT', None),
            username=getattr(settings, 'EMAIL_HOST_USER', None),
            password=password,
            use_tls=getattr(settings, 'EMAIL_USE_TLS', None),
            use_ssl=getattr(settings, 'EMAIL_USE_SSL', None),
            timeout=getattr(settings, 'EMAIL_TIMEOUT', None),
            fail_silently=False,
        )
        message = EmailMultiAlternatives(
            subject=subject,
            body=text,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
            to=[destination],
            connection=connection,
        )
        message.attach_alternative(html, 'text/html')
        sent = message.send(fail_silently=False)
        if sent != 1:
            raise DeliveryError('The email service did not confirm delivery of the verification message.', 'email_not_accepted')
        return True
    except DeliveryError:
        raise
    except Exception as exc:
        logger.exception('BXC verification email delivery failed: %s', exc.__class__.__name__)
        raise _classify_exception(exc) from exc
