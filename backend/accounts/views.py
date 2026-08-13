import json
import logging
import secrets
from decimal import Decimal, InvalidOperation
from functools import wraps

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout, update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST, require_http_methods

from .models import AdminAuditLog, DemoOrder, FundingRequest, Profile, SandboxTransaction

logger = logging.getLogger(__name__)
User = get_user_model()
ALLOWED_CATEGORIES = {'crypto', 'forex', 'stocks', 'futures'}
ALLOWED_MODES = {'options', 'futures', 'spot'}
BALANCE_FIELDS = {
    'trading': 'demo_trading_balance',
    'spot': 'demo_spot_balance',
    'finance': 'demo_finance_balance',
    'loan': 'demo_loan_balance',
}


def body(request):
    try:
        return json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return {}


def decimal_value(value, *, minimum=None, maximum=None):
    try:
        result = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError('Enter a valid amount.')
    if minimum is not None and result < Decimal(str(minimum)):
        raise ValueError(f'Amount must be at least {minimum}.')
    if maximum is not None and result > Decimal(str(maximum)):
        raise ValueError(f'Amount must not exceed {maximum}.')
    return result.quantize(Decimal('0.01'))


def ensure_profile(user):
    profile, _ = Profile.objects.get_or_create(user=user)
    if not profile.account_code:
        for _ in range(30):
            candidate = str(secrets.randbelow(900000) + 100000)
            if not Profile.objects.filter(account_code=candidate).exclude(pk=profile.pk).exists():
                profile.account_code = candidate
                profile.save(update_fields=['account_code'])
                break
    return profile


def balances_json(profile):
    return {
        'trading': f'{profile.demo_trading_balance:.2f}',
        'spot': f'{profile.demo_spot_balance:.2f}',
        'finance': f'{profile.demo_finance_balance:.2f}',
        'loan': f'{profile.demo_loan_balance:.2f}',
        'total': f'{profile.demo_total_balance:.2f}',
    }


def user_json(user):
    profile = ensure_profile(user)
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'phone': profile.phone,
        'display_name': profile.display_name,
        'preferred_language': profile.preferred_language,
        'is_staff': user.is_staff,
        'is_suspended': profile.is_suspended,
        'withdrawals_blocked': profile.withdrawals_blocked,
        'account_code': profile.account_code,
        'vip_level': profile.vip_level,
        'vip_label': dict(Profile.VIP_LEVELS).get(profile.vip_level, 'Regular'),
        'is_verified': profile.is_verified,
        'verification_requested': profile.verification_requested,
        'email_verified': bool(profile.email_verified_at),
        'phone_verified': bool(profile.phone_verified_at),
        'balances': balances_json(profile),
        'date_joined': user.date_joined.isoformat(),
    }


def auth_required(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required.'}, status=401)
        return view(request, *args, **kwargs)

    return wrapped


def staff_required(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({'error': 'Staff access required.'}, status=403)
        return view(request, *args, **kwargs)

    return wrapped


def audit(actor, action, target=None, **details):
    safe_details = {key: (str(value) if isinstance(value, Decimal) else value) for key, value in details.items()}
    AdminAuditLog.objects.create(actor=actor, action=action, target_user=target, details=safe_details)


def balance_field(account_type):
    field = BALANCE_FIELDS.get(str(account_type).lower())
    if not field:
        raise ValueError('Invalid sandbox account type.')
    return field


def adjust_balance_locked(profile, account_type, amount):
    field = balance_field(account_type)
    current = getattr(profile, field)
    new_value = (current + amount).quantize(Decimal('0.01'))
    if new_value < 0:
        raise ValueError('Sandbox balance cannot become negative.')
    setattr(profile, field, new_value)
    profile.save(update_fields=[field])
    return new_value


@require_GET
def csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})


@require_GET
def me(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)
    return JsonResponse({'user': user_json(request.user)})


@require_POST
def login_view(request):
    data = body(request)
    username = str(data.get('username') or data.get('identifier') or '').strip()
    password = str(data.get('password', ''))

    if not username or not password:
        return JsonResponse({'error': 'Username and password are required.'}, status=400)

    candidate = User.objects.filter(username__iexact=username).first()
    if not candidate:
        return JsonResponse({'error': 'Invalid username or password.'}, status=400)

    user = authenticate(request, username=candidate.username, password=password)
    if not user:
        return JsonResponse({'error': 'Invalid username or password.'}, status=400)

    profile = ensure_profile(user)
    if profile.is_suspended:
        return JsonResponse({'error': 'This account is suspended. Contact support.'}, status=403)

    login(request, user)
    return JsonResponse({'user': user_json(user)})


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({'ok': True})


