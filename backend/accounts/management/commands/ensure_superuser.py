import os
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Create or update the BXC superuser from Render environment variables.'

    def handle(self, *args, **options):
        username = os.getenv('BXC_ADMIN_USERNAME', '').strip()
        email = os.getenv('BXC_ADMIN_EMAIL', '').strip()
        password = os.getenv('BXC_ADMIN_PASSWORD', '')

        if not username:
            raise CommandError('BXC_ADMIN_USERNAME is not set.')
        if not password:
            raise CommandError('BXC_ADMIN_PASSWORD is not set.')

        User = get_user_model()
        user, created = User.objects.get_or_create(username=username, defaults={'email': email})
        if email and user.email != email:
            user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()

        action = 'created' if created else 'updated'
        self.stdout.write(self.style.SUCCESS(f'Superuser {username!r} {action} successfully.'))
