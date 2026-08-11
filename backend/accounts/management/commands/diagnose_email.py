from django.core.management.base import BaseCommand, CommandError
from accounts.email_delivery import email_configuration_status, send_verification_email, DeliveryError


class Command(BaseCommand):
    help = 'Check BXC email configuration and optionally send a test verification email.'

    def add_arguments(self, parser):
        parser.add_argument('--to', dest='to_email', help='Destination address for a real delivery test.')

    def handle(self, *args, **options):
        status = email_configuration_status()
        self.stdout.write('BXC email configuration:')
        self.stdout.write(f"  backend: {status['backend']}")
        self.stdout.write(f"  host: {status['host'] or '[missing]'}")
        self.stdout.write(f"  port: {status['port']}")
        self.stdout.write(f"  TLS: {status['tls']}")
        self.stdout.write(f"  SSL: {status['ssl']}")
        self.stdout.write(f"  username configured: {status['user_configured']}")
        self.stdout.write(f"  password configured: {status['password_configured']}")
        self.stdout.write(f"  from address configured: {status['from_configured']}")

        destination = options.get('to_email')
        if not destination:
            self.stdout.write(self.style.WARNING('No --to address supplied; configuration only was checked.'))
            return

        try:
            send_verification_email(destination, '123456', 60)
        except DeliveryError as exc:
            raise CommandError(f'{exc.code}: {exc.public_message}') from exc
        self.stdout.write(self.style.SUCCESS(f'Test email accepted for delivery to {destination}.'))
