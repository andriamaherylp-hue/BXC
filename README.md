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

## BXC administration expansion

This build adds a Digifinex-inspired BXC administration workspace adapted to the BXC sandbox model:

- create client accounts;
- add approved **sandbox** deposits;
- adjust per-account **sandbox** balances;
- VIP1–VIP4 assignment/removal;
- suspend/restore account access;
- enable/disable **sandbox** withdrawal requests;
- verify/unverify accounts;
- review pending sandbox deposits and withdrawals;
- close simulated market orders as win/loss/cancelled with a demo P/L and close price;
- append-only admin audit trail and sandbox transaction history;
- PostgreSQL migration `0004_admin_sandbox_controls.py`.

These controls do not transfer cryptocurrency, create real loans, approve real withdrawals, promise investment returns, or settle brokerage trades. They operate only on the demonstration balances and simulated records stored in BXC PostgreSQL.

The screenshots supplied by the project owner for visual comparison are preserved under `reference_images/`. They are not served by the application.
