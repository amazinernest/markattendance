import io
import re
import openpyxl
import docx
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse
from attendance_platform.apps.courses.models import Course, Student, CourseEnrolment
from .parsers import extract_students_from_file


def infer_dept_from_filename(filename):
    """
    Intelligently infer an academic department name from a file name.
    e.g., 'GCE_104_GUIDANCE_AND_COUNSELLING_CA.xlsx' -> 'Guidance And Counselling'
          'Computer_Science_Year1.docx' -> 'Computer Science'
          'Mechanical_Engineering.xlsx' -> 'Mechanical Engineering'
    """
    if not filename:
        return ""
    base = re.sub(r'\.(xlsx|xls|docx|doc|pdf|csv)$', '', filename, flags=re.IGNORECASE)
    # Strip course code patterns e.g. GCE_104, CSC 201, GCE104
    cleaned = re.sub(r'[A-Za-z]{2,5}[_\-\s]*\d{2,4}', '', base, flags=re.IGNORECASE)
    cleaned = re.sub(r'[\-_/]', ' ', cleaned)
    # Strip common academic noise tokens
    cleaned = re.sub(
        r'\b(roster|class\s*list|list|attendance|test|ca|exam|level|\d{3}\s*level|\d{3}|year\s*\d|final|students?|sheet|course|intro|introduction\s*to)\b',
        '',
        cleaned,
        flags=re.IGNORECASE
    )
    cleaned = ' '.join(cleaned.split()).strip()
    if len(cleaned) >= 3 and not cleaned.isdigit() and cleaned.lower() not in ['general', 'default', 'file', 'document']:
        return cleaned.title()
    return ""


@login_required
def import_class_list(request):
    """
    Allows lecturers to upload one or multiple student roster files for a course.
    Supports multi-department batches, sequential uploads without overwriting existing students,
    and smart department inference.
    """
    user = request.user
    if user.role == user.Role.LECTURER:
        courses = Course.objects.filter(lecturer=user)
    else:
        courses = Course.objects.all()

    selected_course_id = request.GET.get('course_id') or request.POST.get('course_id')
    selected_course = None
    if selected_course_id:
        selected_course = courses.filter(id=selected_course_id).first()

    if request.method == 'POST':
        # Accept multiple files from 'class_files' or legacy 'class_file'
        uploaded_files = request.FILES.getlist('class_files') or request.FILES.getlist('class_file')

        if not uploaded_files:
            messages.error(request, "Please select at least one class roster file to upload.")
            redirect_url = f"{reverse('imports:upload')}?course_id={selected_course_id or ''}"
            return redirect(redirect_url)

        course_id = request.POST.get('course_id')
        if not course_id:
            messages.error(request, "Please select a target course to import the student roster into.")
            return redirect('imports:upload')

        course = get_object_or_404(Course, id=course_id)
        fallback_dept = request.POST.get('default_department', '').strip()

        file_summaries = []
        all_extracted_students = []
        total_created_students = 0
        total_new_enrolled = 0
        departments_found_this_batch = set()

        for f in uploaded_files:
            file_name = f.name
            try:
                extracted = extract_students_from_file(f, file_name)
            except Exception as e:
                file_summaries.append({
                    'name': file_name,
                    'status': 'error',
                    'error': str(e),
                    'total_parsed': 0,
                    'new_enrolled': 0,
                    'departments': []
                })
                continue

            if not extracted:
                file_summaries.append({
                    'name': file_name,
                    'status': 'warning',
                    'error': 'No student rows found (ensure file contains columns for Matric Number and Name)',
                    'total_parsed': 0,
                    'new_enrolled': 0,
                    'departments': []
                })
                continue

            # Infer department for this file if rows don't have explicit department
            file_inferred_dept = infer_dept_from_filename(file_name)
            file_new_enrolled = 0
            file_depts = set()

            for s_data in extracted:
                # 1. Use row-level department if present in file
                # 2. Or fallback to department typed by user in form
                # 3. Or department intelligently inferred from this file's name
                # 4. Or course lead department
                dept = (
                    s_data.get('department')
                    or fallback_dept
                    or file_inferred_dept
                    or course.department
                    or 'General'
                )
                file_depts.add(dept)
                departments_found_this_batch.add(dept)
                all_extracted_students.append({
                    'matric_number': s_data['matric_number'],
                    'name': s_data['name'],
                    'department': dept,
                    'email': s_data.get('email', ''),
                    'source_file': file_name,
                })

                # Get or create Student (persisted institution-wide)
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
                    total_created_students += 1
                else:
                    # Update name or department if previously blank or general
                    updated = False
                    if not student.name and s_data.get('name'):
                        student.name = s_data['name']
                        updated = True
                    if (not student.department or student.department == 'General') and dept != 'General':
                        student.department = dept
                        updated = True
                    if updated:
                        student.save()

                # Get or create CourseEnrolment (links student to this specific course)
                enrolment, e_created = CourseEnrolment.objects.get_or_create(
                    course=course,
                    student=student,
                    defaults={
                        'department': dept,
                    }
                )
                if e_created:
                    file_new_enrolled += 1
                    total_new_enrolled += 1
                else:
                    # If enrolment was general and now has specific department, refine it
                    if dept and (not enrolment.department or enrolment.department == 'General'):
                        enrolment.department = dept
                        enrolment.save()

            file_summaries.append({
                'name': file_name,
                'status': 'success',
                'total_parsed': len(extracted),
                'new_enrolled': file_new_enrolled,
                'departments': sorted(list(file_depts)),
            })

        # Update course population and all participating departments
        course.expected_population = course.enrolments.count()
        existing_deps = set(course.all_departments)
        existing_deps.update(departments_found_this_batch)
        course.participating_departments = ", ".join(sorted(list(existing_deps)))
        course.save()

        # Check outcomes
        successful_files = [s for s in file_summaries if s['status'] == 'success']
        if not successful_files:
            messages.error(request, "None of the uploaded files could be parsed. Please check the file formats and try again.")
            return redirect(f"{reverse('imports:upload')}?course_id={course.id}")

        messages.success(
            request,
            f"Successfully processed {len(successful_files)} file(s)! Enrolled {total_new_enrolled} new students into {course.code}. Total enrolled roster is now {course.expected_population} across {len(course.all_departments)} department(s)."
        )

        return render(request, 'imports/import_success.html', {
            'course': course,
            'total_files': len(uploaded_files),
            'file_summaries': file_summaries,
            'total_extracted': len(all_extracted_students),
            'new_enrolled': total_new_enrolled,
            'departments': course.all_departments,
            'students_sample': all_extracted_students[:50],
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
