from django.urls import path
from .views import SignUpView, LoginView, UserListView

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('', UserListView.as_view(), name='user-list'),
]
