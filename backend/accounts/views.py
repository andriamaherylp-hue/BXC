import json, logging, re, secrets
from datetime import timedelta
from decimal import Decimal, InvalidOperation
from functools import wraps
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout, update_session_auth_hash
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.db import IntegrityError, transaction
from django.middleware.csrf import get_token
from django.utils import timezone
import django.views.decorators.http
from .models import Profile, VerificationCode, DemoOrder
from .sms import send_sms
from .email_delivery import send_verification_email, DeliveryError

logger=logging.getLogger(__name__)
User=get_user_model()
PHONE_RE=re.compile(r'^\+[1-9]\d{6,14}$')
ALLOWED_CATEGORIES={'crypto','forex','stocks','futures'}
ALLOWED_MODES={'options','futures','spot'}


def body(request):
    try:return json.loads(request.body or '{}')
    except json.JSONDecodeError:return {}


def ensure_profile(user):
    profile,_=Profile.objects.get_or_create(user=user)
    if not profile.account_code:
        for _ in range(30):
            candidate=str(secrets.randbelow(900000)+100000)
            if not Profile.objects.filter(account_code=candidate).exclude(pk=profile.pk).exists():
                profile.account_code=candidate
                profile.save(update_fields=['account_code'])
                break
    return profile


def user_json(user):
    profile=ensure_profile(user)
    return {
        'id':user.id,'username':user.username,'email':user.email,'phone':profile.phone,
        'preferred_language':profile.preferred_language,'is_staff':user.is_staff,
        'is_suspended':profile.is_suspended,'account_code':profile.account_code,
        'is_verified':profile.is_verified,'verification_requested':profile.verification_requested,
        'email_verified':bool(profile.email_verified_at),'phone_verified':bool(profile.phone_verified_at),
        'date_joined':user.date_joined.isoformat(),
    }


def auth_required(view):
    @wraps(view)
    def wrapped(request,*args,**kwargs):
        if not request.user.is_authenticated:return JsonResponse({'error':'Authentication required.'},status=401)
        return view(request,*args,**kwargs)
    return wrapped


def staff_required(view):
    @wraps(view)
    def wrapped(request,*args,**kwargs):
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({'error':'Staff access required.'},status=403)
        return view(request,*args,**kwargs)
    return wrapped


@django.views.decorators.http.require_GET
def csrf(request): return JsonResponse({'csrfToken':get_token(request)})


@django.views.decorators.http.require_GET
def me(request):
    if not request.user.is_authenticated:return JsonResponse({'error':'Authentication required.'},status=401)
    return JsonResponse({'user':user_json(request.user)})


@django.views.decorators.http.require_POST
def login_view(request):
    data=body(request); username=str(data.get('username','')).strip(); password=str(data.get('password',''))
    user=authenticate(request,username=username,password=password)
    if not user:return JsonResponse({'error':'Invalid username or password.'},status=400)
    profile=ensure_profile(user)
    if profile.is_suspended:return JsonResponse({'error':'This account is suspended. Contact support.'},status=403)
    login(request,user); return JsonResponse({'user':user_json(user)})


@django.views.decorators.http.require_POST
def logout_view(request): logout(request); return JsonResponse({'ok':True})


def normalize_destination(mode,destination):
    destination=destination.strip()
    if mode=='email':
        try:
            validate_email(destination)
        except ValidationError:
            raise ValueError('Enter a valid email address.')
        return destination.lower()
    if mode=='phone':
        destination=re.sub(r'[\s()-]','',destination)
        if not PHONE_RE.match(destination): raise ValueError('Enter a valid international phone number.')
        return destination
    raise ValueError('Invalid registration mode.')


def _verification_timing():
    ttl=max(30,int(getattr(settings,'VERIFICATION_CODE_TTL_SECONDS',60)))
    resend=max(30,int(getattr(settings,'VERIFICATION_RESEND_SECONDS',60)))
    return ttl,resend


