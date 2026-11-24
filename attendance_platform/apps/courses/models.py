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

    def add_department(self, dept_name):
        """Add a department to participating_departments if not present."""
        dept = dept_name.strip()
        if not dept:
            return False
        current = [d.strip() for d in self.participating_departments.split(',') if d.strip()]
        if not any(d.lower() == dept.lower() for d in current):
            current.append(dept)
            self.participating_departments = ", ".join(current)
            if not self.department:
                self.department = dept
            self.save(update_fields=['participating_departments', 'department', 'updated_at'])
            return True
        return False

    def rename_department(self, old_name, new_name):
        """Rename an existing participating department across course config and enrolled students."""
        old_clean = old_name.strip()
        new_clean = new_name.strip()
        if not old_clean or not new_clean or old_clean.lower() == new_clean.lower():
            return 0

        # 1. Update participating_departments list
        current = [d.strip() for d in self.participating_departments.split(',') if d.strip()]
        new_list = []
        replaced = False
        for d in current:
            if d.lower() == old_clean.lower():
                if not replaced:
                    new_list.append(new_clean)
                    replaced = True
            else:
                new_list.append(d)
        if not replaced:
            new_list.append(new_clean)
        # Deduplicate preserving order
        seen = set()
        deduped = []
        for d in new_list:
            if d.lower() not in seen:
                seen.add(d.lower())
                deduped.append(d)
        self.participating_departments = ", ".join(deduped)

        # 2. Update primary department if it matched
        if self.department and self.department.strip().lower() == old_clean.lower():
            self.department = new_clean

        self.save(update_fields=['participating_departments', 'department', 'updated_at'])

        # 3. Update enrolled students' departments in this course
        updated_enrolments = self.enrolments.filter(department__iexact=old_clean).update(department=new_clean)

        # 4. Update student records in institution if they matched
        Student.objects.filter(institution=self.institution, department__iexact=old_clean).update(department=new_clean)

        return updated_enrolments

    def remove_department(self, dept_name, action='reassign', target_dept='General'):
        """
        Remove a participating department from this course.
        action: 'reassign' (reassign enrolled students to target_dept) or 'remove' (delete enrolments for this course)
        """
        clean_name = dept_name.strip()
        if not clean_name:
            return 0

        # 1. Remove from participating_departments
        current = [d.strip() for d in self.participating_departments.split(',') if d.strip()]
        remaining = [d for d in current if d.lower() != clean_name.lower()]
        self.participating_departments = ", ".join(remaining)

        # 2. Update primary department if needed
        if self.department and self.department.strip().lower() == clean_name.lower():
            self.department = remaining[0] if remaining else ""

        self.save(update_fields=['participating_departments', 'department', 'updated_at'])

        # 3. Handle enrolled students
        affected_count = 0
        if action == 'remove':
            deleted_tuple = self.enrolments.filter(department__iexact=clean_name).delete()
            affected_count = deleted_tuple[0]
            self.expected_population = self.enrolments.count()
            self.save(update_fields=['expected_population', 'updated_at'])
        else:
            target = (target_dept or 'General').strip()
            # If target is a real department, ensure it's in participating_departments
            if target and target.lower() not in ['general', 'unassigned']:
                self.add_department(target)
            affected_count = self.enrolments.filter(department__iexact=clean_name).update(department=target)

        return affected_count


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