@require_POST
def register(request):
    data = body(request)
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', ''))
    language = str(data.get('preferred_language', 'en'))[:12]

    if not username:
        return JsonResponse({'error': 'Username is required.'}, status=400)
    if len(username) > 150:
        return JsonResponse({'error': 'Username must be 150 characters or fewer.'}, status=400)
    if not password:
        return JsonResponse({'error': 'Password is required.'}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({'error': 'Username already exists.'}, status=409)

    try:
        validate_password(password)
    except ValidationError as exc:
        return JsonResponse({'error': ' '.join(exc.messages)}, status=400)

    try:
        with transaction.atomic():
            user = User.objects.create_user(username=username, password=password)
            profile = ensure_profile(user)
            profile.phone = None
            profile.preferred_language = language
            profile.save(update_fields=['phone', 'preferred_language'])
    except IntegrityError:
        return JsonResponse({'error': 'Username already exists.'}, status=409)

    login(request, user)
    return JsonResponse({'user': user_json(user)}, status=201)


@require_GET
@auth_required
def account_summary(request):
    profile = ensure_profile(request.user)
    return JsonResponse({
        'account_code': profile.account_code,
        'is_verified': profile.is_verified,
        'verification_requested': profile.verification_requested,
        'withdrawals_blocked': profile.withdrawals_blocked,
        'vip_level': profile.vip_level,
        'vip_label': dict(Profile.VIP_LEVELS).get(profile.vip_level, 'Regular'),
        'balances': balances_json(profile),
        'mode': 'sandbox',
    })


@require_POST
@auth_required
def verification_request(request):
    profile = ensure_profile(request.user)
    if not profile.is_verified:
        profile.verification_requested = True
        profile.save(update_fields=['verification_requested'])
    return JsonResponse({'ok': True, 'is_verified': profile.is_verified, 'verification_requested': profile.verification_requested})


@require_POST
@auth_required
def change_password(request):
    data = body(request)
    current = str(data.get('current_password', ''))
    new = str(data.get('new_password', ''))
    if not request.user.check_password(current):
        return JsonResponse({'error': 'Current password is incorrect.'}, status=400)
    try:
        validate_password(new, request.user)
    except ValidationError as exc:
        return JsonResponse({'error': ' '.join(exc.messages)}, status=400)
    request.user.set_password(new)
    request.user.save(update_fields=['password'])
    update_session_auth_hash(request, request.user)
    return JsonResponse({'ok': True})


@require_http_methods(['GET', 'POST'])
@auth_required
def funding_requests(request):
    if request.method == 'GET':
        items = FundingRequest.objects.filter(user=request.user)[:100]
        return JsonResponse({'requests': [funding_request_json(item) for item in items]})

    data = body(request)
    kind = str(data.get('kind', '')).lower()
    account_type = str(data.get('account_type', 'spot')).lower()
    if kind not in {'deposit', 'withdrawal'}:
        return JsonResponse({'error': 'Invalid sandbox funding request type.'}, status=400)
    if account_type not in {'trading', 'spot', 'finance'}:
        return JsonResponse({'error': 'Invalid sandbox account type.'}, status=400)
    try:
        amount = decimal_value(data.get('amount'), minimum='0.01', maximum='100000000')
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)

    profile = ensure_profile(request.user)
    if kind == 'withdrawal':
        if profile.withdrawals_blocked:
            return JsonResponse({'error': 'Sandbox withdrawals are disabled for this account. Contact support.'}, status=403)
        if getattr(profile, BALANCE_FIELDS[account_type]) < amount:
            return JsonResponse({'error': 'Insufficient sandbox balance for this request.'}, status=400)

    item = FundingRequest.objects.create(
        user=request.user,
        kind=kind,
        account_type=account_type,
        asset=str(data.get('asset', 'USDT')).strip()[:16] or 'USDT',
        network=str(data.get('network', 'USDT-TRC20')).strip()[:32] or 'USDT-TRC20',
        address=str(data.get('address', '')).strip()[:255],
        amount=amount,
        note=str(data.get('note', '')).strip()[:255],
    )
    return JsonResponse({'request': funding_request_json(item)}, status=201)


def funding_request_json(item):
    return {
        'id': item.id,
        'user_id': item.user_id,
        'username': item.user.username,
        'email': item.user.email,
        'account_code': ensure_profile(item.user).account_code,
        'kind': item.kind,
        'status': item.status,
        'account_type': item.account_type,
        'asset': item.asset,
        'network': item.network,
        'address': item.address,
        'amount': f'{item.amount:.2f}',
        'note': item.note,
        'created_at': item.created_at.isoformat(),
        'reviewed_at': item.reviewed_at.isoformat() if item.reviewed_at else None,
    }


