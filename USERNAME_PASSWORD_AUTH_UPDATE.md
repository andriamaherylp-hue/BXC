# BXC username/password authentication

This version removes the Gmail/SMS verification flow from personal-account registration.

## User registration

The public registration form contains:

- Username
- Password

When the user clicks **Sign-up**, Django validates the fields, creates the account in PostgreSQL, starts the session, and returns the authenticated user immediately. There is no verification-code endpoint in the public routes.

## User login

The public login form uses:

- Username
- Password

Staff and superusers use the same login form with their staff username.

## Database

No new migration is required for this authentication change. Existing PostgreSQL data is preserved. The old `VerificationCode` table may remain in the database for backward compatibility but is no longer used by the public authentication flow.

## Render

Gmail SMTP and SMS variables are no longer required for registration/login. They may be removed from the `www-edcsxc` service Environment settings if they are not used elsewhere.
