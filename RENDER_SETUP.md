# BXC — Render + PostgreSQL setup

This project runs React/Vite and Django in one Render Web Service. PostgreSQL is a separate Render database named `bxc-db`.

## 1. Create `bxc-db`

In the Render workspace:

1. **New → Postgres**.
2. Name: `bxc-db`.
3. Database: `bxc`.
4. User: `bxc` (or let Render generate it).
5. Region: use the **same region as `www-edcsxc`**.
6. Create the database and wait for **Available**.
7. Open **Connect** and copy the **Internal Database URL**.

Do not paste this URL into source code or GitHub.

## 2. Connect `www-edcsxc` to `bxc-db`

Open **www-edcsxc → Environment** and configure:

- `DATABASE_URL` = Internal Database URL of `bxc-db`
- `SECRET_KEY` = Generate
- `DEBUG` = `0`
- `WEB_CONCURRENCY` = `2`
- `DB_CONN_MAX_AGE` = `600`
- `SESSION_COOKIE_AGE` = `28800`
- `LOG_LEVEL` = `INFO`

If you set the host variables manually:

- `ALLOWED_HOSTS` = `www-edcsxc.onrender.com`
- `CSRF_TRUSTED_ORIGINS` = `https://www-edcsxc.onrender.com`

`RENDER_EXTERNAL_HOSTNAME` is also supplied automatically by Render and is added by the Django settings.

Gmail SMTP, verification-code and SMS variables are **not required** for account registration or login in this version.

## 3. Authentication behavior

Personal users and staff accounts use the same public login form:

- Username
- Password

Public registration uses:

- Username
- Password

Clicking **Sign-up** creates the account immediately in PostgreSQL and starts the login session. No email/SMS code is sent.

## 4. Web Service commands

Keep the repository root as the Root Directory.

**Language:** Python 3

**Build Command:**

```bash
bash ./build.sh
```

**Pre-Deploy Command:**

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

The internal Django module remains named `dxc_project`; this does not change the public BXC service name.

## 5. Create the BXC superuser in PostgreSQL

Configure these secret Render environment variables:

- `BXC_ADMIN_USERNAME` = `grandiravecmoi`
- `BXC_ADMIN_EMAIL` = your private admin email
- `BXC_ADMIN_PASSWORD` = a new strong private password
- `BXC_ADMIN_RESET_PASSWORD` = `0`

Then run in Render Shell:

```bash
cd ~/project/src/backend
python manage.py diagnose_database
python manage.py ensure_superuser
```

You can alternatively run:

```bash
python manage.py createsuperuser
```

## 6. Validate the deployment

In Render Shell:

```bash
cd ~/project/src/backend
python manage.py check
python manage.py migrate --noinput
python manage.py diagnose_database
python manage.py ensure_superuser
```

Then test:

1. Create a normal account with username + password.
2. Confirm the account appears in PostgreSQL/admin.
3. Log out.
4. Log in again with the same username + password.
5. Log in with the superuser and open `/admin`.

## 7. URLs

- App: `https://www-edcsxc.onrender.com/`
- Custom admin dashboard: `https://www-edcsxc.onrender.com/admin`
- Django admin: `https://www-edcsxc.onrender.com/django-admin/`
- Health check: `https://www-edcsxc.onrender.com/health/`

## 8. Production behavior

When `DEBUG=0`, `DATABASE_URL` is required. The service does not silently fall back to temporary SQLite on Render.

Financial-looking pages remain sandbox/demo functionality and do not move real customer funds.
