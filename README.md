# BXC Sandbox Platform

React/Vite frontend + Django backend + PostgreSQL deployment for Render.

## Main features

- Immediate account registration with **username + password**.
- Username/password login with Django sessions.
- No Gmail verification code and no phone/SMS registration flow.
- Multilingual interface.
- Post-login Home, Markets, Crypto ETF, Loan, Financial, Account and demo-order flows.
- Staff-only BXC admin dashboard for account management and sandbox controls.
- Django admin at `/django-admin/`.
- PostgreSQL health endpoint at `/health/`.
- Superuser bootstrap command for Render.

Financial operations are sandbox/demo only; there is no real-money custody, deposit, withdrawal, lending or investment execution in this project.

## Registration flow

1. Open `/register`.
2. Enter a username.
3. Enter the password.
4. Click **Sign-up**.
5. Django validates the fields, creates the user in PostgreSQL, starts the authenticated session and returns the user immediately.
6. React redirects the new user to `/home`.

No verification-code endpoint is used by the public registration flow.

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

When `DEBUG=1` and `DATABASE_URL` is absent, local SQLite is used. PostgreSQL is required when `DEBUG=0`.

## Render

See [`RENDER_SETUP.md`](./RENDER_SETUP.md) for the complete `bxc-db`, superuser, build and deployment procedure.

## BXC administration expansion

This build includes a Digifinex-inspired BXC administration workspace adapted to the BXC sandbox model:

- create client accounts;
- add approved **sandbox** deposits;
- adjust per-account **sandbox** balances;
- VIP1–VIP4 assignment/removal;
- suspend/restore account access;
- enable/disable **sandbox** withdrawal requests;
- verify/unverify accounts;
- review pending sandbox deposits and withdrawals;
- close simulated market orders as win/loss/cancelled with a demo P/L and close price;
- append-only admin audit trail and sandbox transaction history.

These controls do not transfer cryptocurrency, create real loans, approve real withdrawals, promise investment returns, or settle brokerage trades. They operate only on demonstration balances and simulated records stored in BXC PostgreSQL.

The screenshots supplied by the project owner for visual comparison are preserved under `reference_images/`. They are not served by the application.
