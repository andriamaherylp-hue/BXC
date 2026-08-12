from django.core.management.base import BaseCommand, CommandError
from django.db import connection


class Command(BaseCommand):
    help = 'Check that Django can connect to the configured database.'

    def handle(self, *args, **options):
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT current_database(), current_user')
                database_name, database_user = cursor.fetchone()
        except Exception as exc:
            raise CommandError(f'Database connection failed: {exc.__class__.__name__}: {exc}') from exc

        self.stdout.write(self.style.SUCCESS('Database connection OK.'))
        self.stdout.write(f'  engine: {connection.vendor}')
        self.stdout.write(f'  database: {database_name}')
        self.stdout.write(f'  user: {database_user}')
