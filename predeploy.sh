#!/usr/bin/env bash
set -o errexit

cd backend
python manage.py migrate --noinput
python manage.py diagnose_database

if [[ -n "${BXC_ADMIN_USERNAME:-}" && -n "${BXC_ADMIN_PASSWORD:-}" ]]; then
  python manage.py ensure_superuser
fi
