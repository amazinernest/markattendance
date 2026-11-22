import re
import csv
import io
import openpyxl
import docx
import pdfplumber


MATRIC_PATTERNS = [
    re.compile(r'^[A-Za-z]{2,6}[/-]\d{2,4}[/-]\d{2,7}$', re.IGNORECASE),
    re.compile(r'^\d{7,12}$'),  # Pure numeric matrics e.g. UNILAG 250305001
    re.compile(r'^[A-Za-z]\d{6,14}$', re.IGNORECASE),  # e.g. U2019557001
    re.compile(r'^[A-Za-z0-9]{2,5}/[A-Za-z0-9]{2,5}/\d{2,4}/\d{2,6}$', re.IGNORECASE),
    re.compile(r'^\d{2,4}/[A-Za-z0-9]{2,6}/\d{2,6}$', re.IGNORECASE),
    re.compile(r'^[A-Za-z]{2,5}\d{5,12}$', re.IGNORECASE),
    re.compile(r'^[A-Za-z0-9/_-]{6,22}$')
]

EXCLUDED_WORDS = {
    'MATRIC', 'MATRICNO', 'MATRICNUMBER', 'MATRICULATION', 'REGNO', 'REGNUMBER',
    'REGISTRATION', 'STUDENTID', 'STUDENTNO', 'IDNUMBER', 'NAME', 'STUDENTNAME',
    'FULLNAME', 'SURNAME', 'FIRSTNAME', 'OTHERNAME', 'MIDDLENAME', 'CANDIDATE',
    'SN', 'S/N', 'SERIAL', 'NO', 'NUMBER', 'CA', 'EXAM', 'TOTAL', 'GRADE', 'SCORE',
    'MARK', 'TEST', 'REMARK', 'SIGNATURE', 'DATE', 'DEPARTMENT', 'DEPT', 'FACULTY',
    'COLLEGE', 'PROGRAMME', 'COURSE', 'SEMESTER', 'SESSION', 'LEVEL', 'UNIVERSITY',
    'INSTITUTION', 'CAMPUS', 'OFFICE', 'CONTINUOUS', 'ASSESSMENT', 'PRESENT', 'ABSENT'
}


def normalize_token(val):
    if val is None:
        return ""
    return re.sub(r'[^a-z0-9]', '', str(val).lower())


def is_matric_candidate(val):
    """Check if a cell value represents a student matric / registration number."""
    if val is None:
        return False
    s = str(val).strip()
    if not s or len(s) < 5 or len(s) > 28:
        return False

    norm = normalize_token(s)
    if norm.upper() in EXCLUDED_WORDS:
        return False

    # Skip phone numbers (e.g., 080..., 070..., 090..., +234...)
    if re.match(r'^(?:\+?234|0)[789]0\d{8}$|^(?:\+?234|0)[789]1\d{8}$', norm):
        return False

    # Skip single integers like serial numbers (1, 2, ... 1000) or test scores
    if s.isdigit():
        if len(s) < 6:
            return False
        # If 6-12 digits, it's a valid matric (e.g. UNILAG 250305001)
        return True

    # Check against known matric formats
    for pattern in MATRIC_PATTERNS:
        if pattern.match(s):
            return True

    return False


def is_name_candidate(val):
    """Check if a cell value represents a student name."""
    if val is None:
        return False
    s = str(val).strip()
    if len(s) < 3 or len(s) > 70:
        return False

    # Student names should not contain digits or arithmetic symbols
    if re.search(r'[\d=+\\/*_<>#$@!%^&]', s):
        return False

    norm = normalize_token(s)
    if norm.upper() in EXCLUDED_WORDS:
        return False

    upper = s.upper()
    institutional_terms = [
        'UNIVERSITY', 'FACULTY', 'DEPARTMENT', 'FOUNDATION', 'COLLEGE',
        'GUIDANCE', 'COUNSELLING', 'PSYCHOLOGY', 'MATRIC', 'TOTAL', 'GRADE',
        'EXAM', 'TEST', 'ASSESSMENT', 'REMARK', 'SIGNATURE', 'TITLE', 'LECTURER'
    ]
    if any(term in upper for term in institutional_terms):
        return False

    # Must contain alphabetic words
    words = [w for w in re.split(r'[\s,.-]+', s) if w.isalpha() and len(w) >= 2]
    return len(words) >= 2


