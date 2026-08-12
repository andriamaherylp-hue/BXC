from django.contrib import admin
from .models import Profile, VerificationCode, DemoOrder


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'phone', 'account_code', 'email_verified_at', 'phone_verified_at',
        'is_verified', 'verification_requested', 'is_suspended', 'created_at'
    )
    search_fields = ('user__username', 'user__email', 'phone', 'account_code')
    list_filter = ('is_verified', 'verification_requested', 'is_suspended')
    readonly_fields = ('created_at', 'email_verified_at', 'phone_verified_at')


@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('channel', 'destination', 'used', 'attempts', 'expires_at', 'created_at')
    list_filter = ('channel', 'used')
    search_fields = ('destination',)
    readonly_fields = ('code_hash', 'created_at')


@admin.register(DemoOrder)
class DemoOrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'market_code', 'category', 'mode', 'duration', 'investment', 'created_at')
    search_fields = ('user__username', 'market_code')
    readonly_fields = ('user', 'market_code', 'category', 'mode', 'duration', 'investment', 'created_at')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
