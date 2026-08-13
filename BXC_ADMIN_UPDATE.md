# BXC admin sandbox expansion

This update adds the BXC administration operations requested from the existing Digifinex admin workflow, adapted to the BXC sandbox environment.

## New staff dashboard capabilities

- create a client account;
- add an approved sandbox deposit to Trading / Spot / Finance;
- positive or negative sandbox balance adjustment with a reason;
- VIP1–VIP4 badge assignment and removal;
- suspend / restore account access;
- enable / disable sandbox withdrawal requests;
- verify / unverify accounts;
- delete non-staff sandbox accounts;
- approve / reject pending sandbox deposit and withdrawal requests;
- view and close open demo trade orders as Win / Loss / Cancelled;
- record demo close price and demo P/L;
- immutable-style audit history and sandbox transaction history in PostgreSQL.

All balance and funding controls are sandbox-only. No real cryptocurrency or fiat movement is implemented.

## Deploy

After copying the update into the repository:

```powershell
$git = "C:\Program Files\Git\cmd\git.exe"
& $git status
& $git add -A
& $git diff --cached --check
& $git commit -m "Expand BXC sandbox admin dashboard"
& $git push origin main
```

Render should then run the existing pre-deploy command. Migration `0004_admin_sandbox_controls.py` must be applied:

```bash
cd ~/project/src/backend
python manage.py migrate --noinput
python manage.py check
python manage.py diagnose_database
```

No new environment variable is required specifically for these sandbox admin controls.
