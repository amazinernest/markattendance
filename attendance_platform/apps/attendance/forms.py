from django import forms
from .models import AttendanceSession


class AttendanceSessionForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({
                'class': 'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 transition'
            })

    class Meta:
        model = AttendanceSession
        fields = ['topic', 'title', 'session_date', 'start_time', 'location_name']
        labels = {
            'topic': 'Class Lecture Topic',
            'title': 'Session Reference / Lecture No.',
            'session_date': 'Class Meeting Date',
            'start_time': 'Start Time',
            'location_name': 'Classroom / Lecture Hall',
        }
        widgets = {
            'topic': forms.TextInput(attrs={'placeholder': 'e.g. Introduction to Psychological Measurement & Testing'}),
            'title': forms.TextInput(attrs={'placeholder': 'e.g. Lecture 1 or Week 3 Meeting'}),
            'session_date': forms.DateInput(attrs={'type': 'date'}),
            'start_time': forms.TimeInput(attrs={'type': 'time'}),
            'location_name': forms.TextInput(attrs={'placeholder': 'e.g. Science Lecture Theatre 2 or Hall A'}),
        }
