import io
import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from attendance_platform.apps.courses.models import Course, Student, CourseEnrolment
from attendance_platform.apps.attendance.models import AttendanceSession, AttendanceRecord


def compute_course_attendance_stats(course, department_filter=None):
    """Compute complete semester attendance statistics for every student in a course."""
    total_sessions = course.attendance_sessions.count()
    enrolments = course.enrolments.select_related('student').all()

    if department_filter and department_filter != 'ALL':
        enrolments = enrolments.filter(department=department_filter)

    # Get all attendance records for this course mapped by matric number
    course_session_ids = course.attendance_sessions.values_list('id', flat=True)
    records = AttendanceRecord.objects.filter(session_id__in=course_session_ids)
    
    # Map student matric to set of session ids attended
    attendance_map = {}
    for r in records:
        matric = r.matric_number.upper().strip()
        if matric not in attendance_map:
            attendance_map[matric] = set()
        attendance_map[matric].add(r.session_id)

    student_stats = []
    eligible_count = 0
    not_eligible_count = 0
    dept_breakdown = {}

    for enr in enrolments:
        student = enr.student
        dept = enr.department or student.department or 'General'
        matric = student.matric_number.upper().strip()

        attended_count = len(attendance_map.get(matric, set()))
        if total_sessions > 0:
            pct = round((attended_count / total_sessions) * 100, 1)
        else:
            pct = 0.0

        is_eligible = pct >= float(course.attendance_threshold)
        status_label = "ELIGIBLE" if is_eligible else "NOT ELIGIBLE"

        if is_eligible:
            eligible_count += 1
        else:
            not_eligible_count += 1

        # Track department breakdown
        if dept not in dept_breakdown:
            dept_breakdown[dept] = {'total': 0, 'attended_sum': 0}
        dept_breakdown[dept]['total'] += 1
        dept_breakdown[dept]['attended_sum'] += pct

        student_stats.append({
            'student': student,
            'matric_number': student.matric_number,
            'name': student.name,
            'department': dept,
            'email': student.email,
            'total_sessions': total_sessions,
            'attended_count': attended_count,
            'percentage': pct,
            'is_eligible': is_eligible,
            'status_label': status_label,
        })

    # Also capture students who checked in to sessions but were not in the imported roster
    if department_filter in [None, 'ALL', 'Unassigned']:
        enrolled_matrics = {e.student.matric_number.upper().strip() for e in enrolments}
        unregistered_matrics = set(attendance_map.keys()) - enrolled_matrics
        for u_matric in unregistered_matrics:
            rec = records.filter(matric_number=u_matric).order_by('-checked_in_at').first()
            if not rec:
                continue
            name = rec.student_name or u_matric
            dept = 'Unassigned'
            attended_count = len(attendance_map.get(u_matric, set()))
            pct = round((attended_count / total_sessions) * 100, 1) if total_sessions > 0 else 0.0
            is_eligible = pct >= float(course.attendance_threshold)
            status_label = "ELIGIBLE" if is_eligible else "NOT ELIGIBLE"

            if is_eligible:
                eligible_count += 1
            else:
                not_eligible_count += 1

            if dept not in dept_breakdown:
                dept_breakdown[dept] = {'total': 0, 'attended_sum': 0}
            dept_breakdown[dept]['total'] += 1
            dept_breakdown[dept]['attended_sum'] += pct

            student_stats.append({
                'student': None,
                'matric_number': u_matric,
                'name': name,
                'department': dept,
                'email': rec.student_email or '',
                'total_sessions': total_sessions,
                'attended_count': attended_count,
                'percentage': pct,
                'is_eligible': is_eligible,
                'status_label': status_label,
            })

    # Sort student stats by matric number
    student_stats.sort(key=lambda x: (x['department'], x['matric_number']))

    # Compute department averages
    department_summary = []
    for d_name, d_data in sorted(dept_breakdown.items()):
        avg = round(d_data['attended_sum'] / d_data['total'], 1) if d_data['total'] else 0.0
        department_summary.append({
            'name': d_name,
            'count': d_data['total'],
            'avg_pct': avg,
        })

    avg_overall = 0.0
    if student_stats:
        avg_overall = round(sum(s['percentage'] for s in student_stats) / len(student_stats), 1)

    return {
        'total_sessions': total_sessions,
        'student_stats': student_stats,
        'total_students': len(student_stats),
        'eligible_count': eligible_count,
        'not_eligible_count': not_eligible_count,
        'avg_overall': avg_overall,
        'department_summary': department_summary,
    }


