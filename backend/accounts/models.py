from django.conf import settings
from django.db import models

class Profile(models.Model):
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='profile')
    phone=models.CharField(max_length=32,unique=True,null=True,blank=True)
    preferred_language=models.CharField(max_length=12,default='en')
    is_suspended=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self): return f'Profile({self.user.username})'

class VerificationCode(models.Model):
    CHANNELS=[('email','Email'),('phone','Phone')]
    channel=models.CharField(max_length=10,choices=CHANNELS)
    destination=models.CharField(max_length=254,db_index=True)
    code_hash=models.CharField(max_length=255)
    expires_at=models.DateTimeField()
    used=models.BooleanField(default=False)
    attempts=models.PositiveSmallIntegerField(default=0)
    created_at=models.DateTimeField(auto_now_add=True)
    class Meta:
        indexes=[models.Index(fields=['channel','destination','-created_at'])]
