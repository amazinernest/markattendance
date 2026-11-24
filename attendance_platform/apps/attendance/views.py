import uuid
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
from django.contrib import messages
from django.utils import timezone
from django.http import JsonResponse, HttpResponse
from attendance_platform.apps.courses.models import Course, Student
from .models import AttendanceSession, AttendanceRecord
from .forms import AttendanceSessionForm


@login_required
def start_session(request, course_id):
    """Setup and start a new class lecture attendance session with custom Topic, Date, and unique QR Code."""
    course = get_object_or_404(Course, pk=course_id)
    
    if request.method == 'POST':
        form = AttendanceSessionForm(request.POST)
        if form.is_valid():
            session = form.save(commit=False)
            session.course = course
            session.token = uuid.uuid4()  # Each class session has its own unique cryptographic QR token
            session.is_active = True
            session.save()
            
            topic_str = f" – '{session.topic}'" if session.topic else ""
            messages.success(request, f"Class attendance opened for {course.code}{topic_str} with its own unique QR Code!")
            return redirect('attendance:session_detail', session_id=session.id)
    else:
        # Prepopulate with smart defaults
        lecture_count = course.attendance_sessions.count() + 1
        initial = {
            'title': f"Lecture {lecture_count}",
            'topic': '',
            'session_date': timezone.now().date(),
            'start_time': timezone.now().strftime('%H:%M'),
            'location_name': course.schedule or '',
        }
        form = AttendanceSessionForm(initial=initial)
    
    return render(request, 'attendance/session_create.html', {
        'course': course,
        'form': form,
    })


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


@login_required
def session_print(request, session_id):
    """Clean, high-resolution printable classroom poster view for the class QR code."""
    session = get_object_or_404(AttendanceSession, pk=session_id)
    checkin_url = session.get_checkin_url(request)
    qr_code_b64 = session.get_qr_code_base64(checkin_url)

    context = {
        'session': session,
        'course': session.course,
        'checkin_url': checkin_url,
        'qr_code_b64': qr_code_b64,
        'printed_at': timezone.now(),
    }
    return render(request, 'attendance/session_print.html', context)


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
    
    if not matric or len(matric) < 4:
        return JsonResponse({'found': False, 'message': 'Matric number too short'})

    institution = session.course.institution
    course = session.course

    # 1. Search enrolled students first
    enrolment = course.enrolments.filter(
        student__matric_number__iexact=matric
    ).select_related('student').first()

    if enrolment:
        return JsonResponse({
            'found': True,
            'matric_number': enrolment.student.matric_number,
            'name': enrolment.student.name,
            'department': enrolment.department or enrolment.student.department or course.department,
            'is_enrolled': True
        })

    # 2. Search institution-wide students
    student = Student.objects.filter(
        institution=institution,
        matric_number__iexact=matric
    ).first()

    if student:
        return JsonResponse({
            'found': True,
            'matric_number': student.matric_number,
            'name': student.name,
            'department': student.department or course.department,
            'is_enrolled': False
        })

    return JsonResponse({
        'found': False,
        'matric_number': matric,
        'message': 'Student not found on class list'
    })


