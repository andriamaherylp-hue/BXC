from django.conf import settings
from django.contrib import admin
from django.db import connection
from django.http import HttpResponse, JsonResponse
from django.urls import include, path, re_path


def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
        return JsonResponse({'ok': True, 'database': 'ok'})
    except Exception:
        return JsonResponse({'ok': False, 'database': 'unavailable'}, status=503)


def spa(request, *args, **kwargs):
    index = settings.BASE_DIR / 'static' / 'frontend' / 'index.html'
    if index.exists():
        return HttpResponse(index.read_text(encoding='utf-8'), content_type='text/html')
    return HttpResponse(
        '<h1>Frontend not built</h1><p>Run npm run build in frontend.</p>',
        status=503,
    )


urlpatterns = [
    path('health/', health),
    path('django-admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    re_path(r'^(?!api/|django-admin/|health/|static/).*$', spa),
]
