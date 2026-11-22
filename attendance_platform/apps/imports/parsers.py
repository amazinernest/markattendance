import re
import csv
import io
import openpyxl
import docx
import pdfplumber


def normalize_header(header):
    if not header:
        return ""
    return re.sub(r'[^a-z0-9]', '', str(header).lower())


def find_column_indices(headers):
    """Detect column indices for matric number, student name, department, email."""
    col_map = {'matric': None, 'name': None, 'dept': None, 'email': None}
    
    for idx, h in enumerate(headers):
        norm = normalize_header(h)
        if not norm:
            continue
        
        # Matric matching
        if any(term in norm for term in ['matric', 'regno', 'regnumber', 'studentid', 'studentno', 'matno', 'admissionno']):
            if col_map['matric'] is None:
                col_map['matric'] = idx
        # Name matching
        elif any(term in norm for term in ['name', 'fullname', 'studentname', 'candidate']):
            if col_map['name'] is None:
                col_map['name'] = idx
        # Department matching
        elif any(term in norm for term in ['dept', 'department', 'programme', 'discipline', 'major']):
            if col_map['dept'] is None:
                col_map['dept'] = idx
        # Email matching
        elif any(term in norm for term in ['email', 'mail']):
            if col_map['email'] is None:
                col_map['email'] = idx

    return col_map


def clean_student_row(raw_matric, raw_name, raw_dept="", raw_email=""):
    matric = str(raw_matric or '').strip().upper()
    name = str(raw_name or '').strip().title()
    dept = str(raw_dept or '').strip().title()
    email = str(raw_email or '').strip().lower()

    if not matric or not name:
        return None
    # Filter out header rows that might have leaked through
    if normalize_header(matric) in ['matricnumber', 'matricno', 'regno', 'matric'] or normalize_header(name) in ['name', 'studentname', 'fullname']:
        return None

    return {
        'matric_number': matric,
        'name': name,
        'department': dept,
        'email': email,
    }


def parse_excel_file(file_obj):
    """Extract students from Excel (.xlsx, .xls) files."""
    wb = openpyxl.load_workbook(file_obj, data_only=True)
    students = []
    
    for sheetname in wb.sheetnames:
        sheet = wb[sheetname]
        headers = []
        header_row_idx = None
        col_map = None

        for row_idx, row in enumerate(sheet.iter_rows(values_only=True)):
            row_vals = [str(v).strip() if v is not None else '' for v in row]
            if not any(row_vals):
                continue
            
            # Identify header row
            if col_map is None:
                tested_map = find_column_indices(row_vals)
                if tested_map['matric'] is not None and tested_map['name'] is not None:
                    col_map = tested_map
                    header_row_idx = row_idx
                    continue
            
            if col_map is not None:
                matric_idx = col_map['matric']
                name_idx = col_map['name']
                dept_idx = col_map.get('dept')
                email_idx = col_map.get('email')

                raw_matric = row[matric_idx] if matric_idx < len(row) else ''
                raw_name = row[name_idx] if name_idx < len(row) else ''
                raw_dept = row[dept_idx] if dept_idx is not None and dept_idx < len(row) else ''
                raw_email = row[email_idx] if email_idx is not None and email_idx < len(row) else ''

                student = clean_student_row(raw_matric, raw_name, raw_dept, raw_email)
                if student:
                    students.append(student)

    return students


def parse_csv_file(file_obj):
    """Extract students from CSV files."""
    content = file_obj.read()
    if isinstance(content, bytes):
        text = content.decode('utf-8', errors='replace')
    else:
        text = content
    
    reader = csv.reader(io.StringIO(text))
    students = []
    col_map = None

    for row in reader:
        if not row:
            continue
        row_vals = [c.strip() for c in row]
        if col_map is None:
            tested_map = find_column_indices(row_vals)
            if tested_map['matric'] is not None and tested_map['name'] is not None:
                col_map = tested_map
                continue
        
        if col_map is not None:
            raw_matric = row[col_map['matric']] if col_map['matric'] < len(row) else ''
            raw_name = row[col_map['name']] if col_map['name'] < len(row) else ''
            raw_dept = row[col_map['dept']] if col_map['dept'] is not None and col_map['dept'] < len(row) else ''
            raw_email = row[col_map['email']] if col_map['email'] is not None and col_map['email'] < len(row) else ''

            student = clean_student_row(raw_matric, raw_name, raw_dept, raw_email)
            if student:
                students.append(student)

    return students


