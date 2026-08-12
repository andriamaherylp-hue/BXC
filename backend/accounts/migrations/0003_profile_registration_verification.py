from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0002_profile_demo_fields_demoorder'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='email_verified_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='phone_verified_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
