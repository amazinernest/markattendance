from django.contrib import admin
from .models import AttendanceSession, AttendanceRecord

class AttendanceRecordInline(admin.TabularInline):
    model = AttendanceRecord
    extra = 0
    readonly_fields = ('student_name', 'matric_number', 'student_email', 'status', 'ip_address', 'checked_in_at')

@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ('course', 'title', 'session_date', 'start_time', 'is_active', 'total_attended')
    list_filter = ('is_active', 'session_date', 'course')
    search_fields = ('title', 'course__code', 'course__title')
    inlines = [AttendanceRecordInline]

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('student_name', 'matric_number', 'session', 'status', 'checked_in_at')
    list_filter = ('status', 'session__course')
    search_fields = ('student_name', 'matric_number', 'student_email')
