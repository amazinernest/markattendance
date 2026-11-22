from django.contrib import admin
from .models import AcademicSession, Semester

@admin.register(AcademicSession)
class AcademicSessionAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date')
    search_fields = ('name',)

@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ('name', 'session', 'order')
    list_filter = ('session',)
    search_fields = ('name',)
