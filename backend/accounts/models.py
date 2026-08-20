from decimal import Decimal

from django.conf import settings
from django.db import models


class Profile(models.Model):
    VIP_LEVELS = [(0, 'Regular'), (1, 'VIP1'), (2, 'VIP2'), (3, 'VIP3'), (4, 'VIP4')]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=32, unique=True, null=True, blank=True)
    display_name = models.CharField(max_length=160, blank=True, default='')
    preferred_language = models.CharField(max_length=12, default='en')
    is_suspended = models.BooleanField(default=False)
    withdrawals_blocked = models.BooleanField(default=False)
    account_code = models.CharField(max_length=12, blank=True, default='')
    vip_level = models.PositiveSmallIntegerField(choices=VIP_LEVELS, default=0)
    is_verified = models.BooleanField(default=False)
    verification_requested = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    phone_verified_at = models.DateTimeField(null=True, blank=True)
    demo_trading_balance = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0.00'))
    demo_spot_balance = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0.00'))
    demo_finance_balance = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0.00'))
    demo_loan_balance = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0.00'))
    admin_note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Profile({self.user.username})'

    @property
    def demo_total_balance(self):
        return (
            self.demo_trading_balance
            + self.demo_spot_balance
            + self.demo_finance_balance
            + self.demo_loan_balance
        )


class VerificationCode(models.Model):
    CHANNELS = [('email', 'Email'), ('phone', 'Phone')]
    channel = models.CharField(max_length=10, choices=CHANNELS)
    destination = models.CharField(max_length=254, db_index=True)
    code_hash = models.CharField(max_length=255)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['channel', 'destination', '-created_at'])]


class DemoOrder(models.Model):
    STATUSES = [('open', 'Open'), ('win', 'Win'), ('loss', 'Loss'), ('cancelled', 'Cancelled')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='demo_orders')
    market_code = models.CharField(max_length=32)
    category = models.CharField(max_length=16)
    mode = models.CharField(max_length=16)
    direction = models.CharField(max_length=8, choices=[('call','Call/Long'),('put','Put/Short')], default='call')
    duration = models.PositiveIntegerField(default=60)
    investment = models.DecimalField(max_digits=18, decimal_places=2)
    status = models.CharField(max_length=16, choices=STATUSES, default='open')
    close_price = models.DecimalField(max_digits=24, decimal_places=8, null=True, blank=True)
    pnl = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0.00'))
    result_note = models.CharField(max_length=255, blank=True, default='')
    closed_at = models.DateTimeField(null=True, blank=True)
    closed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='closed_demo_orders',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'DemoOrder({self.user.username}, {self.market_code}, {self.investment})'


class FundingRequest(models.Model):
    KINDS = [('deposit', 'Deposit'), ('withdrawal', 'Withdrawal')]
    STATUSES = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    ACCOUNTS = [('trading', 'Trading'), ('spot', 'Spot'), ('finance', 'Finance')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sandbox_funding_requests')
    kind = models.CharField(max_length=16, choices=KINDS)
    status = models.CharField(max_length=16, choices=STATUSES, default='pending')
    account_type = models.CharField(max_length=16, choices=ACCOUNTS, default='spot')
    asset = models.CharField(max_length=16, default='USDT')
    network = models.CharField(max_length=32, default='USDT-TRC20')
    address = models.CharField(max_length=255, blank=True, default='')
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    note = models.CharField(max_length=255, blank=True, default='')
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_sandbox_funding_requests',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class SandboxTransaction(models.Model):
    TYPES = [
        ('admin_deposit', 'Admin deposit'),
        ('admin_adjustment', 'Admin adjustment'),
        ('deposit_approved', 'Deposit approved'),
        ('withdrawal_approved', 'Withdrawal approved'),
        ('trade_settlement', 'Trade settlement'),
    ]
    ACCOUNTS = [('trading', 'Trading'), ('spot', 'Spot'), ('finance', 'Finance'), ('loan', 'Loan')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sandbox_transactions')
    transaction_type = models.CharField(max_length=32, choices=TYPES)
    account_type = models.CharField(max_length=16, choices=ACCOUNTS)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    asset = models.CharField(max_length=16, default='USDT')
    network = models.CharField(max_length=32, blank=True, default='')
    note = models.CharField(max_length=255, blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_sandbox_transactions',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class SandboxAssetBalance(models.Model):
    ACCOUNTS = [('spot', 'Spot'), ('finance', 'Finance')]
    ASSETS = [('BTC','BTC'),('ETH','ETH'),('SOL','SOL'),('USDC','USDC')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sandbox_asset_balances')
    account_type = models.CharField(max_length=16, choices=ACCOUNTS)
    asset = models.CharField(max_length=16, choices=ASSETS)
    amount = models.DecimalField(max_digits=28, decimal_places=8, default=Decimal('0.00000000'))
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user','account_type','asset'], name='unique_sandbox_asset_balance')
        ]
        ordering = ['account_type','asset']

    def __str__(self):
        return f'{self.user.username} {self.account_type} {self.asset}: {self.amount}'


class AdminAuditLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bxc_admin_audit_entries',
    )
    action = models.CharField(max_length=80)
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bxc_admin_audit_targets',
    )
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.created_at:%Y-%m-%d %H:%M:%S} {self.action}'
