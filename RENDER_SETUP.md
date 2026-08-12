# BXC — Render + PostgreSQL setup

This project runs React/Vite and Django in one Render Web Service. PostgreSQL is a separate Render database named `bxc-db`.

## 1. Create `bxc-db`

In the Render workspace:

1. **New → Postgres**.
2. Name: `bxc-db`.
3. Database: `bxc`.
4. User: `bxc` (or let Render generate it).
5. Region: use the **same region as `www-edcsxc`** (for example Oregon).
6. Choose the database plan you want and create it.
7. Wait for **Available**.
8. Open **Connect** and copy the **Internal Database URL**.

Do not paste this URL into source code or GitHub.

## 2. Connect `www-edcsxc` to `bxc-db`

Open **www-edcsxc → Environment** and add:

- `DATABASE_URL` = Internal Database URL of `bxc-db`
- `SECRET_KEY` = Generate
- `DEBUG` = `0`
- `WEB_CONCURRENCY` = `2`
- `VERIFICATION_CODE_TTL_SECONDS` = `60`
- `VERIFICATION_RESEND_SECONDS` = `60`
- `SMS_BACKEND` = `console`

`RENDER_EXTERNAL_HOSTNAME` is supplied automatically by Render. The Django settings automatically add it to `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`.

## 3. Gmail verification settings

For real email codes, add:

- `EMAIL_BACKEND` = `django.core.mail.backends.smtp.EmailBackend`
- `EMAIL_HOST` = `smtp.gmail.com`
- `EMAIL_PORT` = `587`
- `EMAIL_HOST_USER` = the Gmail sender address
- `EMAIL_HOST_PASSWORD` = a Google **App Password**
- `EMAIL_USE_TLS` = `1`
- `EMAIL_USE_SSL` = `0`
- `EMAIL_TIMEOUT` = `20`
- `DEFAULT_FROM_EMAIL` = the same Gmail sender address

Never store the Gmail password/App Password in GitHub.

## 4. Web Service commands

Keep the repo root as the Root Directory.

**Language:** Python 3

**Build Command:**

```bash
bash ./build.sh
```

**Pre-Deploy Command (recommended on a paid Render Web Service):**

```bash
bash ./predeploy.sh
```

**Start Command:**

```bash
cd backend && gunicorn dxc_project.wsgi:application --bind 0.0.0.0:$PORT --workers ${WEB_CONCURRENCY:-2} --timeout 120
```

**Health Check Path:**

```text
/health/
```

The internal Django module is still named `dxc_project`; this does not change the public BXC service name.

## 5. Create the BXC superuser in PostgreSQL

Recommended method: configure these **secret Render environment variables**:

- `BXC_ADMIN_USERNAME` = `grandiravecmoi`
- `BXC_ADMIN_EMAIL` = your private admin email
- `BXC_ADMIN_PASSWORD` = a **new strong password that has never been posted publicly**
- `BXC_ADMIN_RESET_PASSWORD` = `0`

Then run in Render Shell:

```bash
cd ~/project/src/backend
python manage.py diagnose_database
python manage.py ensure_superuser
```

The first command confirms that the service is using `bxc-db`. The second creates the superuser if it does not exist. On later deploys, the password is preserved unless `BXC_ADMIN_RESET_PASSWORD=1`.

You can alternatively run:

```bash
python manage.py createsuperuser
```

## 6. Test email delivery

After deployment:

```bash
cd ~/project/src/backend
python manage.py diagnose_email
python manage.py diagnose_email --to your-test-address@gmail.com
```

The diagnostic does not print the configured email password.

## 7. URLs

- App: `https://www-edcsxc.onrender.com/`
- Custom admin dashboard: `https://www-edcsxc.onrender.com/admin`
- Django admin: `https://www-edcsxc.onrender.com/django-admin/`
- Health check: `https://www-edcsxc.onrender.com/health/`

## 8. Important production behavior

When `DEBUG=0`, this project intentionally **requires `DATABASE_URL`**. It will not silently fall back to temporary SQLite on Render. This prevents account loss during redeploys.

Financial-looking pages in this codebase remain **sandbox/demo functionality**. They do not move real customer funds.
