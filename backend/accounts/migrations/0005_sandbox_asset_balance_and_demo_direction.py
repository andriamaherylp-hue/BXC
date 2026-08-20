from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_admin_sandbox_controls'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='demoorder',
            name='direction',
            field=models.CharField(
                choices=[('call', 'Call/Long'), ('put', 'Put/Short')],
                default='call',
                max_length=8,
            ),
        ),
        migrations.CreateModel(
            name='SandboxAssetBalance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('account_type', models.CharField(choices=[('spot', 'Spot'), ('finance', 'Finance')], max_length=16)),
                ('asset', models.CharField(choices=[('BTC', 'BTC'), ('ETH', 'ETH'), ('SOL', 'SOL'), ('USDC', 'USDC')], max_length=16)),
                ('amount', models.DecimalField(decimal_places=8, default=0, max_digits=28)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sandbox_asset_balances', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['account_type', 'asset'],
            },
        ),
        migrations.AddConstraint(
            model_name='sandboxassetbalance',
            constraint=models.UniqueConstraint(fields=('user', 'account_type', 'asset'), name='unique_sandbox_asset_balance'),
        ),
    ]