def reverse_geocode(lat, lon):
    """Fallback reverse geocoding via OpenStreetMap Nominatim."""
    try:
        import urllib.request
        import json
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18"
        req = urllib.request.Request(url, headers={'User-Agent': 'AttendlyAcademicPortal/1.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            if data and 'display_name' in data:
                return data['display_name']
    except Exception:
        pass
    return ""


def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance in meters between two coordinates on Earth.
    lat1, lon1: Classroom / Venue
    lat2, lon2: Student
    """
    import math
    try:
        lat1 = float(lat1)
        lon1 = float(lon1)
        lat2 = float(lat2)
        lon2 = float(lon2)
        R = 6371000.0  # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c
    except (TypeError, ValueError, ZeroDivisionError):
        return None


@csrf_exempt
@never_cache
def student_checkin(request, token):
    """
    Lightweight, high-performance student check-in view.
    Zero render-blocking CDN dependencies for instantaneous mobile loading.
    CSRF-exempt on valid UUID token to eliminate mobile cookie drop issues.
    """
    session = get_object_or_404(AttendanceSession, token=token)
    course = session.course
    is_peer_mode = request.GET.get('peer') == '1' or request.POST.get('is_peer') == '1'

    # If session is closed
    if not session.is_active:
        return render(request, 'attendance/student_checkin.html', {
            'session': session,
            'is_closed': True,
        })

    if request.method == 'POST':
        matric = request.POST.get('matric_number', '').strip().upper()
        name = request.POST.get('student_name', '').strip()
        lat = request.POST.get('latitude', '').strip()
        lon = request.POST.get('longitude', '').strip()
        accuracy = request.POST.get('accuracy', '').strip()
        loc_address = request.POST.get('location_address', '').strip()

        if not matric:
            messages.error(request, "Please enter your Matriculation Number.")
            return render(request, 'attendance/student_checkin.html', {'session': session, 'is_peer_mode': is_peer_mode})

        # Check for duplicate check-in in this session
        existing = AttendanceRecord.objects.filter(session=session, matric_number__iexact=matric).first()
        if existing:
            messages.info(request, f"Attendance already confirmed for {existing.student_name} ({matric}) at {existing.checked_in_at.strftime('%I:%M %p')}.")
            return render(request, 'attendance/checkin_success.html', {
                'session': session,
                'record': existing,
                'is_duplicate': True,
            })

        # If name not provided via form/lookup, auto-resolve from database
        if not name:
            enr = course.enrolments.filter(student__matric_number__iexact=matric).select_related('student').first()
            if enr:
                name = enr.student.name
            else:
                std = Student.objects.filter(institution=course.institution, matric_number__iexact=matric).first()
                if std:
                    name = std.name
                else:
                    # Require name if not found in database
                    messages.warning(request, f"Matric '{matric}' is not enrolled in {course.code}. Please provide your full name.")
                    return render(request, 'attendance/student_checkin.html', {
                        'session': session,
                        'matric_number': matric,
                        'need_name': True,
                        'is_peer_mode': is_peer_mode,
                    })

        # Determine checkin method
        checkin_method = AttendanceRecord.CheckinMethod.PEER_SHARED if is_peer_mode else AttendanceRecord.CheckinMethod.QR_SELF

        # Device Fingerprint & Multi-Account Proxy Prevention
        raw_fingerprint = request.POST.get('device_fingerprint', '').strip()
        ip = request.META.get('HTTP_X_FORWARDED_FOR')
        if ip:
            ip = ip.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]

        import hashlib
        if raw_fingerprint:
            device_fingerprint = hashlib.sha256(raw_fingerprint.encode()).hexdigest()[:48]
        else:
            device_fingerprint = hashlib.sha256(f"{ip}_{user_agent}".encode()).hexdigest()[:48]

        # Anti-Cheating Rule 1: One Device per Student (Block Proxying on same phone)
        if session.enforce_device_lock and device_fingerprint and not is_peer_mode:
            prior_record = AttendanceRecord.objects.filter(
                session=session,
                device_fingerprint=device_fingerprint
            ).exclude(matric_number__iexact=matric).first()

            if prior_record:
                messages.error(
                    request,
                    f"❌ Proxy Violation: This device has already confirmed attendance for {prior_record.student_name} ({prior_record.matric_number}) in this lecture. Each student must scan and submit using their own personal device. Signing for classmates is strictly prohibited."
                )
                return render(request, 'attendance/student_checkin.html', {
                    'session': session,
                    'matric_number': matric,
                    'device_locked': True,
                    'is_closed': False,
                })

        # Parse GPS coordinates
        latitude = None
        longitude = None
        accuracy_meters = None
        is_mock_reported = request.POST.get('is_mock') == '1'
        try:
            if lat and lon:
                latitude = float(lat)
                longitude = float(lon)
            if accuracy:
                accuracy_meters = float(accuracy)
        except (ValueError, TypeError):
            pass

        # Geofence & Anti-Spoofing enforcement
        distance_meters = None
        is_geofence_verified = True
        geofence_status = 'NOT_REQUIRED'

        if session.enable_geofence and session.has_venue_location:
            venue_desc = session.location_name or 'the classroom venue'
            if latitude is None or longitude is None:
                messages.error(
                    request,
                    f"📍 Classroom GPS Required: Physical attendance verification is enforced for {venue_desc}. Please turn on Location Services on your phone and tap 'Allow'."
                )
                return render(request, 'attendance/student_checkin.html', {
                    'session': session,
                    'matric_number': matric,
                    'is_peer_mode': is_peer_mode,
                    'geofence_error': 'GPS coordinates not provided. Please turn on location services on your device.',
                })

            # Anti-Cheating Rule 2: Fake GPS & Mock Location Detection
            if session.strict_anti_spoofing:
                if is_mock_reported:
                    messages.error(
                        request,
                        "❌ Fake GPS Detected: Mock or simulated location detected on your device. Please disable Fake GPS / location spoofer apps and use genuine satellite location."
                    )
                    return render(request, 'attendance/student_checkin.html', {
                        'session': session,
                        'matric_number': matric,
                        'spoof_detected': True,
                    })

                if accuracy_meters is not None and accuracy_meters <= 0.05:
                    messages.error(
                        request,
                        "❌ Synthetic Location Detected: Unrealistically static coordinates detected. Please ensure your device has a genuine GPS satellite lock."
                    )
                    return render(request, 'attendance/student_checkin.html', {
                        'session': session,
                        'matric_number': matric,
                        'spoof_detected': True,
                    })

                if accuracy_meters is not None and accuracy_meters > 250:
                    messages.error(
                        request,
                        f"⚠️ Inaccurate Location ({int(accuracy_meters)}m): GPS accuracy is too low to verify classroom presence. Please move closer to a window, turn on Wi-Fi/Bluetooth scanning for accuracy, and disable VPNs."
                    )
                    return render(request, 'attendance/student_checkin.html', {
                        'session': session,
                        'matric_number': matric,
                        'low_accuracy': True,
                    })

            # Calculate physical distance to venue using Haversine formula
            distance_meters = calculate_haversine_distance(
                session.venue_latitude,
                session.venue_longitude,
                latitude,
                longitude
            )

            if distance_meters is None:
                messages.error(request, "Could not verify physical distance. Please ensure GPS is active.")
                return render(request, 'attendance/student_checkin.html', {
                    'session': session,
                    'matric_number': matric,
                    'is_peer_mode': is_peer_mode,
                    'geofence_error': 'Invalid GPS coordinates received.',
                })

            # Anti-Cheating Rule 3: Strict Radius Enforcement (Faraway Students Blocked)
            if distance_meters > session.geofence_radius_meters:
                dist_str = f"{int(distance_meters):,}m" if distance_meters < 1000 else f"{(distance_meters/1000.0):.2f}km"
                messages.error(
                    request,
                    f"❌ Attendance Blocked (Out of Range): You are approximately {dist_str} away from {venue_desc} (Allowed radius: {session.geofence_radius_meters}m). Remote attendance or proxy check-in from outside class is strictly prohibited."
                )
                return render(request, 'attendance/student_checkin.html', {
                    'session': session,
                    'matric_number': matric,
                    'is_peer_mode': is_peer_mode,
                    'geofence_blocked': True,
                    'distance_meters': int(distance_meters),
                    'allowed_radius': session.geofence_radius_meters,
                    'venue_name': venue_desc,
                })

            # Passed geofence!
            is_geofence_verified = True
            geofence_status = 'VERIFIED'

        # Server-side reverse geocoding if client did not supply address
        if latitude and longitude and not loc_address:
            loc_address = reverse_geocode(latitude, longitude)

        # Create attendance record
        record = AttendanceRecord.objects.create(
            session=session,
            student_name=name,
            matric_number=matric,
            checkin_method=checkin_method,
            ip_address=ip,
            user_agent=user_agent,
            latitude=latitude,
            longitude=longitude,
            accuracy_meters=accuracy_meters,
            location_address=loc_address,
            distance_from_venue_meters=round(distance_meters, 1) if distance_meters is not None else None,
            device_fingerprint=device_fingerprint,
            is_mock_location=is_mock_reported,
            is_geofence_verified=is_geofence_verified,
            geofence_status=geofence_status,
            status=AttendanceRecord.Status.PRESENT,
        )

        return render(request, 'attendance/checkin_success.html', {
            'session': session,
            'record': record,
            'is_duplicate': False,
        })

    # GET request: render check-in screen
    return render(request, 'attendance/student_checkin.html', {
        'session': session,
        'is_closed': False,
        'is_peer_mode': is_peer_mode,
    })


@login_required
def manual_checkin(request, session_id):
    """Allows lecturer to manually mark a student present on the spot."""
    session = get_object_or_404(AttendanceSession, pk=session_id)
    course = session.course
    
    if request.method == 'POST':
        matric = request.POST.get('matric_number', '').strip().upper()
        if not matric:
            messages.error(request, "Please enter a valid Matric Number.")
            return redirect('attendance:session_detail', session_id=session.id)

        # Check duplicate
        if AttendanceRecord.objects.filter(session=session, matric_number__iexact=matric).exists():
            messages.warning(request, f"Student {matric} is already marked present for this session.")
            return redirect('attendance:session_detail', session_id=session.id)

        # Auto-lookup student name
        name = matric
        enr = course.enrolments.filter(student__matric_number__iexact=matric).select_related('student').first()
        if enr:
            name = enr.student.name
        else:
            std = Student.objects.filter(institution=course.institution, matric_number__iexact=matric).first()
            if std:
                name = std.name

        AttendanceRecord.objects.create(
            session=session,
            student_name=name,
            matric_number=matric,
            checkin_method=AttendanceRecord.CheckinMethod.LECTURER_MANUAL,
            location_address=session.location_name or 'Classroom Roll-Call',
            status=AttendanceRecord.Status.PRESENT,
        )
        messages.success(request, f"Successfully recorded {name} ({matric}) via manual roll-call.")

    return redirect('attendance:session_detail', session_id=session.id)


@login_required
def update_session_venue(request, session_id):
    """Allows lecturer to lock or update classroom GPS venue coordinates and radius on the fly."""
    session = get_object_or_404(AttendanceSession, pk=session_id)
    if request.method == 'POST':
        lat = request.POST.get('venue_latitude')
        lon = request.POST.get('venue_longitude')
        radius = request.POST.get('geofence_radius_meters')
        venue_name = request.POST.get('location_name', '').strip()

        try:
            if lat and lon:
                session.venue_latitude = float(lat)
                session.venue_longitude = float(lon)
            if radius:
                session.geofence_radius_meters = int(radius)
            if venue_name:
                session.location_name = venue_name
            session.enable_geofence = True
            session.save()

            if request.headers.get('x-requested-with') == 'XMLHttpRequest' or 'application/json' in request.headers.get('Accept', ''):
                return JsonResponse({
                    'success': True,
                    'message': f"Classroom location locked to {session.location_name or 'current GPS position'} ({session.geofence_radius_meters}m radius).",
                    'venue_latitude': float(session.venue_latitude),
                    'venue_longitude': float(session.venue_longitude),
                    'radius': session.geofence_radius_meters,
                    'location_name': session.location_name,
                })
            messages.success(request, f"Classroom location successfully updated ({session.geofence_radius_meters}m radius).")
        except (ValueError, TypeError) as e:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': 'Invalid GPS coordinates.'}, status=400)
            messages.error(request, "Invalid coordinates provided.")

        return redirect('attendance:session_detail', session_id=session.id)
    return redirect('attendance:session_detail', session_id=session.id)


@login_required
def session_delete(request, session_id):
    """Allows lecturer or admin to permanently delete an attendance session."""
    session = get_object_or_404(AttendanceSession, pk=session_id)
    course = session.course
    user = request.user

    # Permission check: assigned lecturer or staff/admin
    if user.role == user.Role.LECTURER and course.lecturer != user and not user.is_staff:
        messages.error(request, "You do not have permission to delete this attendance session.")
        return redirect('courses:course_detail', pk=course.pk)

    if request.method == 'POST':
        title = session.title
        session.delete()
        messages.success(request, f"Attendance session '{title}' and its attendance records were deleted successfully.")
        return redirect('courses:course_detail', pk=course.pk)

    return render(request, 'attendance/session_confirm_delete.html', {'session': session, 'course': course})
