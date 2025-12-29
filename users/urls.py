# Role de ce fichier: routes auth et gestion des utilisateurs (ADMIN).
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import admin_user_detail, admin_user_password, admin_users, me

urlpatterns = [
    path("api/auth/me/", me),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/admin/users/", admin_users),
    path("api/admin/users/<int:user_id>/", admin_user_detail),
    path("api/admin/users/<int:user_id>/password/", admin_user_password),
]
