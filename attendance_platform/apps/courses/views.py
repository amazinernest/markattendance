from datetime import date
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from attendance_platform.apps.institutions.models import Institution
from attendance_platform.apps.academics.models import AcademicSession, Semester
from .models import Course
from .forms import CourseForm


@login_required
def course_list(request):
    user = request.user
    if user.role == user.Role.LECTURER:
        courses = Course.objects.filter(lecturer=user)
    else:
        courses = Course.objects.all()
    return render(request, 'courses/course_list.html', {'courses': courses})


@login_required
def course_detail(request, pk):
    course = get_object_or_404(Course, pk=pk)
    return render(request, 'courses/course_detail.html', {'course': course})


@login_required
def course_create(request):
    """Allows lecturer to create their own course with custom details."""
    user = request.user
    if request.method == 'POST':
        form = CourseForm(request.POST, user=user)
        if form.is_valid():
            course = form.save(commit=False)
            
            # Auto-assign the logged-in lecturer
            if not course.lecturer:
                course.lecturer = user
            
            # Auto-assign institution if not set
            if not course.institution_id:
                inst = getattr(user, 'institution', None) or Institution.objects.first()
                if not inst:
                    inst = Institution.objects.create(name="Default Institution", code="INST")
                course.institution = inst
            
            # Auto-assign academic session & semester if not chosen
            if not course.academic_session_id:
                session = AcademicSession.objects.first()
                if not session:
                    session = AcademicSession.objects.create(
                        name="2024/2025",
                        start_date=date(2024, 9, 1),
                        end_date=date(2025, 7, 31)
                    )
                course.academic_session = session

            if not course.semester_id:
                semester = Semester.objects.filter(session=course.academic_session).first()
                if not semester:
                    semester = Semester.objects.create(
                        session=course.academic_session,
                        name="First Semester",
                        order=1
                    )
                course.semester = semester

            course.save()
            messages.success(request, f"Course '{course.code} – {course.title}' created successfully! You can now import your class roster or start taking attendance.")
            return redirect('courses:course_detail', pk=course.pk)
    else:
        initial = {
            'lecturer': user,
            'institution': getattr(user, 'institution', None) or Institution.objects.first(),
            'attendance_threshold': 75,
        }
        form = CourseForm(initial=initial, user=user)
    return render(request, 'courses/course_form.html', {'form': form, 'operation': 'Create'})


@login_required
def course_update(request, pk):
    course = get_object_or_404(Course, pk=pk)
    user = request.user
    if request.method == 'POST':
        form = CourseForm(request.POST, instance=course, user=user)
        if form.is_valid():
            course = form.save()
            messages.success(request, f"Course {course.code} updated successfully.")
            return redirect('courses:course_detail', pk=course.pk)
    else:
        form = CourseForm(instance=course, user=user)
    return render(request, 'courses/course_form.html', {'form': form, 'operation': 'Update'})