def demo_order_json(order):
    return {
        'id': order.id,
        'user_id': order.user_id,
        'username': order.user.username,
        'email': order.user.email,
        'account_code': ensure_profile(order.user).account_code,
        'market_code': order.market_code,
        'category': order.category,
        'mode': order.mode,
        'duration': order.duration,
        'investment': f'{order.investment:.2f}',
        'status': order.status,
        'close_price': str(order.close_price) if order.close_price is not None else None,
        'pnl': f'{order.pnl:.2f}',
        'result_note': order.result_note,
        'created_at': order.created_at.isoformat(),
        'closed_at': order.closed_at.isoformat() if order.closed_at else None,
    }


@require_http_methods(['GET', 'POST'])
@auth_required
def demo_orders(request):
    if request.method == 'GET':
        orders = DemoOrder.objects.filter(user=request.user)[:100]
        return JsonResponse({'orders': [demo_order_json(order) for order in orders]})

    data = body(request)
    market_code = str(data.get('market_code', '')).strip()[:32]
    category = str(data.get('category', '')).lower()
    mode = str(data.get('mode', '')).lower()
    try:
        duration = int(data.get('duration', 60))
        investment = decimal_value(data.get('investment', '0'), minimum='0.01', maximum='10000000')
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Invalid demo order values.'}, status=400)
    if not market_code or category not in ALLOWED_CATEGORIES or mode not in ALLOWED_MODES:
        return JsonResponse({'error': 'Invalid demo market selection.'}, status=400)
    if duration not in {60, 90, 120, 180}:
        return JsonResponse({'error': 'Invalid demo duration.'}, status=400)

    order = DemoOrder.objects.create(
        user=request.user,
        market_code=market_code,
        category=category,
        mode=mode,
        duration=duration,
        investment=investment,
    )
    return JsonResponse({'order': demo_order_json(order)}, status=201)


@require_GET
@staff_required
def admin_users(request):
    users = User.objects.select_related('profile').order_by('-date_joined')[:1000]
    return JsonResponse({'users': [user_json(user) for user in users]})


@require_GET
@staff_required
def admin_overview(request):
    total = User.objects.count()
    suspended = Profile.objects.filter(is_suspended=True).count()
    verified = Profile.objects.filter(is_verified=True).count()
    return JsonResponse({
        'total_users': total,
        'active_users': max(0, total - suspended),
        'suspended_users': suspended,
        'verified_users': verified,
        'vip_users': Profile.objects.filter(vip_level__gt=0).count(),
        'open_demo_orders': DemoOrder.objects.filter(status='open').count(),
        'pending_deposits': FundingRequest.objects.filter(kind='deposit', status='pending').count(),
        'pending_withdrawals': FundingRequest.objects.filter(kind='withdrawal', status='pending').count(),
    })


@require_GET
@staff_required
def admin_activity(request):
    requests = FundingRequest.objects.select_related('user').filter(status='pending')[:200]
    orders = DemoOrder.objects.select_related('user').filter(status='open')[:200]
    transactions = SandboxTransaction.objects.select_related('user', 'created_by')[:100]
    audit_entries = AdminAuditLog.objects.select_related('actor', 'target_user')[:100]
    return JsonResponse({
        'funding_requests': [funding_request_json(item) for item in requests],
        'open_orders': [demo_order_json(order) for order in orders],
        'transactions': [
            {
                'id': item.id,
                'username': item.user.username,
                'transaction_type': item.transaction_type,
                'account_type': item.account_type,
                'amount': f'{item.amount:.2f}',
                'asset': item.asset,
                'note': item.note,
                'created_at': item.created_at.isoformat(),
            }
            for item in transactions
        ],
        'audit': [
            {
                'id': item.id,
                'actor': item.actor.username if item.actor else 'system',
                'target': item.target_user.username if item.target_user else '',
                'action': item.action,
                'details': item.details,
                'created_at': item.created_at.isoformat(),
            }
            for item in audit_entries
        ],
    })


