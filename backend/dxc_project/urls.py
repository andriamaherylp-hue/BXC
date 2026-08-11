from pathlib import Path
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path, re_path
from django.views.static import serve


def spa(request, *args, **kwargs):
    index = settings.BASE_DIR / 'static' / 'frontend' / 'index.html'
    if index.exists():
        return HttpResponse(index.read_text(encoding='utf-8'), content_type='text/html')
    return HttpResponse('<h1>Frontend not built</h1><p>Run npm run build in frontend.</p>', status=503)

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    re_path(r'^(?!api/|django-admin/|static/).*$', spa),
]
