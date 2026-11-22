from django.db import models
import uuid
from django.conf import settings
from attendance_platform.apps.institutions.models import Institution
from attendance_platform.apps.accounts.models import CustomUser
from attendance_platform.apps.academics.models import AcademicSession, Semester

class Course(models.Model):
    """Course definition as per specification"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='courses')
    faculty = models.CharField(max_length=255, blank=True)  # could be FK later
    department = models.CharField(max_length=255, blank=True)  # could be FK later
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.PROTECT, related_name='courses')
    semester = models.ForeignKey(Semester, on_delete=models.PROTECT, related_name='courses')
    level = models.CharField(max_length=50, blank=True)
    lecturer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': CustomUser.Role.LECTURER}, related_name='courses')
    expected_population = models.PositiveIntegerField(default=0)
    attendance_threshold = models.DecimalField(max_digits=5, decimal_places=2, help_text='percentage', default=75.00)
    schedule = models.CharField(max_length=255, blank=True, help_text='Optional class schedule description')
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['code']
        unique_together = ('institution', 'code')

    def __str__(self):
        return f"{self.code} - {self.title}"