from django.urls import path
from . import views

urlpatterns=[
    path('auth/csrf/',views.csrf),path('auth/me/',views.me),path('auth/login/',views.login_view),path('auth/logout/',views.logout_view),
    path('auth/register/request-code/',views.request_code),path('auth/register/',views.register),
    path('account/summary/',views.account_summary),path('account/verification-request/',views.verification_request),path('account/change-password/',views.change_password),
    path('demo/orders/',views.demo_orders),
    path('admin/overview/',views.admin_overview),path('admin/users/',views.admin_users),path('admin/users/<int:user_id>/suspend/',views.admin_suspend),path('admin/users/<int:user_id>/verify/',views.admin_verify),
]
