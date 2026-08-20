# BXC capture-aligned interface update

This build starts from the supplied `BXC-main.zip` and keeps the existing username/password authentication, PostgreSQL, staff dashboard, demo funding requests, admin controls, and sandbox-only financial boundary.

## Added / updated
- All files from the supplied `img(1).zip` are included under `frontend/public/bxc-source-images/`.
- Curated BXC/market assets are used by the React interface.
- Home hero uses the supplied phone artwork.
- Crypto / Forex / Stocks / Futures use supplied icons where available.
- Account Transfer works between sandbox USDT account balances.
- Flash Exchange works only with sandbox asset balances.
- Deposit & Withdrawal opens a dedicated sandbox balance page with demo references and non-scannable reference pattern.
- Account Verification opens the capture-aligned profile dialog and submits the existing admin-review request.
- Invite Friends and Help Center pages were added.
- Market detail includes Call/Long and Put/Short demo directions.
- Responsive navigation and layouts were added for iPhone, Android and desktop.

## Database migration
A new migration is included:
`accounts/migrations/0005_sandbox_asset_balance_and_demo_direction.py`

On Render the existing `predeploy.sh` already runs:
`python manage.py migrate --noinput`

## Safety boundary
The project remains a sandbox. Wallet-approval code that could authorize real ERC20/TRC20 spending is not wired into the application. Deposit/withdrawal references are demo references, and no real cryptocurrency is transferred.
