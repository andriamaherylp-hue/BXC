#!/usr/bin/env bash
set -o errexit

cd frontend
npm install --no-audit --no-fund
npm run build

cd ../backend
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python manage.py collectstatic --noinput
