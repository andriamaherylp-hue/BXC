from django.contrib import admin
from .models import Profile, VerificationCode
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display=('user','phone','preferred_language','is_suspended','created_at')
    list_filter=('is_suspended','preferred_language')
    search_fields=('user__username','user__email','phone')
@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display=('channel','destination','used','attempts','expires_at','created_at')
    list_filter=('channel','used')
    search_fields=('destination',)
