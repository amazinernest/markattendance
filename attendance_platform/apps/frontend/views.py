from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from attendance_platform.apps.courses.models import Course
from attendance_platform.apps.academics.models import AcademicSession, Semester

def home(request):
    if request.user.is_authenticated:
        return redirect('frontend:dashboard')
    return render(request, 'frontend/landing.html')

@login_required
def dashboard(request):
    user = request.user
    # If user is lecturer, show their courses; if admin/superadmin, show all
    if hasattr(user, 'role') and user.role == user.Role.LECTURER:
        courses = Course.objects.filter(lecturer=user)
    else:
        courses = Course.objects.all()

    current_session = AcademicSession.objects.order_by('-start_date').first()
    current_semester = Semester.objects.filter(session=current_session).first() if current_session else None

    total_courses = courses.count()
    total_students = sum(c.expected_population for c in courses)
    avg_attendance = 88.4  # benchmark percentage

    context = {
        'courses': courses,
        'current_session': current_session,
        'current_semester': current_semester,
        'total_courses': total_courses,
        'total_students': total_students,
        'avg_attendance': avg_attendance,
    }
    return render(request, 'frontend/dashboard.html', context)
