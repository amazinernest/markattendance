from django.urls import path, include
from django.contrib import admin


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('attendance_platform.apps.frontend.urls', namespace='frontend')),
    path('accounts/', include('attendance_platform.apps.accounts.urls', namespace='accounts')),
    path('institutions/', include('attendance_platform.apps.institutions.urls', namespace='institutions')),
    path('academics/', include('attendance_platform.apps.academics.urls', namespace='academics')),
    path('courses/', include('attendance_platform.apps.courses.urls', namespace='courses')),
    path('attendance/', include('attendance_platform.apps.attendance.urls', namespace='attendance')),
    path('imports/', include('attendance_platform.apps.imports.urls', namespace='imports')),
    path('reports/', include('attendance_platform.apps.reports.urls', namespace='reports')),
    path('notifications/', include('attendance_platform.apps.notifications.urls', namespace='notifications')),
    path('audit/', include('attendance_platform.apps.audit.urls', namespace='audit')),
]
