import io
import openpyxl
import docx
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse
from attendance_platform.apps.courses.models import Course, Student, CourseEnrolment
from .parsers import extract_students_from_file


@login_required
def import_class_list(request):
    user = request.user
    if user.role == user.Role.LECTURER:
        courses = Course.objects.filter(lecturer=user)
    else:
        courses = Course.objects.all()

    selected_course_id = request.GET.get('course_id') or request.POST.get('course_id')
    selected_course = None
    if selected_course_id:
        selected_course = courses.filter(id=selected_course_id).first()

    if request.method == 'POST' and 'class_file' in request.FILES:
        course_id = request.POST.get('course_id')
        if not course_id:
            messages.error(request, "Please select a course to import the student roster into.")
            return redirect('imports:upload')
        
        course = get_object_or_404(Course, id=course_id)
        uploaded_file = request.FILES['class_file']
        fallback_dept = request.POST.get('default_department', '').strip()

        try:
            extracted_students = extract_students_from_file(uploaded_file, uploaded_file.name)
        except Exception as e:
            messages.error(request, f"Error processing file {uploaded_file.name}: {str(e)}")
            return redirect('imports:upload')

        if not extracted_students:
            messages.warning(request, f"No student rows could be parsed from {uploaded_file.name}. Please ensure the file has columns for Matric Number and Student Name.")
            return redirect('imports:upload')

        created_students = 0
        enrolled_students = 0
        departments_found = set()

        for s_data in extracted_students:
            dept = s_data.get('department') or fallback_dept or course.department or 'General'
            departments_found.add(dept)

            # Get or create Student
            student, s_created = Student.objects.get_or_create(
                institution=course.institution,
                matric_number=s_data['matric_number'],
                defaults={
                    'name': s_data['name'],
                    'department': dept,
                    'email': s_data.get('email', ''),
                }
            )
            if s_created:
                created_students += 1
            elif not student.department and dept:
                student.department = dept
                student.save()

            # Create Enrolment
            enrolment, e_created = CourseEnrolment.objects.get_or_create(
                course=course,
                student=student,
                defaults={
                    'department': dept,
                }
            )
            if e_created:
                enrolled_students += 1

        # Update course participating departments and population
        course.expected_population = course.enrolments.count()
        existing_deps = set(course.all_departments)
        existing_deps.update(departments_found)
        course.participating_departments = ", ".join(sorted(list(existing_deps)))
        course.save()

        messages.success(
            request,
            f"Successfully processed {len(extracted_students)} records! Enrolled {enrolled_students} new students into {course.code} across {len(departments_found)} department(s)."
        )
        return render(request, 'imports/import_success.html', {
            'course': course,
            'total_extracted': len(extracted_students),
            'new_enrolled': enrolled_students,
            'departments': sorted(list(departments_found)),
            'students_sample': extracted_students[:25],
        })

    return render(request, 'imports/import_form.html', {
        'courses': courses,
        'selected_course': selected_course,
    })


@login_required
def download_template(request, format_type):
    """Download a pre-formatted class list template in Excel, Word, or CSV format."""
    if format_type == 'excel':
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Class Roster"
        ws.append(["Matric Number", "Full Name", "Department", "Email"])
        ws.append(["CSC/2021/001", "Adebayo Johnson", "Computer Science", "adebayo@student.edu"])
        ws.append(["MEE/2021/045", "Grace Okon", "Mechanical Engineering", "grace.okon@student.edu"])
        ws.append(["EEE/2021/089", "Chinedu Eze", "Electrical Engineering", "chinedu@student.edu"])
        
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="attendly_class_list_template.xlsx"'
        return response

    elif format_type == 'word':
        doc = docx.Document()
        doc.add_heading("Class List Roster Template", level=1)
        doc.add_paragraph("Populate the table below with student matric numbers, full names, and departments:")
        
        table = doc.add_table(rows=1, cols=4)
        headers = table.rows[0].cells
        headers[0].text = "Matric Number"
        headers[1].text = "Full Name"
        headers[2].text = "Department"
        headers[3].text = "Email"

        sample_data = [
            ("CSC/2021/001", "Adebayo Johnson", "Computer Science", "adebayo@student.edu"),
            ("MEE/2021/045", "Grace Okon", "Mechanical Engineering", "grace.okon@student.edu"),
            ("EEE/2021/089", "Chinedu Eze", "Electrical Engineering", "chinedu@student.edu"),
        ]
        for row in sample_data:
            cells = table.add_row().cells
            for idx, val in enumerate(row):
                cells[idx].text = val

        output = io.BytesIO()
        doc.save(output)
        output.seek(0)
        
        response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        response['Content-Disposition'] = 'attachment; filename="attendly_class_list_template.docx"'
        return response

    elif format_type == 'csv':
        output = io.StringIO()
        output.write("Matric Number,Full Name,Department,Email\n")
        output.write("CSC/2021/001,Adebayo Johnson,Computer Science,adebayo@student.edu\n")
        output.write("MEE/2021/045,Grace Okon,Mechanical Engineering,grace.okon@student.edu\n")
        output.write("EEE/2021/089,Chinedu Eze,Electrical Engineering,chinedu@student.edu\n")
        
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="attendly_class_list_template.csv"'
        return response

    return HttpResponse("Invalid format requested", status=400)
