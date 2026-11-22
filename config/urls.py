from django.urls import path, include
from django.contrib import admin


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('attendance_platform.apps.frontend.urls')),

    path('accounts/', include('attendance_platform.apps.accounts.urls')),
    path('institutions/', include('attendance_platform.apps.institutions.urls')),
    path('academics/', include('attendance_platform.apps.academics.urls')),
    path('courses/', include('attendance_platform.apps.courses.urls')),
    path('attendance/', include('attendance_platform.apps.attendance.urls')),
    path('imports/', include('attendance_platform.apps.imports.urls')),
    path('reports/', include('attendance_platform.apps.reports.urls')),
    path('notifications/', include('attendance_platform.apps.notifications.urls')),
    path('audit/', include('attendance_platform.apps.audit.urls')),
]
