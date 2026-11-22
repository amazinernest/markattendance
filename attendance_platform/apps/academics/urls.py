from django.urls import path
from . import views

app_name = 'academics'

urlpatterns = [
    path('sessions/', views.session_list, name='session_list'),
    path('sessions/create/', views.session_create, name='session_create'),
    path('sessions/<uuid:session_id>/semesters/', views.semester_list, name='semester_list'),
    path('sessions/<uuid:session_id>/semesters/create/', views.semester_create, name='semester_create'),
]
