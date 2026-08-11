from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial=True
    dependencies=[migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations=[
        migrations.CreateModel(name='VerificationCode',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('channel',models.CharField(choices=[('email','Email'),('phone','Phone')],max_length=10)),('destination',models.CharField(db_index=True,max_length=254)),('code_hash',models.CharField(max_length=255)),('expires_at',models.DateTimeField()),('used',models.BooleanField(default=False)),('attempts',models.PositiveSmallIntegerField(default=0)),('created_at',models.DateTimeField(auto_now_add=True))]),
        migrations.CreateModel(name='Profile',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('phone',models.CharField(blank=True,max_length=32,null=True,unique=True)),('preferred_language',models.CharField(default='en',max_length=12)),('is_suspended',models.BooleanField(default=False)),('created_at',models.DateTimeField(auto_now_add=True)),('user',models.OneToOneField(on_delete=django.db.models.deletion.CASCADE,related_name='profile',to=settings.AUTH_USER_MODEL))]),
        migrations.AddIndex(model_name='verificationcode',index=models.Index(fields=['channel','destination','-created_at'],name='accounts_ve_channel_56e1fe_idx')),
    ]
