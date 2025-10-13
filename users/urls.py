from django.urls import path
from .views import SignUpView, LoginView, UserListView, GoogleAuthView

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('google-auth/', GoogleAuthView.as_view(), name='google-auth'),
    path('', UserListView.as_view(), name='user-list'),
]
