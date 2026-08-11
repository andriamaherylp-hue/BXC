import json, re, secrets
from datetime import timedelta
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from functools import wraps
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST
from django.contrib.auth.hashers import make_password, check_password
from .models import Profile, VerificationCode
from .sms import send_sms

User=get_user_model()
PHONE_RE=re.compile(r'^\+[1-9]\d{6,14}$')

def body(request):
    try:return json.loads(request.body or '{}')
    except json.JSONDecodeError:return {}

def user_json(user):
    profile,_=Profile.objects.get_or_create(user=user)
    return {'id':user.id,'username':user.username,'email':user.email,'phone':profile.phone,'preferred_language':profile.preferred_language,'is_staff':user.is_staff,'is_suspended':profile.is_suspended,'date_joined':user.date_joined.isoformat()}

@require_GET
def csrf(request): return JsonResponse({'csrfToken':get_token(request)})

@require_GET
def me(request):
    if not request.user.is_authenticated:return JsonResponse({'error':'Authentication required.'},status=401)
    return JsonResponse({'user':user_json(request.user)})

@require_POST
def login_view(request):
    data=body(request); username=str(data.get('username','')).strip(); password=str(data.get('password',''))
    user=authenticate(request,username=username,password=password)
    if not user:return JsonResponse({'error':'Invalid username or password.'},status=400)
    profile,_=Profile.objects.get_or_create(user=user)
    if profile.is_suspended:return JsonResponse({'error':'This account is suspended. Contact support.'},status=403)
    login(request,user); return JsonResponse({'user':user_json(user)})

@require_POST
def logout_view(request): logout(request); return JsonResponse({'ok':True})

def normalize_destination(mode,destination):
    destination=destination.strip()
    if mode=='email':
        if '@' not in destination or len(destination)>254: raise ValueError('Enter a valid email address.')
        return destination.lower()
    if mode=='phone':
        destination=re.sub(r'[\s()-]','',destination)
        if not PHONE_RE.match(destination): raise ValueError('Enter a valid international phone number.')
        return destination
    raise ValueError('Invalid registration mode.')

@require_POST
def request_code(request):
    data=body(request); mode=str(data.get('mode','')); destination=str(data.get('destination',''))
    try: destination=normalize_destination(mode,destination)
    except ValueError as exc:return JsonResponse({'error':str(exc)},status=400)
    recent=VerificationCode.objects.filter(channel=mode,destination=destination,created_at__gte=timezone.now()-timedelta(seconds=60)).exists()
    if recent:return JsonResponse({'error':'Please wait one minute before requesting another code.'},status=429)
    code=f'{secrets.randbelow(900000)+100000}'
    VerificationCode.objects.create(channel=mode,destination=destination,code_hash=make_password(code),expires_at=timezone.now()+timedelta(minutes=10))
    if mode=='email':send_mail('Your DXC verification code',f'Your verification code is {code}. It expires in 10 minutes.',settings.DEFAULT_FROM_EMAIL,[destination],fail_silently=False)
    else:send_sms(destination,f'Your DXC verification code is {code}. It expires in 10 minutes.')
    response={'ok':True}
    if settings.DEBUG:response['dev_code']=code
    return JsonResponse(response)

@require_POST
def register(request):
    data=body(request); mode=str(data.get('mode','')); username=str(data.get('username','')).strip(); password=str(data.get('password','')); confirm=str(data.get('confirm_password','')); code=str(data.get('code','')).strip(); language=str(data.get('preferred_language','en'))[:12]
    try: destination=normalize_destination(mode,str(data.get('destination','')))
    except ValueError as exc:return JsonResponse({'error':str(exc)},status=400)
    if not username:return JsonResponse({'error':'Username is required.'},status=400)
    if password!=confirm:return JsonResponse({'error':'Passwords do not match.'},status=400)
    if User.objects.filter(username__iexact=username).exists():return JsonResponse({'error':'Username already exists.'},status=409)
    if mode=='email' and User.objects.filter(email__iexact=destination).exists():return JsonResponse({'error':'Email already exists.'},status=409)
    if mode=='phone' and Profile.objects.filter(phone=destination).exists():return JsonResponse({'error':'Phone number already exists.'},status=409)
    try: validate_password(password)
    except ValidationError as exc:return JsonResponse({'error':' '.join(exc.messages)},status=400)
    verification=VerificationCode.objects.filter(channel=mode,destination=destination,used=False).order_by('-created_at').first()
    if not verification or verification.expires_at<timezone.now():return JsonResponse({'error':'Verification code is missing or expired.'},status=400)
    if verification.attempts>=5:return JsonResponse({'error':'Too many verification attempts. Request a new code.'},status=429)
    if not check_password(code,verification.code_hash):
        verification.attempts+=1; verification.save(update_fields=['attempts']); return JsonResponse({'error':'Invalid verification code.'},status=400)
    email=destination if mode=='email' else ''
    user=User.objects.create_user(username=username,email=email,password=password)
    profile,_=Profile.objects.get_or_create(user=user); profile.phone=destination if mode=='phone' else None; profile.preferred_language=language; profile.save()
    verification.used=True; verification.save(update_fields=['used'])
    login(request,user); return JsonResponse({'user':user_json(user)},status=201)

def staff_required(view):
    @wraps(view)
    def wrapped(request,*args,**kwargs):
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({'error':'Staff access required.'},status=403)
        return view(request,*args,**kwargs)
    return wrapped

@require_GET
@staff_required
def admin_users(request):
    users=User.objects.select_related('profile').order_by('-date_joined')[:1000]
    return JsonResponse({'users':[user_json(u) for u in users]})

@require_POST
@staff_required
def admin_suspend(request,user_id):
    try: target=User.objects.get(pk=user_id)
    except User.DoesNotExist:return JsonResponse({'error':'User not found.'},status=404)
    if target.id==request.user.id:return JsonResponse({'error':'You cannot suspend your own administrator account.'},status=400)
    data=body(request); profile,_=Profile.objects.get_or_create(user=target); profile.is_suspended=bool(data.get('suspended')); profile.save(update_fields=['is_suspended'])
    return JsonResponse({'user':user_json(target)})
