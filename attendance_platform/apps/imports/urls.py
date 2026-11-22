from django.urls import path
from . import views

app_name = 'imports'

urlpatterns = [
    path('', views.import_class_list, name='upload'),
    path('template/<str:format_type>/', views.download_template, name='download_template'),
]
