# BXC Sandbox — React + Django

This repository is an original clean-room implementation based on user-supplied screenshots and requested interaction patterns. It does **not** copy third-party source bundles and intentionally keeps financial activity in a sandbox/demo mode.

## Included

- Existing login and email/phone registration flow
- 10-language selector
- Post-login home layout inspired by the supplied BXC screenshots
- Market tabs: Crypto, Forex, Stocks, Futures
- Market detail pages with an original SVG candlestick demo chart
- Crypto ETF watchlist-style page
- Loan calculator demo + account verification request
- Financial products visual demo
- Account page with account code, zero-value sandbox balances, demo order history, settings, password change and logout
- Staff dashboard with user search, suspend/restore, verify/unverify, and overview KPIs
- Demo orders stored in PostgreSQL/SQLite as simulations only

## Safety boundary

The project does not implement real-money deposits, withdrawals, brokerage execution, lending, promised investment returns, or admin balance manipulation. Buttons that resemble those flows are demo-only and clearly explain that no real funds move.

## Important security note

Never commit passwords, SMTP credentials, Render keys, Twilio keys, `DATABASE_URL`, or Django `SECRET_KEY`. Use Render Environment Variables.

## Update an existing deployment

```powershell
cd "C:\Users\Piment Rouge\Documents\dxc-platform-complete"
$git = "C:\Program Files\Git\cmd\git.exe"
& $git status
& $git add -A
& $git diff --cached --check
& $git commit -m "Add BXC post-login sandbox interface"
& $git push origin main
```

Render should auto-deploy `main` when Auto Deploy is enabled.

## Database migration

The update adds migration `accounts.0002_profile_demo_fields_demoorder`. The existing `build.sh` runs `python manage.py migrate` during deployment.

## Admin

Staff/superusers can open `/admin` for the custom dashboard and `/django-admin/` for Django's technical administration.

Rotate any passwords that have ever been pasted into chat, logs, screenshots, or public issues before continuing production deployment.