@django.views.decorators.http.require_POST
def request_code(request):
    data=body(request)
    mode=str(data.get('mode','')).strip().lower()
    destination_raw=str(data.get('destination',''))
    try:
        destination=normalize_destination(mode,destination_raw)
    except ValueError as exc:
        return JsonResponse({'error':str(exc)},status=400)

    # Do not send verification messages for identifiers that are already registered.
    if mode=='email' and User.objects.filter(email__iexact=destination).exists():
        return JsonResponse({'error':'An account already exists with this email address.'},status=409)
    if mode=='phone' and Profile.objects.filter(phone=destination).exists():
        return JsonResponse({'error':'An account already exists with this phone number.'},status=409)

    ttl,resend=_verification_timing()
    now=timezone.now()
    latest=VerificationCode.objects.filter(channel=mode,destination=destination).order_by('-created_at').first()
    if latest:
        elapsed=(now-latest.created_at).total_seconds()
        if elapsed<resend:
            retry_after=max(1,int(resend-elapsed+0.999))
            return JsonResponse({
                'error':'Please wait before requesting another code.',
                'retry_after':retry_after,
            },status=429)

    code=f'{secrets.randbelow(900000)+100000}'
    VerificationCode.objects.filter(channel=mode,destination=destination,used=False).update(used=True)
    verification=VerificationCode.objects.create(
        channel=mode,
        destination=destination,
        code_hash=make_password(code),
        expires_at=now+timedelta(seconds=ttl),
    )

    try:
        if mode=='email':
            send_verification_email(destination,code,ttl)
        else:
            send_sms(destination,f'Your BXC verification code is {code}. It is valid for {ttl} seconds.')
    except DeliveryError as exc:
        verification.delete()
        logger.warning('Verification email not sent (%s) to %s',exc.code,destination)
        return JsonResponse({'error':exc.public_message,'reason':exc.code},status=503)
    except Exception:
        verification.delete()
        logger.exception('Verification delivery failed for channel=%s destination=%s',mode,destination)
        return JsonResponse({'error':'Unable to send the verification code right now. Please try again.','reason':'delivery_failed'},status=503)

    response={
        'ok':True,
        'expires_in':ttl,
        'resend_in':resend,
        'destination':destination,
    }
    if settings.DEBUG:
        response['dev_code']=code
    return JsonResponse(response)


