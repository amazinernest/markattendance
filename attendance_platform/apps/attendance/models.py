import io
import uuid
import base64
import qrcode
from django.db import models
from django.utils import timezone
from django.urls import reverse
from attendance_platform.apps.courses.models import Course


class AttendanceSession(models.Model):
    """An attendance session opened by a lecturer for a specific class meeting."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance_sessions')
    title = models.CharField(max_length=255, default='Lecture Attendance', help_text='e.g. Lecture 1: Architecture & Design')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, help_text='Secure check-in token')
    session_date = models.DateField(default=timezone.now)
    start_time = models.TimeField(default=timezone.now)
    end_time = models.TimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, help_text='Whether students can currently check in')
    location_name = models.CharField(max_length=255, blank=True, help_text='e.g. Science Lecture Theatre 2')
    allow_late = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-session_date', '-created_at']

    def __str__(self):
        return f"{self.course.code} – {self.title} ({self.session_date})"

    def get_checkin_url(self, request=None):
        relative_url = reverse('attendance:student_checkin', kwargs={'token': str(self.token)})
        if request:
            return request.build_absolute_uri(relative_url)
        return relative_url

    def get_qr_code_base64(self, checkin_url):
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=2,
        )
        qr.add_data(checkin_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#0f172a", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode()

    @property
    def total_attended(self):
        return self.records.count()


class AttendanceRecord(models.Model):
    """An individual student attendance record for a session."""
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        LATE = 'LATE', 'Late'
        EXCUSED = 'EXCUSED', 'Excused'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    student_name = models.CharField(max_length=255)
    matric_number = models.CharField(max_length=100)
    student_email = models.EmailField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    checked_in_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-checked_in_at']
        unique_together = ('session', 'matric_number')

    def __str__(self):
        return f"{self.student_name} ({self.matric_number}) - {self.session.course.code}"
