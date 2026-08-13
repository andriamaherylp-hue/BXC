from decimal import Decimal

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0003_profile_registration_verification'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(model_name='profile', name='display_name', field=models.CharField(blank=True, default='', max_length=160)),
        migrations.AddField(model_name='profile', name='withdrawals_blocked', field=models.BooleanField(default=False)),
        migrations.AddField(model_name='profile', name='vip_level', field=models.PositiveSmallIntegerField(choices=[(0, 'Regular'), (1, 'VIP1'), (2, 'VIP2'), (3, 'VIP3'), (4, 'VIP4')], default=0)),
        migrations.AddField(model_name='profile', name='demo_trading_balance', field=models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=20)),
        migrations.AddField(model_name='profile', name='demo_spot_balance', field=models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=20)),
        migrations.AddField(model_name='profile', name='demo_finance_balance', field=models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=20)),
        migrations.AddField(model_name='profile', name='demo_loan_balance', field=models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=20)),
        migrations.AddField(model_name='profile', name='admin_note', field=models.TextField(blank=True, default='')),
        migrations.AddField(model_name='demoorder', name='status', field=models.CharField(choices=[('open', 'Open'), ('win', 'Win'), ('loss', 'Loss'), ('cancelled', 'Cancelled')], default='open', max_length=16)),
        migrations.AddField(model_name='demoorder', name='close_price', field=models.DecimalField(blank=True, decimal_places=8, max_digits=24, null=True)),
        migrations.AddField(model_name='demoorder', name='pnl', field=models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=20)),
        migrations.AddField(model_name='demoorder', name='result_note', field=models.CharField(blank=True, default='', max_length=255)),
        migrations.AddField(model_name='demoorder', name='closed_at', field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name='demoorder', name='closed_by', field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='closed_demo_orders', to=settings.AUTH_USER_MODEL)),
        migrations.CreateModel(
            name='FundingRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('kind', models.CharField(choices=[('deposit', 'Deposit'), ('withdrawal', 'Withdrawal')], max_length=16)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=16)),
                ('account_type', models.CharField(choices=[('trading', 'Trading'), ('spot', 'Spot'), ('finance', 'Finance')], default='spot', max_length=16)),
                ('asset', models.CharField(default='USDT', max_length=16)),
                ('network', models.CharField(default='USDT-TRC20', max_length=32)),
                ('address', models.CharField(blank=True, default='', max_length=255)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=20)),
                ('note', models.CharField(blank=True, default='', max_length=255)),
                ('reviewed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('reviewed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reviewed_sandbox_funding_requests', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sandbox_funding_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='SandboxTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_type', models.CharField(choices=[('admin_deposit', 'Admin deposit'), ('admin_adjustment', 'Admin adjustment'), ('deposit_approved', 'Deposit approved'), ('withdrawal_approved', 'Withdrawal approved'), ('trade_settlement', 'Trade settlement')], max_length=32)),
                ('account_type', models.CharField(choices=[('trading', 'Trading'), ('spot', 'Spot'), ('finance', 'Finance'), ('loan', 'Loan')], max_length=16)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=20)),
                ('asset', models.CharField(default='USDT', max_length=16)),
                ('network', models.CharField(blank=True, default='', max_length=32)),
                ('note', models.CharField(blank=True, default='', max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_sandbox_transactions', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sandbox_transactions', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='AdminAuditLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(max_length=80)),
                ('details', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('actor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='bxc_admin_audit_entries', to=settings.AUTH_USER_MODEL)),
                ('target_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='bxc_admin_audit_targets', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