def is_name_part(val):
    """Check if a cell could be a single surname, firstname, or middlename."""
    if val is None:
        return False
    s = str(val).strip()
    if len(s) < 2 or len(s) > 35:
        return False
    if not s.replace('-', '').replace("'", '').isalpha():
        return False
    norm = normalize_token(s)
    if norm.upper() in EXCLUDED_WORDS:
        return False
    return True


def is_email_candidate(val):
    if not val:
        return False
    s = str(val).strip()
    return bool(re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', s))


def is_dept_candidate(val):
    if not val:
        return False
    s = str(val).strip()
    if len(s) < 2 or len(s) > 80:
        return False
    norm = normalize_token(s)
    if norm.upper() in EXCLUDED_WORDS:
        return False
    return True


def clean_student_row(raw_matric, raw_name, raw_dept="", raw_email=""):
    matric = str(raw_matric or '').strip().upper()
    name = str(raw_name or '').strip().title()
    dept = str(raw_dept or '').strip().title()
    email = str(raw_email or '').strip().lower()

    if not matric or not name:
        return None

    # Sanitize matric: strip trailing .0 from float conversions (e.g. 250305001.0 -> 250305001)
    if matric.endswith('.0') and matric[:-2].isdigit():
        matric = matric[:-2]

    # Reject if matric looks like header
    if normalize_token(matric).upper() in EXCLUDED_WORDS:
        return None
    if normalize_token(name).upper() in EXCLUDED_WORDS:
        return None

    return {
        'matric_number': matric,
        'name': name,
        'department': dept,
        'email': email,
    }


def find_column_indices(headers):
    """Detect column indices for matric number, student name, department, email."""
    col_map = {
        'matric': None,
        'name': None,
        'surname': None,
        'firstname': None,
        'othernames': None,
        'dept': None,
        'email': None
    }
    
    for idx, h in enumerate(headers):
        norm = normalize_token(h)
        if not norm:
            continue
        
        # Matric matching
        if any(term in norm for term in ['matric', 'regno', 'regnumber', 'studentid', 'studentno', 'matno', 'admissionno', 'jamb', 'candno']):
            if col_map['matric'] is None:
                col_map['matric'] = idx
        # Separate Surname / Firstname
        elif any(term in norm for term in ['surname', 'lastname']):
            if col_map['surname'] is None:
                col_map['surname'] = idx
        elif any(term in norm for term in ['firstname', 'givenname']):
            if col_map['firstname'] is None:
                col_map['firstname'] = idx
        elif any(term in norm for term in ['othername', 'middlename']):
            if col_map['othernames'] is None:
                col_map['othernames'] = idx
        # Full Name matching
        elif any(term in norm for term in ['fullname', 'studentname', 'name', 'names', 'candidate', 'particular']):
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


def extract_from_row_deep(row_vals):
    """
    Intelligently inspect a row's cells to find a matric number and student name,
    regardless of which column they appear in, merged cells, or missing headers.
    """
    if not row_vals or not any(row_vals):
        return None

    matric_found = None
    name_found = None
    dept_found = ""
    email_found = ""

    # 1. Identify matric candidate
    matric_idx = -1
    for idx, val in enumerate(row_vals):
        if is_matric_candidate(val):
            matric_found = str(val).strip()
            matric_idx = idx
            break

    if not matric_found:
        return None

    # 2. Identify name candidate (must not be the matric cell)
    for idx, val in enumerate(row_vals):
        if idx == matric_idx:
            continue
        if is_name_candidate(val):
            name_found = str(val).strip()
            break

    # If no multi-word name found, check if there are adjacent name parts (e.g. Surname, First Name)
    if not name_found:
        name_parts = []
        for idx, val in enumerate(row_vals):
            if idx == matric_idx:
                continue
            if is_name_part(val):
                name_parts.append(str(val).strip())
        if len(name_parts) >= 2:
            name_found = " ".join(name_parts)

    if not name_found:
        return None

    # 3. Check for email & department
    for idx, val in enumerate(row_vals):
        if idx == matric_idx:
            continue
        if is_email_candidate(val):
            email_found = str(val).strip()
        elif is_dept_candidate(val) and val != name_found and not dept_found:
            dept_val = str(val).strip()
            if any(term in dept_val.lower() for term in ['eng', 'sci', 'arts', 'edu', 'law', 'med', 'soc', 'dep', 'bio', 'chem', 'phys', 'math', 'comp']):
                dept_found = dept_val

    return clean_student_row(matric_found, name_found, dept_found, email_found)


def parse_excel_file(file_obj):
    """Extract students from Excel (.xlsx, .xls) files across all sheets with deep scanning."""
    wb = openpyxl.load_workbook(file_obj, data_only=True)
    students = []
    seen_matrics = set()

    for sheetname in wb.sheetnames:
        sheet = wb[sheetname]
        col_map = None

        for row in sheet.iter_rows(values_only=True):
            row_vals = [v for v in row]
            if not any(row_vals):
                continue

            # First, check if this row defines headers
            if col_map is None:
                str_row = [str(v).strip() if v is not None else '' for v in row_vals]
                tested_map = find_column_indices(str_row)
                has_matric_header = tested_map['matric'] is not None
                has_name_header = tested_map['name'] is not None or (tested_map['surname'] is not None and tested_map['firstname'] is not None)
                if has_matric_header and has_name_header:
                    col_map = tested_map
                    continue

            # If headers are mapped, try extracting with header map (including merged-cell offsets)
            student = None
            if col_map is not None:
                m_idx = col_map['matric']
                raw_matric = None
                # Check target column and adjacent column for merged cell offsets
                for offset in [0, 1, -1]:
                    check_idx = m_idx + offset
                    if 0 <= check_idx < len(row_vals):
                        val = row_vals[check_idx]
                        if is_matric_candidate(val):
                            raw_matric = val
                            break

                # Extract Name
                raw_name = None
                if col_map['name'] is not None and col_map['name'] < len(row_vals):
                    val = row_vals[col_map['name']]
                    if is_name_candidate(val):
                        raw_name = val
                
                # If name not found by single column, check split surname + firstname
                if not raw_name and col_map['surname'] is not None and col_map['firstname'] is not None:
                    s_idx = col_map['surname']
                    f_idx = col_map['firstname']
                    s_val = str(row_vals[s_idx] or '').strip() if s_idx < len(row_vals) else ''
                    f_val = str(row_vals[f_idx] or '').strip() if f_idx < len(row_vals) else ''
                    if is_name_part(s_val) and is_name_part(f_val):
                        raw_name = f"{s_val} {f_val}"

                raw_dept = row_vals[col_map['dept']] if col_map.get('dept') is not None and col_map['dept'] < len(row_vals) else ''
                raw_email = row_vals[col_map['email']] if col_map.get('email') is not None and col_map['email'] < len(row_vals) else ''

                if raw_matric and raw_name:
                    student = clean_student_row(raw_matric, raw_name, raw_dept, raw_email)

            # Deep row inspection fallback if header extraction missed or col_map not yet established
            if not student:
                student = extract_from_row_deep(row_vals)

            if student and student['matric_number'] not in seen_matrics:
                seen_matrics.add(student['matric_number'])
                students.append(student)

    return students


def parse_csv_file(file_obj):
    """Extract students from CSV files."""
    content = file_obj.read()
    if isinstance(content, bytes):
        text = content.decode('utf-8', errors='replace')
    else:
        text = str(content)

    reader = csv.reader(io.StringIO(text))
    students = []
    seen_matrics = set()

    for row in reader:
        if not row or not any(row):
            continue
        student = extract_from_row_deep(row)
        if student and student['matric_number'] not in seen_matrics:
            seen_matrics.add(student['matric_number'])
            students.append(student)

    return students


def parse_docx_file(file_obj):
    """Extract students from Word (.docx) tables or text paragraphs."""
    doc = docx.Document(file_obj)
    students = []
    seen_matrics = set()

    # 1. Search all tables
    for table in doc.tables:
        for row in table.rows:
            cell_texts = [c.text.strip() for c in row.cells]
            student = extract_from_row_deep(cell_texts)
            if student and student['matric_number'] not in seen_matrics:
                seen_matrics.add(student['matric_number'])
                students.append(student)

    # 2. Search paragraphs
    if not students:
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
            # Split line by tabs, multiple spaces, or commas
            tokens = [t.strip() for t in re.split(r'[\t,|]+|\s{2,}', text) if t.strip()]
            student = extract_from_row_deep(tokens)
            if student and student['matric_number'] not in seen_matrics:
                seen_matrics.add(student['matric_number'])
                students.append(student)

    return students


def parse_binary_doc_file(file_obj):
    """Extract students from legacy Word (.doc) binary files."""
    if hasattr(file_obj, 'read'):
        raw = file_obj.read()
    else:
        raw = file_obj

    # Extract all readable ASCII strings
    ascii_strings = [s.decode('latin1', errors='ignore').strip() for s in re.findall(rb'[\x20-\x7E]{3,}', raw)]
    students = []
    seen_matrics = set()

    for i, s in enumerate(ascii_strings):
        if is_matric_candidate(s):
            # Check adjacent strings for a student name
            name = None
            for offset in [-1, 1, -2, 2, -3, 3]:
                idx = i + offset
                if 0 <= idx < len(ascii_strings) and is_name_candidate(ascii_strings[idx]):
                    name = ascii_strings[idx]
                    break
            
            if name:
                student = clean_student_row(s, name)
                if student and student['matric_number'] not in seen_matrics:
                    seen_matrics.add(student['matric_number'])
                    students.append(student)

    return students


def parse_pdf_file(file_obj):
    """Extract students from PDF files via pdfplumber tables or text extraction."""
    students = []
    seen_matrics = set()

    with pdfplumber.open(file_obj) as pdf:
        for page in pdf.pages:
            # 1. Try tables
            tables = page.extract_tables() or []
            for table in tables:
                for row in table:
                    if not row:
                        continue
                    cell_texts = [str(c or '').strip() for c in row]
                    student = extract_from_row_deep(cell_texts)
                    if student and student['matric_number'] not in seen_matrics:
                        seen_matrics.add(student['matric_number'])
                        students.append(student)

            # 2. Fallback to line-by-line text
            text = page.extract_text() or ''
            for line in text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                tokens = [t.strip() for t in re.split(r'[\t,|]+|\s{2,}', line) if t.strip()]
                student = extract_from_row_deep(tokens)
                if student and student['matric_number'] not in seen_matrics:
                    seen_matrics.add(student['matric_number'])
                    students.append(student)

    return students


def extract_students_from_file(file_obj, filename):
    """Universal dispatcher to parse students from any uploaded document."""
    lower_name = filename.lower()
    if lower_name.endswith(('.xlsx', '.xlsm', '.xltx')):
        return parse_excel_file(file_obj)
    elif lower_name.endswith('.csv'):
        return parse_csv_file(file_obj)
    elif lower_name.endswith(('.docx', '.docm')):
        return parse_docx_file(file_obj)
    elif lower_name.endswith('.doc'):
        return parse_binary_doc_file(file_obj)
    elif lower_name.endswith('.pdf'):
        return parse_pdf_file(file_obj)
    else:
        # Generic fallback: try openpyxl first, then docx, then binary
        try:
            return parse_excel_file(file_obj)
        except Exception:
            try:
                if hasattr(file_obj, 'seek'):
                    file_obj.seek(0)
                return parse_docx_file(file_obj)
            except Exception:
                if hasattr(file_obj, 'seek'):
                    file_obj.seek(0)
                return parse_binary_doc_file(file_obj)