@django.views.decorators.http.require_POST
def register(request):
    data = body(request)
    mode = str(data.get('mode', '')).strip().lower()
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', ''))
    confirm = str(data.get('confirm_password', ''))
    code = str(data.get('code', '')).strip()
    language = str(data.get('preferred_language', 'en'))[:12]

    try:
        destination = normalize_destination(mode, str(data.get('destination', '')))
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)

    if not username:
        return JsonResponse({'error': 'Username is required.'}, status=400)
    if not re.fullmatch(r'[A-Za-z0-9_.@+-]{3,150}', username):
        return JsonResponse({'error': 'Username contains unsupported characters.'}, status=400)
    if password != confirm:
        return JsonResponse({'error': 'Passwords do not match.'}, status=400)
    if not re.fullmatch(r'\d{6}', code):
        return JsonResponse({'error': 'Enter the 6-digit verification code.'}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({'error': 'Username already exists.'}, status=409)
    if mode == 'email' and User.objects.filter(email__iexact=destination).exists():
        return JsonResponse({'error': 'Email already exists.'}, status=409)
    if mode == 'phone' and Profile.objects.filter(phone=destination).exists():
        return JsonResponse({'error': 'Phone number already exists.'}, status=409)

    try:
        validate_password(password)
    except ValidationError as exc:
        return JsonResponse({'error': ' '.join(exc.messages)}, status=400)

    now = timezone.now()
    try:
        with transaction.atomic():
            verification = (
                VerificationCode.objects.select_for_update()
                .filter(channel=mode, destination=destination, used=False)
                .order_by('-created_at')
                .first()
            )
            if not verification:
                return JsonResponse({'error': 'Verification code is missing or expired.'}, status=400)
            if verification.expires_at < now:
                verification.used = True
                verification.save(update_fields=['used'])
                return JsonResponse({'error': 'Verification code is missing or expired.'}, status=400)
            if verification.attempts >= 5:
                verification.used = True
                verification.save(update_fields=['used'])
                return JsonResponse({'error': 'Too many verification attempts. Request a new code.'}, status=429)
            if not check_password(code, verification.code_hash):
                verification.attempts += 1
                verification.save(update_fields=['attempts'])
                return JsonResponse({'error': 'Invalid verification code.'}, status=400)

            email = destination if mode == 'email' else ''
            user = User.objects.create_user(username=username, email=email, password=password)
            profile = ensure_profile(user)
            profile.phone = destination if mode == 'phone' else None
            profile.preferred_language = language
            if mode == 'email':
                profile.email_verified_at = now
            else:
                profile.phone_verified_at = now
            profile.save(
                update_fields=['phone', 'preferred_language', 'email_verified_at', 'phone_verified_at']
            )
            verification.used = True
            verification.save(update_fields=['used'])
    except IntegrityError:
        return JsonResponse({'error': 'This account information is already in use.'}, status=409)

    login(request, user)
    return JsonResponse({'user': user_json(user)}, status=201)


@django.views.decorators.http.require_GET
@auth_required
def account_summary(request):
    profile=ensure_profile(request.user)
    return JsonResponse({
        'account_code':profile.account_code,
        'is_verified':profile.is_verified,
        'verification_requested':profile.verification_requested,
        'balances':{'trading':'0.00','spot':'0.00','finance':'0.00','loan':'0.00','total':'0.00'},
        'mode':'sandbox',
    })


@django.views.decorators.http.require_POST
@auth_required
def verification_request(request):
    profile=ensure_profile(request.user)
    if not profile.is_verified:
        profile.verification_requested=True
        profile.save(update_fields=['verification_requested'])
    return JsonResponse({'ok':True,'is_verified':profile.is_verified,'verification_requested':profile.verification_requested})


@django.views.decorators.http.require_POST
@auth_required
def change_password(request):
    data=body(request); current=str(data.get('current_password','')); new=str(data.get('new_password',''))
    if not request.user.check_password(current):return JsonResponse({'error':'Current password is incorrect.'},status=400)
    try:validate_password(new,request.user)
    except ValidationError as exc:return JsonResponse({'error':' '.join(exc.messages)},status=400)
    request.user.set_password(new);request.user.save(update_fields=['password']);update_session_auth_hash(request,request.user)
    return JsonResponse({'ok':True})


@django.views.decorators.http.require_http_methods(['GET','POST'])
@auth_required
def demo_orders(request):
    if request.method=='GET':
        orders=DemoOrder.objects.filter(user=request.user)[:100]
        return JsonResponse({'orders':[{'id':o.id,'market_code':o.market_code,'category':o.category,'mode':o.mode,'duration':o.duration,'investment':str(o.investment),'created_at':o.created_at.isoformat()} for o in orders]})
    data=body(request); market_code=str(data.get('market_code','')).strip()[:32]; category=str(data.get('category','')).lower(); mode=str(data.get('mode','')).lower()
    try:duration=int(data.get('duration',60)); investment=Decimal(str(data.get('investment','0')))
    except (ValueError,TypeError,InvalidOperation):return JsonResponse({'error':'Invalid demo order values.'},status=400)
    if not market_code or category not in ALLOWED_CATEGORIES or mode not in ALLOWED_MODES:return JsonResponse({'error':'Invalid demo market selection.'},status=400)
    if duration not in {60,90,120,180}:return JsonResponse({'error':'Invalid demo duration.'},status=400)
    if investment<=0 or investment>Decimal('10000000'):return JsonResponse({'error':'Demo amount is out of range.'},status=400)
    order=DemoOrder.objects.create(user=request.user,market_code=market_code,category=category,mode=mode,duration=duration,investment=investment)
    return JsonResponse({'order':{'id':order.id,'status':'simulated'}},status=201)


@django.views.decorators.http.require_GET
@staff_required
def admin_users(request):
    users=User.objects.select_related('profile').order_by('-date_joined')[:1000]
    return JsonResponse({'users':[user_json(u) for u in users]})


@django.views.decorators.http.require_GET
@staff_required
def admin_overview(request):
    total=User.objects.count(); suspended=Profile.objects.filter(is_suspended=True).count(); verified=Profile.objects.filter(is_verified=True).count()
    return JsonResponse({'total_users':total,'active_users':max(0,total-suspended),'suspended_users':suspended,'verified_users':verified,'demo_orders':DemoOrder.objects.count()})


@django.views.decorators.http.require_POST
@staff_required
def admin_suspend(request,user_id):
    try:target=User.objects.get(pk=user_id)
    except User.DoesNotExist:return JsonResponse({'error':'User not found.'},status=404)
    if target.id==request.user.id:return JsonResponse({'error':'You cannot suspend your own administrator account.'},status=400)
    data=body(request);profile=ensure_profile(target);profile.is_suspended=bool(data.get('suspended'));profile.save(update_fields=['is_suspended'])
    return JsonResponse({'user':user_json(target)})


@django.views.decorators.http.require_POST
@staff_required
def admin_verify(request,user_id):
    try:target=User.objects.get(pk=user_id)
    except User.DoesNotExist:return JsonResponse({'error':'User not found.'},status=404)
    data=body(request);profile=ensure_profile(target);profile.is_verified=bool(data.get('verified'));profile.verification_requested=False;profile.save(update_fields=['is_verified','verification_requested'])
    return JsonResponse({'user':user_json(target)})
