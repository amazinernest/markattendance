from django.shortcuts import render, get_object_or_404, redirect
from .models import AcademicSession, Semester
from .forms import AcademicSessionForm, SemesterForm

def session_list(request):
    sessions = AcademicSession.objects.all()
    return render(request, 'academics/session_list.html', {'sessions': sessions})

def session_create(request):
    if request.method == 'POST':
        form = AcademicSessionForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('academics:session_list')
    else:
        form = AcademicSessionForm()
    return render(request, 'academics/session_form.html', {'form': form})

def semester_list(request, session_id):
    session = get_object_or_404(AcademicSession, pk=session_id)
    semesters = session.semesters.all()
    return render(request, 'academics/semester_list.html', {'session': session, 'semesters': semesters})

def semester_create(request, session_id):
    session = get_object_or_404(AcademicSession, pk=session_id)
    if request.method == 'POST':
        form = SemesterForm(request.POST)
        if form.is_valid():
            semester = form.save(commit=False)
            semester.session = session
            semester.save()
            return redirect('academics:semester_list', session_id=session.id)
    else:
        form = SemesterForm()
    return render(request, 'academics/semester_form.html', {'form': form, 'session': session})
