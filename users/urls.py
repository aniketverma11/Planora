from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SignUpView, LoginView, UserListView, GoogleAuthView, 
    MicrosoftAuthView, UserManagementViewSet, CurrentUserView,
    VerifyEmailView, ResendVerificationEmailView, CheckVerificationTokenView,
    TestEmailConfigView
)

router = DefaultRouter()
router.register(r"manage", UserManagementViewSet, basename="user-management")

urlpatterns = [
    path("signup/", SignUpView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("google-auth/", GoogleAuthView.as_view(), name="google-auth"),
    path("microsoft-auth/", MicrosoftAuthView.as_view(), name="microsoft-auth"),
    path("current/", CurrentUserView.as_view(), name="current-user"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationEmailView.as_view(), name="resend-verification"),
    path("check-token/", CheckVerificationTokenView.as_view(), name="check-token"),
    path("test-email/", TestEmailConfigView.as_view(), name="test-email"),
    path("", include(router.urls)),
    path("list/", UserListView.as_view(), name="user-list"),
]

