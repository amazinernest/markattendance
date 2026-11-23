from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    path('courses/<uuid:course_id>/start/', views.start_session, name='start_session'),
    path('session/<uuid:session_id>/', views.session_detail, name='session_detail'),
    path('session/<uuid:session_id>/delete/', views.session_delete, name='session_delete'),
    path('session/<uuid:session_id>/print/', views.session_print, name='session_print'),
    path('session/<uuid:session_id>/update-venue/', views.update_session_venue, name='update_session_venue'),
    path('session/<uuid:session_id>/toggle/', views.session_toggle, name='session_toggle'),
    path('session/<uuid:session_id>/manual-checkin/', views.manual_checkin, name='manual_checkin'),
    path('session/<uuid:session_id>/qr/', views.session_qr_image, name='session_qr_image'),
    path('check-in/<uuid:token>/', views.student_checkin, name='student_checkin'),
    path('check-in/<uuid:token>/lookup/', views.student_lookup, name='student_lookup'),
]
