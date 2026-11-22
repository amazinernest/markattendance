from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.http import JsonResponse
from attendance_platform.apps.courses.models import Course
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
    }
    return render(request, 'attendance/session_detail.html', context)


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
        student_name = request.POST.get('student_name', '').strip()
        matric_number = request.POST.get('matric_number', '').strip().upper()
        student_email = request.POST.get('student_email', '').strip().lower()

        if not student_name or not matric_number:
            messages.error(request, "Please enter both your full name and matriculation number.")
            return render(request, 'attendance/student_checkin.html', {
                'session': session,
                'student_name': student_name,
                'matric_number': matric_number,
                'student_email': student_email,
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

        record = AttendanceRecord.objects.create(
            session=session,
            student_name=student_name,
            matric_number=matric_number,
            student_email=student_email,
            ip_address=ip,
            user_agent=user_agent,
            status=AttendanceRecord.Status.PRESENT,
        )

        return render(request, 'attendance/checkin_success.html', {
            'session': session,
            'record': record,
            'already_recorded': False,
        })

    return render(request, 'attendance/student_checkin.html', {
        'session': session,
        'is_closed': False,
    })