@require_POST
@staff_required
def admin_create_client(request):
    data = body(request)
    username = str(data.get('username', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    display_name = str(data.get('display_name', '')).strip()[:160]
    password = str(data.get('password', '')).strip()
    if not username:
        return JsonResponse({'error': 'Client username is required.'}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({'error': 'Username already exists.'}, status=409)
    if email:
        try:
            validate_email(email)
        except ValidationError:
            return JsonResponse({'error': 'Enter a valid email address.'}, status=400)
        if User.objects.filter(email__iexact=email).exists():
            return JsonResponse({'error': 'Email already exists.'}, status=409)
    generated_password = False
    if not password:
        password = secrets.token_urlsafe(12)
        generated_password = True
    try:
        validate_password(password)
    except ValidationError as exc:
        return JsonResponse({'error': ' '.join(exc.messages)}, status=400)

    with transaction.atomic():
        user = User.objects.create_user(username=username, email=email, password=password)
        profile = ensure_profile(user)
        profile.display_name = display_name
        profile.save(update_fields=['display_name'])
        audit(request.user, 'client_created', user, account_code=profile.account_code)
    payload = {'user': user_json(user)}
    if generated_password:
        payload['temporary_password'] = password
    return JsonResponse(payload, status=201)


@require_POST
@staff_required
def admin_adjust_balance(request, user_id):
    data = body(request)
    try:
        amount = decimal_value(data.get('amount'), minimum='-100000000', maximum='100000000')
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)
    if amount == 0:
        return JsonResponse({'error': 'Adjustment amount cannot be zero.'}, status=400)
    account_type = str(data.get('account_type', 'trading')).lower()
    note = str(data.get('note', '')).strip()[:255]

    try:
        with transaction.atomic():
            target = User.objects.select_for_update().get(pk=user_id)
            profile = Profile.objects.select_for_update().get(user=target)
            new_balance = adjust_balance_locked(profile, account_type, amount)
            SandboxTransaction.objects.create(
                user=target,
                transaction_type='admin_adjustment',
                account_type=account_type,
                amount=amount,
                note=note,
                created_by=request.user,
            )
            audit(request.user, 'sandbox_balance_adjusted', target, account_type=account_type, amount=amount, note=note)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)
    return JsonResponse({'user': user_json(target), 'new_balance': f'{new_balance:.2f}'})


@require_POST
@staff_required
def admin_add_deposit(request, user_id):
    data = body(request)
    try:
        amount = decimal_value(data.get('amount'), minimum='0.01', maximum='100000000')
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)
    account_type = str(data.get('account_type', 'spot')).lower()
    network = str(data.get('network', 'USDT-TRC20')).strip()[:32]
    note = str(data.get('note', '')).strip()[:255]

    try:
        with transaction.atomic():
            target = User.objects.select_for_update().get(pk=user_id)
            profile = Profile.objects.select_for_update().get(user=target)
            new_balance = adjust_balance_locked(profile, account_type, amount)
            SandboxTransaction.objects.create(
                user=target,
                transaction_type='admin_deposit',
                account_type=account_type,
                amount=amount,
                asset='USDT',
                network=network,
                note=note,
                created_by=request.user,
            )
            audit(request.user, 'sandbox_deposit_added', target, account_type=account_type, amount=amount, network=network, note=note)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)
    return JsonResponse({'user': user_json(target), 'new_balance': f'{new_balance:.2f}'})


@require_POST
@staff_required
def admin_vip(request, user_id):
    data = body(request)
    try:
        level = int(data.get('vip_level', 0))
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Invalid VIP level.'}, status=400)
    if level not in {0, 1, 2, 3, 4}:
        return JsonResponse({'error': 'VIP level must be between 0 and 4.'}, status=400)
    try:
        target = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    profile = ensure_profile(target)
    profile.vip_level = level
    profile.save(update_fields=['vip_level'])
    audit(request.user, 'vip_changed', target, vip_level=level)
    return JsonResponse({'user': user_json(target)})


@require_POST
@staff_required
def admin_suspend(request, user_id):
    try:
        target = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    if target.id == request.user.id:
        return JsonResponse({'error': 'You cannot suspend your own administrator account.'}, status=400)
    data = body(request)
    profile = ensure_profile(target)
    profile.is_suspended = bool(data.get('suspended'))
    profile.save(update_fields=['is_suspended'])
    audit(request.user, 'account_access_changed', target, suspended=profile.is_suspended)
    return JsonResponse({'user': user_json(target)})


@require_POST
@staff_required
def admin_withdrawal_access(request, user_id):
    try:
        target = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    data = body(request)
    profile = ensure_profile(target)
    profile.withdrawals_blocked = bool(data.get('blocked'))
    profile.save(update_fields=['withdrawals_blocked'])
    audit(request.user, 'sandbox_withdrawal_access_changed', target, blocked=profile.withdrawals_blocked)
    return JsonResponse({'user': user_json(target)})


@require_POST
@staff_required
def admin_verify(request, user_id):
    try:
        target = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    data = body(request)
    profile = ensure_profile(target)
    profile.is_verified = bool(data.get('verified'))
    profile.verification_requested = False
    profile.save(update_fields=['is_verified', 'verification_requested'])
    audit(request.user, 'verification_changed', target, verified=profile.is_verified)
    return JsonResponse({'user': user_json(target)})


