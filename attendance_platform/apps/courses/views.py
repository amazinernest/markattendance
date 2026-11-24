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


def user_can_manage_course(user, course):
    if user.role == user.Role.LECTURER and course.lecturer != user and not user.is_staff:
        return False
    return True


@login_required
def course_detail(request, pk):
    course = get_object_or_404(Course, pk=pk)
    
    # Calculate student count per department
    dept_counts = {}
    for enr in course.enrolments.all():
        d_name = (enr.department or enr.student.department or 'General').strip()
        dept_counts[d_name] = dept_counts.get(d_name, 0) + 1

    departments_data = []
    for d in course.all_departments:
        departments_data.append({
            'name': d,
            'count': dept_counts.get(d, 0)
        })

    return render(request, 'courses/course_detail.html', {
        'course': course,
        'departments_data': departments_data,
    })


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
                    inst = Institution.objects.create(name="Default Institution", domain="institution.edu.ng")
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


@login_required
def course_delete(request, pk):
    """Allows lecturer or admin to permanently delete a course and its sessions."""
    course = get_object_or_404(Course, pk=pk)
    user = request.user

    # Permission check: assigned lecturer or staff/admin
    if user.role == user.Role.LECTURER and course.lecturer != user and not user.is_staff:
        messages.error(request, "You do not have permission to delete this course.")
        return redirect('courses:course_list')

    if request.method == 'POST':
        code = course.code
        title = course.title
        course.delete()
        messages.success(request, f"Course '{code} – {title}' and its attendance sessions have been deleted successfully.")
        return redirect('courses:course_list')

    return render(request, 'courses/course_confirm_delete.html', {'course': course})


@login_required
def course_department_add(request, pk):
    """Add a new participating department to the course."""
    course = get_object_or_404(Course, pk=pk)
    if not user_can_manage_course(request.user, course):
        messages.error(request, "You do not have permission to modify departments for this course.")
        return redirect('courses:course_detail', pk=course.pk)

    if request.method == 'POST':
        dept_name = request.POST.get('department_name', '').strip()
        if not dept_name:
            messages.error(request, "Please enter a valid department name.")
        else:
            added = course.add_department(dept_name)
            if added:
                messages.success(request, f"Department '{dept_name}' was successfully added to {course.code}.")
            else:
                messages.info(request, f"Department '{dept_name}' is already registered in {course.code}.")

    return redirect('courses:course_detail', pk=course.pk)


@login_required
def course_department_edit(request, pk):
    """Rename/correct a participating department name across the course and its enrolled students."""
    course = get_object_or_404(Course, pk=pk)
    if not user_can_manage_course(request.user, course):
        messages.error(request, "You do not have permission to modify departments for this course.")
        return redirect('courses:course_detail', pk=course.pk)

    if request.method == 'POST':
        old_name = request.POST.get('old_department', '').strip()
        new_name = request.POST.get('new_department', '').strip()

        if not old_name or not new_name:
            messages.error(request, "Both current and new department names are required.")
        elif old_name.lower() == new_name.lower():
            messages.info(request, "No changes made (department names are identical).")
        else:
            updated_count = course.rename_department(old_name, new_name)
            messages.success(
                request,
                f"Department '{old_name}' was successfully updated to '{new_name}'. {updated_count} enrolled student record(s) were updated."
            )

    return redirect('courses:course_detail', pk=course.pk)


@login_required
def course_department_remove(request, pk):
    """Remove a participating department from the course with safe student reassign or deletion options."""
    course = get_object_or_404(Course, pk=pk)
    if not user_can_manage_course(request.user, course):
        messages.error(request, "You do not have permission to modify departments for this course.")
        return redirect('courses:course_detail', pk=course.pk)

    dept_name = request.GET.get('department', '').strip() or request.POST.get('department', '').strip()
    if not dept_name:
        messages.error(request, "No department specified for removal.")
        return redirect('courses:course_detail', pk=course.pk)

    enrolled_count = course.enrolments.filter(department__iexact=dept_name).count()

    if request.method == 'POST':
        action = request.POST.get('student_action', 'reassign')
        target_dept = request.POST.get('target_department', 'General').strip() or 'General'

        affected_count = course.remove_department(dept_name, action=action, target_dept=target_dept)
        if action == 'remove':
            messages.success(
                request,
                f"Department '{dept_name}' and {affected_count} enrolled student(s) were successfully removed from {course.code}."
            )
        else:
            messages.success(
                request,
                f"Department '{dept_name}' was removed from {course.code}. {affected_count} student(s) were reassigned to '{target_dept}'."
            )
        return redirect('courses:course_detail', pk=course.pk)

    # GET: render confirmation page
    other_departments = [d for d in course.all_departments if d.lower() != dept_name.lower()]
    return render(request, 'courses/department_confirm_delete.html', {
        'course': course,
        'department': dept_name,
        'enrolled_count': enrolled_count,
        'other_departments': other_departments,
    })
