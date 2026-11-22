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
    title = models.CharField(max_length=255, default='Lecture Attendance', help_text='e.g. Lecture 1')
    topic = models.CharField(max_length=255, blank=True, default='', help_text='Specific topic taught in this class meeting, e.g. Psychological Measurement & Reliability')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, help_text='Secure check-in token')
    session_date = models.DateField(default=timezone.now)
    start_time = models.TimeField(default=timezone.now)
    end_time = models.TimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, help_text='Whether students can currently check in')
    location_name = models.CharField(max_length=255, blank=True, default='', help_text='e.g. Science Lecture Theatre 2')
    enable_geofence = models.BooleanField(default=True, help_text='Require students to be physically within classroom radius')
    venue_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, help_text='Classroom GPS Latitude')
    venue_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, help_text='Classroom GPS Longitude')
    geofence_radius_meters = models.PositiveIntegerField(default=100, help_text='Allowed radius in meters from classroom (e.g. 50m, 100m, 150m, 200m)')
    enforce_device_lock = models.BooleanField(default=True, help_text='Block multiple check-ins from the same physical device in this session')
    strict_anti_spoofing = models.BooleanField(default=True, help_text='Require fresh real-time satellite lock, reject mock location and synthetic coords')
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

    @property
    def has_venue_location(self):
        return self.venue_latitude is not None and self.venue_longitude is not None


class AttendanceRecord(models.Model):
    """An individual student attendance record for a session."""
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        LATE = 'LATE', 'Late'
        EXCUSED = 'EXCUSED', 'Excused'

    class CheckinMethod(models.TextChoices):
        QR_SELF = 'QR_SELF', 'QR Code (Self)'
        LECTURER_MANUAL = 'LECTURER_MANUAL', 'Lecturer Manual Roll-Call'
        PEER_SHARED = 'PEER_SHARED', 'Classmate Device'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    student_name = models.CharField(max_length=255)
    matric_number = models.CharField(max_length=100)
    student_email = models.EmailField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)
    checkin_method = models.CharField(max_length=30, choices=CheckinMethod.choices, default=CheckinMethod.QR_SELF)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, help_text="GPS Latitude")
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, help_text="GPS Longitude")
    accuracy_meters = models.FloatField(null=True, blank=True, help_text="GPS Accuracy in meters")
    location_address = models.CharField(max_length=500, blank=True, help_text="Human-readable address or landmark")
    distance_from_venue_meters = models.FloatField(null=True, blank=True, help_text="Calculated distance in meters from classroom venue")
    device_fingerprint = models.CharField(max_length=64, blank=True, db_index=True, help_text="Device signature preventing multi-account proxy marking")
    is_mock_location = models.BooleanField(default=False, help_text="Detected synthetic or spoofed GPS")
    is_geofence_verified = models.BooleanField(default=True, help_text="Whether check-in passed venue proximity verification")
    geofence_status = models.CharField(
        max_length=30,
        default='VERIFIED',
        choices=[
            ('VERIFIED', 'Verified In-Venue'),
            ('OUT_OF_RANGE', 'Out of Range'),
            ('NOT_REQUIRED', 'Not Required'),
            ('NO_GPS', 'GPS Not Captured')
        ]
    )
    checked_in_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-checked_in_at']
        unique_together = ('session', 'matric_number')

    def __str__(self):
        return f"{self.student_name} ({self.matric_number}) - {self.session.course.code}"

    @property
    def has_location(self):
        return self.latitude is not None and self.longitude is not None

    @property
    def location_display(self):
        if self.location_address:
            return self.location_address
        if self.has_location:
            return f"{float(self.latitude):.5f}, {float(self.longitude):.5f}"
        return "No GPS"

    @property
    def google_maps_url(self):
        if self.has_location:
            return f"https://www.google.com/maps?q={self.latitude},{self.longitude}"
        return None
