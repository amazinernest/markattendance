from django.contrib import admin
from .models import Course

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'institution', 'lecturer', 'academic_session', 'semester')
    search_fields = ('code', 'title')
    list_filter = ('institution', 'academic_session', 'semester')
