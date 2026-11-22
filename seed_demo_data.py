import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from datetime import date
from attendance_platform.apps.accounts.models import CustomUser
from attendance_platform.apps.institutions.models import Institution
from attendance_platform.apps.academics.models import AcademicSession, Semester
from attendance_platform.apps.courses.models import Course

def seed():
    # 1. Create or get Institution
    inst, _ = Institution.objects.get_or_create(
        name="Attendly University",
        defaults={"domain": "attendly.edu"}
    )
    print(f"Institution: {inst.name}")

    # 2. Create Superadmin / Lecturer user
    email = "admin@attendly.edu"
    user, created = CustomUser.objects.get_or_create(
        email=email,
        defaults={
            "first_name": "Admin",
            "last_name": "User",
            "role": CustomUser.Role.SUPERADMIN,
            "is_staff": True,
            "is_superuser": True,
            "institution": inst,
        }
    )
    if created:
        user.set_password("admin123")
        user.save()
        print(f"Created superuser: {email} / admin123")
    else:
        user.set_password("admin123")
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Updated user: {email} / admin123")

    # 3. Create Lecturer user
    lec_email = "lecturer@attendly.edu"
    lecturer, lec_created = CustomUser.objects.get_or_create(
        email=lec_email,
        defaults={
            "first_name": "Dr. Sarah",
            "last_name": "Connor",
            "role": CustomUser.Role.LECTURER,
            "is_staff": True,
            "institution": inst,
        }
    )
    if lec_created:
        lecturer.set_password("lecturer123")
        lecturer.save()
        print(f"Created lecturer: {lec_email} / lecturer123")

    # 4. Create Academic Session
    session, _ = AcademicSession.objects.get_or_create(
        name="2026/2027 Academic Session",
        defaults={
            "start_date": date(2026, 9, 1),
            "end_date": date(2027, 7, 31),
        }
    )
    print(f"Session: {session.name}")

    # 5. Create Semester
    semester, _ = Semester.objects.get_or_create(
        session=session,
        name="First Semester",
        defaults={
            "order": 1,
        }
    )
    print(f"Semester: {semester.name}")

    # 6. Create Course
    course, crs_created = Course.objects.get_or_create(
        code="CSC401",
        defaults={
            "title": "Advanced Software Engineering",
            "description": "Enterprise software design, testing, architectural patterns, and cloud platforms.",
            "institution": inst,
            "faculty": "School of Computing",
            "department": "Computer Science",
            "academic_session": session,
            "semester": semester,
            "level": "400 Level",
            "lecturer": lecturer,
            "expected_population": 85,
            "attendance_threshold": 75.0,
            "schedule": "Tuesdays & Thursdays 10:00 AM - 12:00 PM",
        }
    )
    print(f"Course: {course.code} - {course.title}")

if __name__ == '__main__':
    seed()
