from django.urls import path
from . import views

app_name = 'courses'

urlpatterns = [
    path('', views.course_list, name='course_list'),
    path('create/', views.course_create, name='course_create'),
    path('<uuid:pk>/', views.course_detail, name='course_detail'),
    path('<uuid:pk>/update/', views.course_update, name='course_update'),
    path('<uuid:pk>/delete/', views.course_delete, name='course_delete'),
    path('<uuid:pk>/departments/add/', views.course_department_add, name='department_add'),
    path('<uuid:pk>/departments/edit/', views.course_department_edit, name='department_edit'),
    path('<uuid:pk>/departments/remove/', views.course_department_remove, name='department_remove'),
]
