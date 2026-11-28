import uuid
import datetime
from django.test import TestCase, Client
from django.urls import reverse
from django.template.context import BaseContext

# Compatibility patch for Python 3.14 test context copying
def _safe_context_copy(self):
    obj = self.__class__.__new__(self.__class__)
    obj.dicts = self.dicts[:]
    return obj
BaseContext.__copy__ = _safe_context_copy

from attendance_platform.apps.accounts.models import CustomUser
from attendance_platform.apps.institutions.models import Institution
from attendance_platform.apps.academics.models import AcademicSession, Semester
from attendance_platform.apps.courses.models import Course, Student, CourseEnrolment
from attendance_platform.apps.attendance.models import AttendanceSession, AttendanceRecord


class ComprehensiveSystemTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.institution = Institution.objects.create(name="Federal University", domain="feduni.edu.ng")
        self.lecturer = CustomUser.objects.create_user(
            email="lecturer@feduni.edu.ng",
            password="testpassword123",
            role=CustomUser.Role.LECTURER,
            first_name="Prof",
            last_name="Johnson",
            institution=self.institution,
        )
        self.student_user = CustomUser.objects.create_user(
            email="student@feduni.edu.ng",
            password="testpassword123",
            role=CustomUser.Role.STUDENT,
            first_name="John",
            last_name="Doe",
            institution=self.institution,
        )
        self.session_academic = AcademicSession.objects.create(
            name="2024/2025",
            start_date=datetime.date(2024, 9, 1),
            end_date=datetime.date(2025, 7, 31)
        )
        self.semester = Semester.objects.create(
            session=self.session_academic,
            name="First Semester",
            order=1
        )
        self.course = Course.objects.create(
            title="Introduction to Computer Science",
            code="CSC 101",
            institution=self.institution,
            academic_session=self.session_academic,
            semester=self.semester,
            lecturer=self.lecturer,
            department="Computer Science",
            participating_departments="Computer Science, Software Eng",
            attendance_threshold=75.0,
            expected_population=100
        )
        self.student = Student.objects.create(
            institution=self.institution,
            name="Alice Smith",
            matric_number="CSC/2024/001",
            department="Computer Science"
        )
        self.enrolment = CourseEnrolment.objects.create(
            course=self.course,
            student=self.student,
            department="Computer Science"
        )
        self.session = AttendanceSession.objects.create(
            course=self.course,
            title="Lecture 1",
            topic="Binary Arithmetic",
            location_name="Lecture Theatre A",
            enable_geofence=True,
            venue_latitude=6.5244,
            venue_longitude=3.3792,
            geofence_radius_meters=100,
            enforce_device_lock=True,
            strict_anti_spoofing=True,
            is_active=True
        )

    def test_public_pages(self):
        """Test all public static pages return HTTP 200."""
        routes = [
            'frontend:home',
            'frontend:features',
            'frontend:how_it_works',
            'frontend:exam_compliance',
            'frontend:pricing',
            'frontend:privacy',
            'frontend:terms',
            'accounts:login',
            'accounts:register',
        ]
        for route_name in routes:
            resp = self.client.get(reverse(route_name))
            self.assertEqual(resp.status_code, 200, f"Route {route_name} failed with {resp.status_code}")

    def test_authenticated_dashboard(self):
        self.client.login(email="lecturer@feduni.edu.ng", password="testpassword123")
        resp = self.client.get(reverse('frontend:dashboard'))
        self.assertEqual(resp.status_code, 200)

    def test_course_crud(self):
        self.client.login(email="lecturer@feduni.edu.ng", password="testpassword123")
        
        # Course list
        resp = self.client.get(reverse('courses:course_list'))
        self.assertEqual(resp.status_code, 200)

        # Course detail
        resp = self.client.get(reverse('courses:course_detail', kwargs={'pk': self.course.pk}))
        self.assertEqual(resp.status_code, 200)

        # Course create
        resp = self.client.post(reverse('courses:course_create'), {
            'code': 'MTH 101',
            'title': 'General Mathematics',
            'department': 'Mathematics',
            'attendance_threshold': 75,
            'institution': self.institution.pk,
            'academic_session': self.session_academic.pk,
            'semester': self.semester.pk,
        })
        self.assertIn(resp.status_code, [200, 302])

    def test_attendance_session_flow(self):
        self.client.login(email="lecturer@feduni.edu.ng", password="testpassword123")

        # Session Detail
        resp = self.client.get(reverse('attendance:session_detail', kwargs={'session_id': self.session.id}))
        self.assertEqual(resp.status_code, 200)

        # Session Print
        resp = self.client.get(reverse('attendance:session_print', kwargs={'session_id': self.session.id}))
        self.assertEqual(resp.status_code, 200)

        # Student Lookup
        resp = self.client.get(reverse('attendance:student_lookup', kwargs={'token': self.session.token}), {'matric': 'CSC/2024/001'})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get('found'))

        # Student Check-in GET
        checkin_url = reverse('attendance:student_checkin', kwargs={'token': self.session.token})
        resp = self.client.get(checkin_url)
        self.assertEqual(resp.status_code, 200)

        # Student Check-in POST (successful within venue proximity)
        post_data = {
            'matric_number': 'CSC/2024/001',
            'student_name': 'Alice Smith',
            'latitude': '6.524410',
            'longitude': '3.379210',
            'accuracy': '15',
            'device_fingerprint': 'device_test_123',
        }
        resp = self.client.post(checkin_url, post_data)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(AttendanceRecord.objects.filter(session=self.session).count(), 1)

        # Second check-in with same device for different student should be blocked by device lock
        post_data_proxy = {
            'matric_number': 'CSC/2024/002',
            'student_name': 'Bob Jones',
            'latitude': '6.524410',
            'longitude': '3.379210',
            'accuracy': '15',
            'device_fingerprint': 'device_test_123',
        }
        resp = self.client.post(checkin_url, post_data_proxy)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(AttendanceRecord.objects.filter(session=self.session).count(), 1)  # Still 1, proxy rejected

    def test_reports_views_and_exports(self):
        self.client.login(email="lecturer@feduni.edu.ng", password="testpassword123")

        # 1. Reports Index
        resp = self.client.get(reverse('reports:index'))
        self.assertEqual(resp.status_code, 200)

        # 2. Course Excel export
        resp = self.client.get(reverse('reports:export_excel', kwargs={'course_id': self.course.id}))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

        # 3. Course CSV export
        resp = self.client.get(reverse('reports:export_csv', kwargs={'course_id': self.course.id}))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'text/csv')

        # 4. Session Report view
        resp = self.client.get(reverse('reports:session_report', kwargs={'session_id': self.session.id}))
        self.assertEqual(resp.status_code, 200)

        # 5. Session Excel export (verifies openpyxl and re module fix)
        resp = self.client.get(reverse('reports:export_session_excel', kwargs={'session_id': self.session.id}))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

        # 6. Session CSV export
        resp = self.client.get(reverse('reports:export_session_csv', kwargs={'session_id': self.session.id}))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'text/csv')

    def test_import_views(self):
        self.client.login(email="lecturer@feduni.edu.ng", password="testpassword123")

        # Import form view
        resp = self.client.get(reverse('imports:upload'))
        self.assertEqual(resp.status_code, 200)

        # Template downloads
        for fmt in ['csv', 'excel']:
            resp = self.client.get(reverse('imports:download_template', kwargs={'format_type': fmt}))
            self.assertEqual(resp.status_code, 200)

        # Upload class list with chosen department
        from django.core.files.uploadedfile import SimpleUploadedFile
        csv_content = b"Matric Number,Student Name,Email\nCSC/2024/010,David Mark,david@feduni.edu.ng\nCSC/2024/011,Grace Ojo,grace@feduni.edu.ng\n"
        upload_file = SimpleUploadedFile("roster.csv", csv_content, content_type="text/csv")
        upload_url = reverse('imports:upload')
        post_data = {
            'course_id': str(self.course.id),
            'department': 'Mechanical Engineering',
            'class_files': [upload_file],
        }
        resp = self.client.post(upload_url, post_data)
        self.assertEqual(resp.status_code, 200)
        # Verify students created with the chosen department
        david = Student.objects.filter(matric_number='CSC/2024/010').first()
        self.assertIsNotNone(david)
        self.assertEqual(david.department, 'Mechanical Engineering')
        self.course.refresh_from_db()
        self.assertIn('Mechanical Engineering', self.course.all_departments)

    def test_geofence_blocking_and_venue_update(self):
        self.client.login(email="lecturer@feduni.edu.ng", password="testpassword123")
        checkin_url = reverse('attendance:student_checkin', kwargs={'token': self.session.token})

        # Faraway checkin (e.g. at lat 8.0, lon 4.0 - ~170km away from 6.52, 3.37)
        post_data_faraway = {
            'matric_number': 'CSC/2024/099',
            'student_name': 'Faraway Student',
            'latitude': '8.000000',
            'longitude': '4.000000',
            'accuracy': '10',
            'device_fingerprint': 'device_faraway_99',
        }
        resp = self.client.post(checkin_url, post_data_faraway)
        self.assertEqual(resp.status_code, 200)
        # Should NOT create record because student is out of range
        self.assertFalse(AttendanceRecord.objects.filter(matric_number='CSC/2024/099').exists())

        # Update venue coordinates
        update_url = reverse('attendance:update_session_venue', kwargs={'session_id': self.session.id})
        resp = self.client.post(update_url, {
            'venue_latitude': '6.5255',
            'venue_longitude': '3.3788',
            'geofence_radius_meters': '150',
            'location_name': 'Auditorium 2',
        })
        self.assertIn(resp.status_code, [200, 302])
        self.session.refresh_from_db()
        self.assertEqual(self.session.geofence_radius_meters, 150)
        self.assertEqual(self.session.location_name, 'Auditorium 2')

    def test_manual_checkin_and_toggle_and_delete(self):
        self.client.login(email="lecturer@feduni.edu.ng", password="testpassword123")

        # 1. Manual Roll-call checkin (supports single or multiple batch matrics)
        manual_url = reverse('attendance:manual_checkin', kwargs={'session_id': self.session.id})
        resp = self.client.post(manual_url, {
            'matric_numbers': 'CSC/2024/001, CSC/2024/055, CSC/2024/056'
        })
        self.assertEqual(resp.status_code, 302)
        rec = AttendanceRecord.objects.filter(session=self.session, matric_number='CSC/2024/001').first()
        self.assertIsNotNone(rec)
        self.assertEqual(rec.checkin_method, AttendanceRecord.CheckinMethod.LECTURER_MANUAL)
        # Check newly auto-enrolled student
        rec2 = AttendanceRecord.objects.filter(session=self.session, matric_number='CSC/2024/055').first()
        self.assertIsNotNone(rec2)
        self.assertTrue(CourseEnrolment.objects.filter(course=self.course, student__matric_number='CSC/2024/055').exists())

        # Test Geofence toggle via update_session_venue
        venue_url = reverse('attendance:update_session_venue', kwargs={'session_id': self.session.id})
        self.client.post(venue_url, {'toggle_geofence': '1'})
        self.session.refresh_from_db()
        self.assertFalse(self.session.enable_geofence)

        # 2. Toggle session
        toggle_url = reverse('attendance:session_toggle', kwargs={'session_id': self.session.id})
        resp = self.client.get(toggle_url)
        self.assertEqual(resp.status_code, 302)
        self.session.refresh_from_db()
        self.assertFalse(self.session.is_active)

        # 3. Session Delete View & Post
        delete_url = reverse('attendance:session_delete', kwargs={'session_id': self.session.id})
        resp = self.client.get(delete_url)
        self.assertEqual(resp.status_code, 200)
        resp = self.client.post(delete_url)
        self.assertEqual(resp.status_code, 302)
        self.assertFalse(AttendanceSession.objects.filter(id=self.session.id).exists())

        # 4. Course Delete View & Post
        course_delete_url = reverse('courses:course_delete', kwargs={'pk': self.course.pk})
        resp = self.client.get(course_delete_url)
        self.assertEqual(resp.status_code, 200)
        resp = self.client.post(course_delete_url)
        self.assertEqual(resp.status_code, 302)
        self.assertFalse(Course.objects.filter(pk=self.course.pk).exists())

    def test_course_department_management(self):
        self.client.login(email="lecturer@feduni.edu.ng", password="testpassword123")

        # 1. Add Department
        add_url = reverse('courses:department_add', kwargs={'pk': self.course.pk})
        resp = self.client.post(add_url, {'department_name': 'Civil Engineering'})
        self.assertEqual(resp.status_code, 302)
        self.course.refresh_from_db()
        self.assertIn('Civil Engineering', self.course.all_departments)

        # 2. Edit / Rename Department (e.g. fix typo from "Software Eng" to "Software Engineering")
        # Enrol a student under "Software Eng"
        student_se = Student.objects.create(
            institution=self.institution,
            name="Bob Software",
            matric_number="SE/2024/005",
            department="Software Eng"
        )
        enr_se = CourseEnrolment.objects.create(
            course=self.course,
            student=student_se,
            department="Software Eng"
        )

        edit_url = reverse('courses:department_edit', kwargs={'pk': self.course.pk})
        resp = self.client.post(edit_url, {
            'old_department': 'Software Eng',
            'new_department': 'Software Engineering',
        })
        self.assertEqual(resp.status_code, 302)
        self.course.refresh_from_db()
        self.assertIn('Software Engineering', self.course.all_departments)
        self.assertNotIn('Software Eng', self.course.all_departments)

        # Verify enrolled student's department was updated
        enr_se.refresh_from_db()
        self.assertEqual(enr_se.department, 'Software Engineering')

        # 3. Remove Department GET confirmation
        remove_url = reverse('courses:department_remove', kwargs={'pk': self.course.pk})
        resp = self.client.get(f"{remove_url}?department=Civil%20Engineering")
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'Civil Engineering')

        # 4. Remove Department with student reassignment
        resp = self.client.post(remove_url, {
            'department': 'Civil Engineering',
            'student_action': 'reassign',
            'target_department': 'General',
        })
        self.assertEqual(resp.status_code, 302)
        self.course.refresh_from_db()
        self.assertNotIn('Civil Engineering', self.course.all_departments)

        # 5. Remove Department with student deletion
        resp = self.client.post(remove_url, {
            'department': 'Software Engineering',
            'student_action': 'remove',
        })
        self.assertEqual(resp.status_code, 302)
        self.course.refresh_from_db()
        self.assertNotIn('Software Engineering', self.course.all_departments)
        self.assertFalse(CourseEnrolment.objects.filter(id=enr_se.id).exists())