@require_POST
@staff_required
def admin_delete_client(request, user_id):
    try:
        target = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    if target.id == request.user.id or target.is_staff:
        return JsonResponse({'error': 'Staff accounts cannot be deleted from this dashboard.'}, status=400)
    username = target.username
    audit(request.user, 'client_deleted', target, username=username)
    target.delete()
    return JsonResponse({'ok': True})


@require_POST
@staff_required
def admin_review_funding(request, request_id):
    data = body(request)
    decision = str(data.get('decision', '')).lower()
    if decision not in {'approve', 'reject'}:
        return JsonResponse({'error': 'Decision must be approve or reject.'}, status=400)

    try:
        with transaction.atomic():
            item = FundingRequest.objects.select_for_update().select_related('user').get(pk=request_id)
            if item.status != 'pending':
                return JsonResponse({'error': 'This request has already been reviewed.'}, status=409)
            profile = Profile.objects.select_for_update().get(user=item.user)
            if decision == 'approve':
                signed_amount = item.amount
                transaction_type = 'deposit_approved'
                if item.kind == 'withdrawal':
                    if profile.withdrawals_blocked:
                        return JsonResponse({'error': 'Sandbox withdrawals are disabled for this account.'}, status=409)
                    signed_amount = -item.amount
                    transaction_type = 'withdrawal_approved'
                adjust_balance_locked(profile, item.account_type, signed_amount)
                SandboxTransaction.objects.create(
                    user=item.user,
                    transaction_type=transaction_type,
                    account_type=item.account_type,
                    amount=signed_amount,
                    asset=item.asset,
                    network=item.network,
                    note=item.note,
                    created_by=request.user,
                )
                item.status = 'approved'
            else:
                item.status = 'rejected'
            item.reviewed_by = request.user
            item.reviewed_at = timezone.now()
            item.save(update_fields=['status', 'reviewed_by', 'reviewed_at'])
            audit(request.user, 'sandbox_funding_reviewed', item.user, request_id=item.id, kind=item.kind, decision=decision, amount=item.amount)
    except FundingRequest.DoesNotExist:
        return JsonResponse({'error': 'Funding request not found.'}, status=404)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)
    return JsonResponse({'request': funding_request_json(item), 'user': user_json(item.user)})


@require_POST
@staff_required
def admin_close_order(request, order_id):
    data = body(request)
    result = str(data.get('result', '')).lower()
    if result not in {'win', 'loss', 'cancelled'}:
        return JsonResponse({'error': 'Result must be win, loss or cancelled.'}, status=400)
    try:
        pnl = decimal_value(data.get('pnl', '0'), minimum='0', maximum='100000000')
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)
    close_price_raw = data.get('close_price')
    try:
        close_price = Decimal(str(close_price_raw)) if close_price_raw not in (None, '') else None
    except (InvalidOperation, ValueError, TypeError):
        return JsonResponse({'error': 'Enter a valid close price.'}, status=400)
    note = str(data.get('note', '')).strip()[:255]

    try:
        with transaction.atomic():
            order = DemoOrder.objects.select_for_update().select_related('user').get(pk=order_id)
            if order.status != 'open':
                return JsonResponse({'error': 'This demo order is already closed.'}, status=409)
            profile = Profile.objects.select_for_update().get(user=order.user)
            signed_pnl = Decimal('0.00')
            if result == 'win':
                signed_pnl = pnl
            elif result == 'loss':
                signed_pnl = -pnl
            if signed_pnl:
                adjust_balance_locked(profile, 'trading', signed_pnl)
                SandboxTransaction.objects.create(
                    user=order.user,
                    transaction_type='trade_settlement',
                    account_type='trading',
                    amount=signed_pnl,
                    note=f'{order.market_code} {result}: {note}'.strip(),
                    created_by=request.user,
                )
            order.status = result
            order.pnl = signed_pnl
            order.close_price = close_price
            order.result_note = note
            order.closed_at = timezone.now()
            order.closed_by = request.user
            order.save(update_fields=['status', 'pnl', 'close_price', 'result_note', 'closed_at', 'closed_by'])
            audit(request.user, 'demo_order_closed', order.user, order_id=order.id, result=result, pnl=signed_pnl, close_price=close_price or '')
    except DemoOrder.DoesNotExist:
        return JsonResponse({'error': 'Demo order not found.'}, status=404)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)
    return JsonResponse({'order': demo_order_json(order), 'user': user_json(order.user)})