@login_required
def reports_index(request):
    """End of semester attendance audit dashboard."""
    user = request.user
    if user.role == user.Role.LECTURER:
        courses = Course.objects.filter(lecturer=user)
    else:
        courses = Course.objects.all()

    course_id = request.GET.get('course_id')
    selected_course = None
    if course_id:
        selected_course = courses.filter(id=course_id).first()
    if not selected_course and courses.exists():
        selected_course = courses.first()

    department_filter = request.GET.get('department', 'ALL')

    stats_data = None
    all_departments = []
    if selected_course:
        all_departments = selected_course.all_departments
        stats_data = compute_course_attendance_stats(selected_course, department_filter)

    context = {
        'courses': courses,
        'selected_course': selected_course,
        'department_filter': department_filter,
        'all_departments': all_departments,
        'stats': stats_data,
    }
    return render(request, 'reports/reports_index.html', context)


@login_required
def export_excel_report(request, course_id):
    """Generate and download formatted end-of-semester Excel attendance report."""
    course = get_object_or_404(Course, id=course_id)
    department_filter = request.GET.get('department', 'ALL')
    stats = compute_course_attendance_stats(course, department_filter)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = f"{course.code} Attendance Audit"
    ws.views.sheetView[0].showGridLines = True

    # Styling definitions
    title_font = Font(name='Arial', size=14, bold=True, color='0F172A')
    subtitle_font = Font(name='Arial', size=10, italic=True, color='475569')
    meta_label_font = Font(name='Arial', size=9, bold=True, color='64748B')
    meta_val_font = Font(name='Arial', size=10, bold=True, color='0F172A')
    
    header_font = Font(name='Arial', size=10, bold=True, color='FFFFFF')
    header_fill = PatternFill(start_color='1E3A8A', end_color='1E3A8A', fill_type='solid') # Navy
    
    eligible_fill = PatternFill(start_color='D1FAE5', end_color='D1FAE5', fill_type='solid') # Soft Green
    eligible_font = Font(name='Arial', size=9, bold=True, color='065F46')
    
    not_eligible_fill = PatternFill(start_color='FEE2E2', end_color='FEE2E2', fill_type='solid') # Soft Red
    not_eligible_font = Font(name='Arial', size=9, bold=True, color='991B1B')

    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0'),
    )

    # 1. Header Banner
    ws['A1'] = f"{course.institution.name.upper()}"
    ws['A1'].font = Font(name='Arial', size=11, bold=True, color='1E3A8A')
    
    ws['A2'] = f"{course.code}: {course.title}"
    ws['A2'].font = title_font
    
    ws['A3'] = f"End-of-Semester Attendance Audit & Exam Eligibility Report • {course.academic_session.name} ({course.semester.name})"
    ws['A3'].font = subtitle_font

    # Metadata cards
    ws['A5'] = "Assigned Lecturer:"
    ws['A5'].font = meta_label_font
    ws['B5'] = f"{course.lecturer.first_name} {course.lecturer.last_name}" if course.lecturer else "Unassigned"
    ws['B5'].font = meta_val_font

    ws['A6'] = "Required Threshold:"
    ws['A6'].font = meta_label_font
    ws['B6'] = f"{course.attendance_threshold}% Minimum"
    ws['B6'].font = meta_val_font

    ws['D5'] = "Total Lectures Held:"
    ws['D5'].font = meta_label_font
    ws['E5'] = stats['total_sessions']
    ws['E5'].font = meta_val_font

    ws['D6'] = "Total Enrolled:"
    ws['D6'].font = meta_label_font
    ws['E6'] = stats['total_students']
    ws['E6'].font = meta_val_font

    ws['G5'] = "Eligible for Exam:"
    ws['G5'].font = meta_label_font
    ws['H5'] = f"{stats['eligible_count']} Students"
    ws['H5'].font = meta_val_font

    ws['G6'] = "Barred from Exam:"
    ws['G6'].font = meta_label_font
    ws['H6'] = f"{stats['not_eligible_count']} Students"
    ws['H6'].font = not_eligible_font

    # 2. Table Headers
    headers = [
        "S/N",
        "Matriculation Number",
        "Student Full Name",
        "Department",
        "Total Classes",
        "Classes Attended",
        "Attendance %",
        "Exam Eligibility Status",
    ]
    start_row = 8
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=start_row, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='center' if col_idx in [1, 5, 6, 7, 8] else 'left', vertical='center')

    # 3. Data Rows
    for row_idx, s in enumerate(stats['student_stats'], start=start_row + 1):
        c1 = ws.cell(row=row_idx, column=1, value=row_idx - start_row)
        c2 = ws.cell(row=row_idx, column=2, value=s['matric_number'])
        c3 = ws.cell(row=row_idx, column=3, value=s['name'])
        c4 = ws.cell(row=row_idx, column=4, value=s['department'])
        c5 = ws.cell(row=row_idx, column=5, value=s['total_sessions'])
        c6 = ws.cell(row=row_idx, column=6, value=s['attended_count'])
        c7 = ws.cell(row=row_idx, column=7, value=f"{s['percentage']}%")
        c8 = ws.cell(row=row_idx, column=8, value=s['status_label'])

        c1.alignment = Alignment(horizontal='center')
        c2.alignment = Alignment(horizontal='left')
        c3.alignment = Alignment(horizontal='left')
        c4.alignment = Alignment(horizontal='left')
        c5.alignment = Alignment(horizontal='center')
        c6.alignment = Alignment(horizontal='center')
        c7.alignment = Alignment(horizontal='center')
        c8.alignment = Alignment(horizontal='center')

        # Eligibility styling
        if s['is_eligible']:
            c8.fill = eligible_fill
            c8.font = eligible_font
        else:
            c8.fill = not_eligible_fill
            c8.font = not_eligible_font

        for col in range(1, 9):
            ws.cell(row=row_idx, column=col).border = thin_border

    # Adjust column widths
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            if cell.row < start_row:
                continue
            val_str = str(cell.value or '')
            if len(val_str) > max_len:
                max_len = len(val_str)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    filename = f"{course.code}_End_Of_Semester_Attendance_Report.xlsx"
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


@login_required
def export_csv_report(request, course_id):
    """Export attendance report as standard CSV."""
    course = get_object_or_404(Course, id=course_id)
    department_filter = request.GET.get('department', 'ALL')
    stats = compute_course_attendance_stats(course, department_filter)

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([f"Course: {course.code} - {course.title}"])
    writer.writerow([f"Session: {course.academic_session.name} ({course.semester.name})"])
    writer.writerow([f"Lectures Held: {stats['total_sessions']}", f"Threshold: {course.attendance_threshold}%"])
    writer.writerow([])
    writer.writerow(["S/N", "Matric Number", "Student Name", "Department", "Total Lectures", "Lectures Attended", "Attendance %", "Exam Eligibility Status"])

    for idx, s in enumerate(stats['student_stats'], 1):
        writer.writerow([
            idx,
            s['matric_number'],
            s['name'],
            s['department'],
            s['total_sessions'],
            s['attended_count'],
            f"{s['percentage']}%",
            s['status_label'],
        ])

    response = HttpResponse(output.getvalue(), content_type='text/csv')
    filename = f"{course.code}_attendance_report.csv"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
