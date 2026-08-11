from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies=[('accounts','0001_initial'),migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations=[
        migrations.AddField(model_name='profile',name='account_code',field=models.CharField(blank=True,default='',max_length=12)),
        migrations.AddField(model_name='profile',name='is_verified',field=models.BooleanField(default=False)),
        migrations.AddField(model_name='profile',name='verification_requested',field=models.BooleanField(default=False)),
        migrations.CreateModel(
            name='DemoOrder',
            fields=[
                ('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),
                ('market_code',models.CharField(max_length=32)),
                ('category',models.CharField(max_length=16)),
                ('mode',models.CharField(max_length=16)),
                ('duration',models.PositiveIntegerField(default=60)),
                ('investment',models.DecimalField(decimal_places=2,max_digits=18)),
                ('created_at',models.DateTimeField(auto_now_add=True)),
                ('user',models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,related_name='demo_orders',to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering':['-created_at']},
        ),
    ]
