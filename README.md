# DXC Platform — React + Django + PostgreSQL

This repository is a clean-room implementation inspired by the **layout and interaction patterns** in the reference screenshots, while using original branding and original code.

It includes:
- React/Vite frontend
- Django backend
- PostgreSQL support
- Username/password login
- Registration by email or phone
- Verification codes by email or SMS
- Language menu: English, 日本語, 한국어, Deutsch, français, Italiano, Español, العربية, 繁體中文, 简体中文
- Staff-only account administration page
- Responsive post-login landing page
- Render blueprint (`render.yaml`)

## Important branding note
The project intentionally uses the original placeholder brand **DXC** instead of copying a third-party financial site's logo or identity. If you own or are authorized to use another brand, update `VITE_APP_NAME` and your own authorized assets.

## Local setup

### 1) Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 2) Frontend
Open another terminal:
```powershell
cd frontend
npm install
npm run dev
```

Vite runs on http://localhost:5173 and proxies `/api` and `/django-admin` to Django on port 8000.

## Verification codes

### Development
- Email codes are printed to the Django console.
- SMS codes are printed to the Django console when `SMS_BACKEND=console`.
- In `DEBUG=1`, the API also returns `dev_code` so the frontend can display it for local testing.

### Production email
Configure SMTP variables in Render:
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `EMAIL_USE_TLS=1`
- `DEFAULT_FROM_EMAIL`

### Production SMS with Twilio
Set:
- `SMS_BACKEND=twilio`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

## Render
Create a new GitHub repository for this project, push it, then use the included `render.yaml` as a Blueprint. It creates:
- `dxc-web`
- `dxc-db`

The generated database connection is injected into `DATABASE_URL`.

## Build model
The Vite build is written into `backend/static/frontend`. Django + WhiteNoise serve the React bundle, so production requires only **one web service plus one PostgreSQL database**.
