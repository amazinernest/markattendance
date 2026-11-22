from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
from django.contrib import messages
from django.utils import timezone
from django.http import JsonResponse, HttpResponse
from attendance_platform.apps.courses.models import Course, Student
from .models import AttendanceSession, AttendanceRecord


@login_required
def start_session(request, course_id):
    """Start an attendance session for a particular course."""
    course = get_object_or_404(Course, pk=course_id)
    
    if request.method == 'POST':
        title = request.POST.get('title', '').strip() or f"Lecture – {timezone.now().strftime('%b %d, %Y')}"
        location_name = request.POST.get('location_name', '').strip() or (course.schedule or 'Classroom')
        
        session = AttendanceSession.objects.create(
            course=course,
            title=title,
            location_name=location_name,
            session_date=timezone.now().date(),
            start_time=timezone.now().time(),
            is_active=True,
        )
        messages.success(request, f"Live attendance session created for {course.code}!")
        return redirect('attendance:session_detail', session_id=session.id)
    
    # If GET, create with sensible defaults or redirect
    session = AttendanceSession.objects.create(
        course=course,
        title=f"Lecture – {timezone.now().strftime('%b %d, %Y')}",
        location_name=course.schedule or 'Classroom',
        session_date=timezone.now().date(),
        start_time=timezone.now().time(),
        is_active=True,
    )
    messages.success(request, f"Attendance window opened for {course.code}!")
    return redirect('attendance:session_detail', session_id=session.id)


@login_required
def session_detail(request, session_id):
    """Lecturer view displaying live QR Code, link, and student attendees."""
    session = get_object_or_404(AttendanceSession, pk=session_id)
    checkin_url = session.get_checkin_url(request)
    qr_code_b64 = session.get_qr_code_base64(checkin_url)
    records = session.records.all()
    expected = session.course.expected_population or 1
    attendance_rate = round((records.count() / expected) * 100, 1) if expected else 0

    context = {
        'session': session,
        'course': session.course,
        'checkin_url': checkin_url,
        'qr_code_b64': qr_code_b64,
        'records': records,
        'attendance_rate': min(attendance_rate, 100.0),
        'is_localhost': request.get_host().startswith(('127.0.0.1', 'localhost')),
        'local_ip': '192.168.0.112:8000',
    }
    return render(request, 'attendance/session_detail.html', context)


