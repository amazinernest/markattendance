from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('', views.reports_index, name='index'),
    path('courses/<uuid:course_id>/export/excel/', views.export_excel_report, name='export_excel'),
    path('courses/<uuid:course_id>/export/csv/', views.export_csv_report, name='export_csv'),
    path('session/<uuid:session_id>/', views.session_report, name='session_report'),
    path('session/<uuid:session_id>/export/excel/', views.export_session_excel, name='export_session_excel'),
    path('session/<uuid:session_id>/export/csv/', views.export_session_csv, name='export_session_csv'),
]
