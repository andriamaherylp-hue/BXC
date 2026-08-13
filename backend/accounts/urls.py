from django.urls import path
from . import views

urlpatterns = [
    path('auth/csrf/', views.csrf),
    path('auth/me/', views.me),
    path('auth/login/', views.login_view),
    path('auth/logout/', views.logout_view),
    path('auth/register/', views.register),
    path('account/summary/', views.account_summary),
    path('account/verification-request/', views.verification_request),
    path('account/change-password/', views.change_password),
    path('account/funding-requests/', views.funding_requests),
    path('demo/orders/', views.demo_orders),
    path('admin/overview/', views.admin_overview),
    path('admin/users/', views.admin_users),
    path('admin/activity/', views.admin_activity),
    path('admin/clients/create/', views.admin_create_client),
    path('admin/users/<int:user_id>/adjust-balance/', views.admin_adjust_balance),
    path('admin/users/<int:user_id>/add-deposit/', views.admin_add_deposit),
    path('admin/users/<int:user_id>/vip/', views.admin_vip),
    path('admin/users/<int:user_id>/suspend/', views.admin_suspend),
    path('admin/users/<int:user_id>/withdrawal-access/', views.admin_withdrawal_access),
    path('admin/users/<int:user_id>/verify/', views.admin_verify),
    path('admin/users/<int:user_id>/delete/', views.admin_delete_client),
    path('admin/funding/<int:request_id>/review/', views.admin_review_funding),
    path('admin/orders/<int:order_id>/close/', views.admin_close_order),
]
