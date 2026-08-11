# BXC email verification on Render

The registration endpoints are intentionally CSRF-exempt because they are anonymous, one-time registration endpoints. Other authenticated POST endpoints continue to use Django CSRF protection.

## Required Render environment variables

Set these on the **www-edcsxc** Web Service:

- `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_HOST_USER=<sender Gmail address>`
- `EMAIL_HOST_PASSWORD=<Google App Password>`
- `EMAIL_USE_TLS=1`
- `EMAIL_USE_SSL=0`
- `EMAIL_TIMEOUT=20`
- `DEFAULT_FROM_EMAIL=<same sender Gmail address>`
- `VERIFICATION_CODE_TTL_SECONDS=60`
- `VERIFICATION_RESEND_SECONDS=60`

For Gmail, enable 2-Step Verification on the sender account and create a Google App Password. Do not use the normal Gmail password.

## Render SMTP limitation

Render Free web services cannot make outbound SMTP connections on ports 25, 465 or 587. Use a paid web-service instance (for example Starter) for Gmail SMTP, or use an HTTPS email provider instead.

## Diagnose from Render Shell

After deployment:

```bash
cd backend
python manage.py diagnose_email
```

This confirms whether host/user/password/TLS are configured without printing secrets.

Then send a real test:

```bash
python manage.py diagnose_email --to your-test-address@gmail.com
```

If Gmail credentials are wrong, the command reports `smtp_authentication_failed`.
