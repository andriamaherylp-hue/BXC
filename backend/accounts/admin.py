from django.contrib import admin
from .models import Profile, VerificationCode, DemoOrder

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display=('user','phone','account_code','is_verified','verification_requested','is_suspended','created_at')
    search_fields=('user__username','user__email','phone','account_code')
    list_filter=('is_verified','verification_requested','is_suspended')

@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display=('channel','destination','used','attempts','expires_at','created_at')
    readonly_fields=('code_hash',)

@admin.register(DemoOrder)
class DemoOrderAdmin(admin.ModelAdmin):
    list_display=('user','market_code','category','mode','duration','investment','created_at')
    search_fields=('user__username','market_code')
    readonly_fields=('user','market_code','category','mode','duration','investment','created_at')
    def has_add_permission(self,request): return False
    def has_change_permission(self,request,obj=None): return False
