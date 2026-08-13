from django.contrib import admin
from .models import AdminAuditLog, DemoOrder, FundingRequest, Profile, SandboxTransaction, VerificationCode


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'account_code', 'vip_level', 'is_verified', 'is_suspended', 'withdrawals_blocked',
        'demo_trading_balance', 'demo_spot_balance', 'demo_finance_balance', 'created_at'
    )
    search_fields = ('user__username', 'user__email', 'phone', 'account_code', 'display_name')
    list_filter = ('vip_level', 'is_verified', 'verification_requested', 'is_suspended', 'withdrawals_blocked')
    readonly_fields = ('created_at', 'email_verified_at', 'phone_verified_at')


@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('channel', 'destination', 'used', 'attempts', 'expires_at', 'created_at')
    list_filter = ('channel', 'used')
    search_fields = ('destination',)
    readonly_fields = ('code_hash', 'created_at')


@admin.register(DemoOrder)
class DemoOrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'market_code', 'mode', 'investment', 'status', 'pnl', 'created_at', 'closed_at')
    list_filter = ('status', 'category', 'mode')
    search_fields = ('user__username', 'market_code')
    readonly_fields = [field.name for field in DemoOrder._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(FundingRequest)
class FundingRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'kind', 'account_type', 'amount', 'asset', 'status', 'created_at', 'reviewed_at')
    list_filter = ('kind', 'status', 'account_type')
    search_fields = ('user__username', 'user__email', 'address')
    readonly_fields = [field.name for field in FundingRequest._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(SandboxTransaction)
class SandboxTransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'transaction_type', 'account_type', 'amount', 'asset', 'created_by', 'created_at')
    list_filter = ('transaction_type', 'account_type')
    search_fields = ('user__username', 'user__email', 'note')
    readonly_fields = [field.name for field in SandboxTransaction._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'actor', 'action', 'target_user')
    list_filter = ('action',)
    search_fields = ('actor__username', 'target_user__username', 'action')
    readonly_fields = [field.name for field in AdminAuditLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
