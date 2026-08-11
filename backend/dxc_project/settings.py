from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('SECRET_KEY','dev-only-change-me')
DEBUG = os.getenv('DEBUG','1') == '1'
ALLOWED_HOSTS = [x.strip() for x in os.getenv('ALLOWED_HOSTS','127.0.0.1,localhost').split(',') if x.strip()]
CSRF_TRUSTED_ORIGINS = [x.strip() for x in os.getenv('CSRF_TRUSTED_ORIGINS','http://localhost:5173,http://127.0.0.1:5173').split(',') if x.strip()]

INSTALLED_APPS = [
    'django.contrib.admin','django.contrib.auth','django.contrib.contenttypes','django.contrib.sessions','django.contrib.messages','django.contrib.staticfiles',
    'accounts.apps.AccountsConfig',
]
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware','whitenoise.middleware.WhiteNoiseMiddleware','django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware','django.middleware.csrf.CsrfViewMiddleware','django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware','django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF='dxc_project.urls'
TEMPLATES=[{'BACKEND':'django.template.backends.django.DjangoTemplates','DIRS':[BASE_DIR/'static'/'frontend'],'APP_DIRS':True,'OPTIONS':{'context_processors':['django.template.context_processors.request','django.contrib.auth.context_processors.auth','django.contrib.messages.context_processors.messages']}}]
WSGI_APPLICATION='dxc_project.wsgi.application'
DATABASES={'default':dj_database_url.config(default=os.getenv('DATABASE_URL',f'sqlite:///{BASE_DIR / "db.sqlite3"}'),conn_max_age=600,conn_health_checks=True)}
AUTH_PASSWORD_VALIDATORS=[{'NAME':'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},{'NAME':'django.contrib.auth.password_validation.MinimumLengthValidator'},{'NAME':'django.contrib.auth.password_validation.CommonPasswordValidator'},{'NAME':'django.contrib.auth.password_validation.NumericPasswordValidator'}]
LANGUAGE_CODE='en-us'; TIME_ZONE='UTC'; USE_I18N=True; USE_TZ=True
STATIC_URL='/static/'; STATIC_ROOT=BASE_DIR/'staticfiles'; STATICFILES_DIRS=[BASE_DIR/'static']
STORAGES={'staticfiles':{'BACKEND':'whitenoise.storage.CompressedManifestStaticFilesStorage'}}
DEFAULT_AUTO_FIELD='django.db.models.BigAutoField'
SESSION_COOKIE_HTTPONLY=True; SESSION_COOKIE_SAMESITE='Lax'; CSRF_COOKIE_SAMESITE='Lax'
if not DEBUG:
    SESSION_COOKIE_SECURE=True; CSRF_COOKIE_SECURE=True; SECURE_PROXY_SSL_HEADER=('HTTP_X_FORWARDED_PROTO','https')

EMAIL_HOST=os.getenv('EMAIL_HOST','')
if DEBUG and not EMAIL_HOST:
    EMAIL_BACKEND='django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend'
EMAIL_PORT=int(os.getenv('EMAIL_PORT','587'))
EMAIL_HOST_USER=os.getenv('EMAIL_HOST_USER','')
EMAIL_HOST_PASSWORD=os.getenv('EMAIL_HOST_PASSWORD','')
EMAIL_USE_TLS=os.getenv('EMAIL_USE_TLS','1')=='1'
EMAIL_USE_SSL=os.getenv('EMAIL_USE_SSL','0')=='1'
EMAIL_TIMEOUT=int(os.getenv('EMAIL_TIMEOUT','15'))
DEFAULT_FROM_EMAIL=os.getenv('DEFAULT_FROM_EMAIL',EMAIL_HOST_USER or 'no-reply@example.com')

VERIFICATION_CODE_TTL_SECONDS=int(os.getenv('VERIFICATION_CODE_TTL_SECONDS','60'))
VERIFICATION_RESEND_SECONDS=int(os.getenv('VERIFICATION_RESEND_SECONDS','60'))
SMS_BACKEND=os.getenv('SMS_BACKEND','console')