def parse_docx_file(file_obj):
    """Extract students from Word (.docx) tables or formatted paragraphs."""
    doc = docx.Document(file_obj)
    students = []

    # 1. First search in tables
    for table in doc.tables:
        col_map = None
        for row in table.rows:
            cell_texts = [c.text.strip() for c in row.cells]
            if not any(cell_texts):
                continue
            
            if col_map is None:
                tested_map = find_column_indices(cell_texts)
                if tested_map['matric'] is not None and tested_map['name'] is not None:
                    col_map = tested_map
                    continue

            if col_map is not None:
                raw_matric = cell_texts[col_map['matric']] if col_map['matric'] < len(cell_texts) else ''
                raw_name = cell_texts[col_map['name']] if col_map['name'] < len(cell_texts) else ''
                raw_dept = cell_texts[col_map['dept']] if col_map['dept'] is not None and col_map['dept'] < len(cell_texts) else ''
                raw_email = cell_texts[col_map['email']] if col_map['email'] is not None and col_map['email'] < len(cell_texts) else ''

                student = clean_student_row(raw_matric, raw_name, raw_dept, raw_email)
                if student:
                    students.append(student)

    # 2. If no table was found or extracted, search text paragraphs using regex
    if not students:
        matric_pattern = re.compile(r'([A-Za-z]{2,5}[/-]\d{4}[/-]\d{2,6}|[A-Za-z0-9]{6,16})')
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
            match = matric_pattern.search(text)
            if match:
                matric = match.group(1).upper()
                # Name is everything else on the line
                remaining = text.replace(match.group(0), '').strip(' ,-\t\n.:')
                if len(remaining) >= 3:
                    student = clean_student_row(matric, remaining)
                    if student:
                        students.append(student)

    return students


def parse_pdf_file(file_obj):
    """Extract students from PDF files via pdfplumber tables or text extraction."""
    students = []
    with pdfplumber.open(file_obj) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                col_map = None
                for row in table:
                    if not row:
                        continue
                    cell_texts = [str(c or '').strip() for c in row]
                    if col_map is None:
                        tested_map = find_column_indices(cell_texts)
                        if tested_map['matric'] is not None and tested_map['name'] is not None:
                            col_map = tested_map
                            continue
                    
                    if col_map is not None:
                        raw_matric = cell_texts[col_map['matric']] if col_map['matric'] < len(cell_texts) else ''
                        raw_name = cell_texts[col_map['name']] if col_map['name'] < len(cell_texts) else ''
                        raw_dept = cell_texts[col_map['dept']] if col_map['dept'] is not None and col_map['dept'] < len(cell_texts) else ''
                        raw_email = cell_texts[col_map['email']] if col_map['email'] is not None and col_map['email'] < len(cell_texts) else ''

                        student = clean_student_row(raw_matric, raw_name, raw_dept, raw_email)
                        if student:
                            students.append(student)

            # If no tables found on page, fallback to regex line search
            if not tables:
                text = page.extract_text() or ''
                matric_pattern = re.compile(r'([A-Za-z]{2,5}[/-]\d{4}[/-]\d{2,6}|[A-Za-z0-9]{6,16})')
                for line in text.split('\n'):
                    line = line.strip()
                    match = matric_pattern.search(line)
                    if match:
                        matric = match.group(1).upper()
                        remaining = line.replace(match.group(0), '').strip(' ,-\t.:')
                        if len(remaining) >= 3:
                            student = clean_student_row(matric, remaining)
                            if student:
                                students.append(student)

    return students


def extract_students_from_file(file_obj, filename):
    """Dispatch to specific parser based on file extension."""
    lower_name = filename.lower()
    if lower_name.endswith(('.xlsx', '.xls')):
        return parse_excel_file(file_obj)
    elif lower_name.endswith('.csv'):
        return parse_csv_file(file_obj)
    elif lower_name.endswith(('.docx', '.doc')):
        return parse_docx_file(file_obj)
    elif lower_name.endswith('.pdf'):
        return parse_pdf_file(file_obj)
    else:
        raise ValueError(f"Unsupported file format: {filename}. Please upload .xlsx, .docx, .pdf, or .csv.")
