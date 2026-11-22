from django.urls import path
from . import views

app_name = 'courses'

urlpatterns = [
    path('', views.course_list, name='course_list'),
    path('create/', views.course_create, name='course_create'),
    path('<uuid:pk>/', views.course_detail, name='course_detail'),
    path('<uuid:pk>/update/', views.course_update, name='course_update'),
]
