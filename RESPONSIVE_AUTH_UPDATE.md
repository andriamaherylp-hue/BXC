# BXC responsive + username/password update

## Authentication

Public accounts use only **username + password**. Sign-up creates the Django user immediately in PostgreSQL, opens the session, and redirects to Home. There is no Gmail/SMS verification-code step in the active registration or login routes.

## Responsive behavior

- Desktop navigation is preserved on large screens.
- On phones/tablets, navigation becomes a touch-friendly drawer with Home, Market, Crypto ETF, Loan, Financial, Account, Admin (staff only), Language and Log out.
- Authentication fields use 16px+ input text on mobile to avoid unwanted iOS Safari zoom.
- Safe-area insets are respected on iPhone.
- Account actions, order tabs, admin tables, dialogs and footer adapt to narrow screens without horizontal page overflow.
- Dialogs use `100dvh`-aware sizing and internal scrolling.

## Market assets

The supplied BTC, ETH, SOL, DOGE, XRP and LTC PNG artwork is stored under `frontend/src/assets/coins/` and rendered by `MarketIcon`.

## Safety boundary

The existing funding, balance, order and administration workflows remain sandbox/demo functionality. Real wallet token-approval or automatic asset-transfer code is not wired into this build.
