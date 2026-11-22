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
    faculty = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=255, blank=True)
    participating_departments = models.TextField(
        blank=True,
        default="",
        help_text="Comma-separated departments enrolled in this course (e.g. Computer Science, Mechanical Eng, Electrical Eng)"
    )
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.PROTECT, related_name='courses')
    semester = models.ForeignKey(Semester, on_delete=models.PROTECT, related_name='courses')
    level = models.CharField(max_length=50, blank=True)
    lecturer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': CustomUser.Role.LECTURER},
        related_name='courses'
    )
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

    @property
    def enrolled_count(self):
        return self.enrolments.count()

    @property
    def all_departments(self):
        """Returns distinct list of all departments enrolled or registered in this course."""
        deps = set()
        if self.department:
            deps.add(self.department.strip())
        if self.participating_departments:
            for d in self.participating_departments.split(','):
                d_clean = d.strip()
                if d_clean:
                    deps.add(d_clean)
        # Also include any department from enrolled students
        for d in self.enrolments.values_list('department', flat=True).distinct():
            if d:
                deps.add(d.strip())
        return sorted(list(deps))


class Student(models.Model):
    """Student profile within an institution."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='students')
    name = models.CharField(max_length=255)
    matric_number = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    department = models.CharField(max_length=255, blank=True, help_text="e.g. Computer Science, Civil Eng")
    level = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['matric_number']
        unique_together = ('institution', 'matric_number')

    def __str__(self):
        return f"{self.name} ({self.matric_number})"


class CourseEnrolment(models.Model):
    """Enrolment linking a student to a course section."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrolments')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrolments')
    department = models.CharField(max_length=255, blank=True, help_text="Department at the time of enrolment")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['student__matric_number']
        unique_together = ('course', 'student')

    def __str__(self):
        return f"{self.student.matric_number} enrolled in {self.course.code}"
