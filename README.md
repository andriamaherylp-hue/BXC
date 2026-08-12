# BXC Sandbox Platform

React/Vite frontend + Django backend + PostgreSQL-ready deployment for Render.

## Main features

- Username/password login with Django sessions.
- Account registration by email or international phone number.
- Six-digit verification codes with a 60-second expiry/resend window.
- Gmail SMTP support and a `diagnose_email` command.
- Registration verification state stored in PostgreSQL.
- Multilingual interface.
- Post-login Home, Markets, Crypto ETF, Loan, Financial, Account and demo-order flows.
- Staff-only BXC admin dashboard for account search, suspension/restoration and KYC/demo verification status.
- Django admin at `/django-admin/`.
- PostgreSQL health endpoint at `/health/`.
- Superuser bootstrap command for Render.

Financial operations are sandbox/demo only; there is no real-money custody, deposit, withdrawal, lending or investment execution in this project.

## Local development

Backend:

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

When `DEBUG=1` and no SMTP host is configured, email messages use Django's console backend. When `DEBUG=1` and `DATABASE_URL` is absent, local SQLite is used.

## Render

See [`RENDER_SETUP.md`](./RENDER_SETUP.md) for the complete `bxc-db`, environment-variable, Gmail, superuser, build and deployment procedure.