def session_qr_image(request, session_id):
    """Dynamically stream a QR code PNG image for a given target URL."""
    session = get_object_or_404(AttendanceSession, pk=session_id)
    target_url = request.GET.get('url') or session.get_checkin_url(request)
    import qrcode, io
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=2)
    qr.add_data(target_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0f172a", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return HttpResponse(buffer.getvalue(), content_type="image/png")


@login_required
def session_toggle(request, session_id):
    """Toggle session active state (open / close check-ins)."""
    session = get_object_or_404(AttendanceSession, pk=session_id)
    session.is_active = not session.is_active
    if not session.is_active:
        session.end_time = timezone.now().time()
    session.save()
    
    state_str = "opened for check-in" if session.is_active else "closed"
    messages.info(request, f"Attendance session has been {state_str}.")
    return redirect('attendance:session_detail', session_id=session.id)


@never_cache
def student_lookup(request, token):
    """Fast JSON lookup of student details by matric number for this session's course."""
    session = get_object_or_404(AttendanceSession, token=token)
    matric = request.GET.get('matric', '').strip().upper()
    if not matric:
        return JsonResponse({'found': False})

    # Search in CourseEnrolment
    enrolment = session.course.enrolments.filter(
        student__matric_number__iexact=matric
    ).select_related('student').first()

    if enrolment:
        return JsonResponse({
            'found': True,
            'name': enrolment.student.name,
            'department': enrolment.department or enrolment.student.department or '',
            'matric_number': enrolment.student.matric_number,
        })

    # Search in general Student database
    student = Student.objects.filter(
        institution=session.course.institution,
        matric_number__iexact=matric
    ).first()

    if student:
        return JsonResponse({
            'found': True,
            'name': student.name,
            'department': student.department or '',
            'matric_number': student.matric_number,
        })

    return JsonResponse({'found': False})


def reverse_geocode(lat, lon):
    """Resolve latitude/longitude into a human-readable location address."""
    try:
        import urllib.request, json
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18"
        req = urllib.request.Request(url, headers={'User-Agent': 'AttendlyAcademicPlatform/1.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            addr = data.get('address', {})
            parts = []
            for k in ['amenity', 'building', 'road', 'suburb', 'city', 'state']:
                val = addr.get(k)
                if val and val not in parts:
                    parts.append(val)
            if parts:
                return ", ".join(parts[:3])
            return data.get('display_name', '')[:120]
    except Exception:
        return ''


@csrf_exempt
@never_cache
def student_checkin(request, token):
    """Public student check-in portal accessed via QR code or direct link."""
    session = get_object_or_404(AttendanceSession, token=token)
    
    # If session is closed, inform student
    if not session.is_active:
        return render(request, 'attendance/student_checkin.html', {
            'session': session,
            'is_closed': True,
        })

    if request.method == 'POST':
        matric_number = request.POST.get('matric_number', '').strip().upper()
        student_name = request.POST.get('student_name', '').strip()
        student_email = request.POST.get('student_email', '').strip().lower()
        is_peer = request.POST.get('is_peer') == '1'

        if not matric_number:
            messages.error(request, "Please enter your matriculation number.")
            return render(request, 'attendance/student_checkin.html', {
                'session': session,
                'is_closed': False,
            })

        # Auto-lookup student name from database if not explicitly submitted
        if not student_name:
            enr = session.course.enrolments.filter(
                student__matric_number__iexact=matric_number
            ).select_related('student').first()
            if enr:
                student_name = enr.student.name
            else:
                stu = Student.objects.filter(
                    institution=session.course.institution,
                    matric_number__iexact=matric_number
                ).first()
                if stu:
                    student_name = stu.name
                else:
                    messages.error(request, f"Matriculation number '{matric_number}' was not found in the course roster. Please enter your full name to complete check-in.")
                    return render(request, 'attendance/student_checkin.html', {
                        'session': session,
                        'matric_number': matric_number,
                        'need_name': True,
                        'is_closed': False,
                    })

        # Check if already checked in
        existing = AttendanceRecord.objects.filter(session=session, matric_number=matric_number).first()
        if existing:
            return render(request, 'attendance/checkin_success.html', {
                'session': session,
                'record': existing,
                'already_recorded': True,
            })

        # Determine client IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')

        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # Extract student GPS coordinates & address if provided
        lat_val = request.POST.get('latitude', '').strip()
        lng_val = request.POST.get('longitude', '').strip()
        acc_val = request.POST.get('accuracy', '').strip()
        location_address = request.POST.get('location_address', '').strip()

        latitude = None
        longitude = None
        accuracy_meters = None

        if lat_val and lng_val:
            try:
                latitude = float(lat_val)
                longitude = float(lng_val)
                if acc_val:
                    accuracy_meters = float(acc_val)
                # If frontend didn't supply reverse geocode, resolve it on server
                if not location_address:
                    location_address = reverse_geocode(latitude, longitude)
            except (ValueError, TypeError):
                pass

        checkin_method = AttendanceRecord.CheckinMethod.PEER_SHARED if is_peer else AttendanceRecord.CheckinMethod.QR_SELF

        record = AttendanceRecord.objects.create(
            session=session,
            student_name=student_name,
            matric_number=matric_number,
            student_email=student_email,
            ip_address=ip,
            user_agent=user_agent,
            latitude=latitude,
            longitude=longitude,
            accuracy_meters=accuracy_meters,
            location_address=location_address,
            checkin_method=checkin_method,
            status=AttendanceRecord.Status.PRESENT,
        )

        return render(request, 'attendance/checkin_success.html', {
            'session': session,
            'record': record,
            'already_recorded': False,
        })

    is_peer_mode = request.GET.get('peer') == '1'
    return render(request, 'attendance/student_checkin.html', {
        'session': session,
        'is_closed': False,
        'is_peer_mode': is_peer_mode,
    })


@login_required
def manual_checkin(request, session_id):
    """Allows lecturer to manually mark a student present (for students without phones/data)."""
    session = get_object_or_404(AttendanceSession, pk=session_id)
    if request.method == 'POST':
        matric = request.POST.get('matric_number', '').strip().upper()
        student_name = request.POST.get('student_name', '').strip()

        if not matric:
            messages.error(request, "Please enter a matriculation number to mark present.")
            return redirect('attendance:session_detail', session_id=session.id)

        # Auto-resolve name from enrolled students
        if not student_name:
            enr = session.course.enrolments.filter(
                student__matric_number__iexact=matric
            ).select_related('student').first()
            if enr:
                student_name = enr.student.name
            else:
                stu = Student.objects.filter(
                    institution=session.course.institution,
                    matric_number__iexact=matric
                ).first()
                if stu:
                    student_name = stu.name
                else:
                    student_name = matric

        existing = AttendanceRecord.objects.filter(session=session, matric_number=matric).first()
        if existing:
            messages.info(request, f"Student {student_name} ({matric}) is already marked present.")
        else:
            loc = session.location_name or "In Classroom (Manual Roll-Call)"
            AttendanceRecord.objects.create(
                session=session,
                student_name=student_name,
                matric_number=matric,
                status=AttendanceRecord.Status.PRESENT,
                checkin_method=AttendanceRecord.CheckinMethod.LECTURER_MANUAL,
                location_address=f"In Classroom: {loc}"
            )
            messages.success(request, f"Marked present: {student_name} ({matric})")

    return redirect('attendance:session_detail', session_id=session.id)
