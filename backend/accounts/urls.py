from django.urls import path
from . import views
urlpatterns=[
    path('auth/csrf/',views.csrf),path('auth/me/',views.me),path('auth/login/',views.login_view),path('auth/logout/',views.logout_view),
    path('auth/register/request-code/',views.request_code),path('auth/register/',views.register),
    path('admin/users/',views.admin_users),path('admin/users/<int:user_id>/suspend/',views.admin_suspend),
]
