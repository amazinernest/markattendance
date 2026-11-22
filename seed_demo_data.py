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

    # 7. Create Enrolled Students across Multiple Departments
    from attendance_platform.apps.courses.models import Student, CourseEnrolment
    from attendance_platform.apps.attendance.models import AttendanceSession, AttendanceRecord

    sample_roster = [
        # Computer Science
        ("David Adebayo", "CSC/2021/014", "Computer Science", "david.adebayo@student.edu"),
        ("Fatima Al-Mansoor", "CSC/2021/029", "Computer Science", "fatima@student.edu"),
        ("Chinedu Eze", "CSC/2021/045", "Computer Science", "chinedu@student.edu"),
        # Software Engineering
        ("Amara Okafor", "SEN/2021/008", "Software Engineering", "amara.okafor@student.edu"),
        ("Tunde Bakare", "SEN/2021/022", "Software Engineering", "tunde.bakare@student.edu"),
        ("Zainab Yusuf", "SEN/2021/037", "Software Engineering", "zainab@student.edu"),
        # Electrical Engineering
        ("Michael Faraday", "EEE/2021/011", "Electrical Engineering", "faraday@student.edu"),
        ("Kelechi Iheanacho", "EEE/2021/033", "Electrical Engineering", "kelechi@student.edu"),
        ("Blessing Mensah", "EEE/2021/064", "Electrical Engineering", "blessing.m@student.edu"),
        # Mechanical Engineering
        ("Samuel Morse", "MEE/2021/005", "Mechanical Engineering", "morse@student.edu"),
        ("Ngozi Chimamanda", "MEE/2021/041", "Mechanical Engineering", "ngozi.c@student.edu"),
        ("Ibrahim Danjuma", "MEE/2021/078", "Mechanical Engineering", "ibrahim@student.edu"),
    ]

    for name, matric, dept, mail in sample_roster:
        student, _ = Student.objects.get_or_create(
            institution=inst,
            matric_number=matric,
            defaults={"name": name, "department": dept, "email": mail}
        )
        CourseEnrolment.objects.get_or_create(
            course=course,
            student=student,
            defaults={"department": dept}
        )

    course.participating_departments = "Computer Science, Software Engineering, Electrical Engineering, Mechanical Engineering"
    course.expected_population = course.enrolments.count()
    course.save()
    print(f"Enrolled {course.enrolled_count} students across 4 departments into {course.code}")

    # 8. Create Sample Attendance Sessions
    att_session1, _ = AttendanceSession.objects.get_or_create(
        course=course,
        title="Lecture 1: Architectural Patterns & Clean Architecture",
        defaults={
            "session_date": date(2026, 10, 15),
            "location_name": "Auditorium B, Science Complex",
            "is_active": False,
        }
    )

    att_session2, _ = AttendanceSession.objects.get_or_create(
        course=course,
        title="Lecture 2: Microservices & Domain-Driven Design",
        defaults={
            "session_date": date(2026, 10, 22),
            "location_name": "Hall 4, Computing Faculty",
            "is_active": True,
        }
    )

    # Seed attendance records for session 1 (10 attended, 2 missed)
    for name, matric, dept, mail in sample_roster[:10]:
        AttendanceRecord.objects.get_or_create(
            session=att_session1,
            matric_number=matric,
            defaults={"student_name": name, "student_email": mail, "status": AttendanceRecord.Status.PRESENT}
        )

    # Seed attendance records for session 2 (8 attended)
    for name, matric, dept, mail in sample_roster[:8]:
        AttendanceRecord.objects.get_or_create(
            session=att_session2,
            matric_number=matric,
            defaults={"student_name": name, "student_email": mail, "status": AttendanceRecord.Status.PRESENT}
        )

    print("Sample attendance records seeded successfully.")

if __name__ == '__main__':
    seed()
