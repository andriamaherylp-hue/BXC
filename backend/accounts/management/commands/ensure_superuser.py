import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Create the BXC superuser from environment variables, or ensure an existing account remains staff.'

    def handle(self, *args, **options):
        username = os.getenv('BXC_ADMIN_USERNAME', '').strip()
        email = os.getenv('BXC_ADMIN_EMAIL', '').strip()
        password = os.getenv('BXC_ADMIN_PASSWORD', '')
        reset_password = os.getenv('BXC_ADMIN_RESET_PASSWORD', '0').strip().lower() in {'1', 'true', 'yes', 'on'}

        if not username:
            raise CommandError('BXC_ADMIN_USERNAME is not set.')
        if not password:
            raise CommandError('BXC_ADMIN_PASSWORD is not set.')

        User = get_user_model()
        user, created = User.objects.get_or_create(username=username, defaults={'email': email})

        changed_fields = []
        if email and user.email != email:
            user.email = email
            changed_fields.append('email')
        if not user.is_staff:
            user.is_staff = True
            changed_fields.append('is_staff')
        if not user.is_superuser:
            user.is_superuser = True
            changed_fields.append('is_superuser')
        if not user.is_active:
            user.is_active = True
            changed_fields.append('is_active')

        if created or reset_password:
            user.set_password(password)
            changed_fields.append('password')

        if changed_fields:
            user.save()

        if created:
            action = 'created'
        elif reset_password:
            action = 'updated and password reset'
        else:
            action = 'verified as superuser (password preserved)'
        self.stdout.write(self.style.SUCCESS(f'Superuser {username!r} {action}.'))
