from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, SubTaskViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'subtasks', SubTaskViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
