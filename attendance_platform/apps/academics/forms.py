from django import forms
from .models import AcademicSession, Semester

class AcademicSessionForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({
                'class': 'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm placeholder:text-slate-400 text-slate-800 transition'
            })

    class Meta:
        model = AcademicSession
        fields = ['name', 'start_date', 'end_date']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
        }

class SemesterForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({
                'class': 'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm placeholder:text-slate-400 text-slate-800 transition'
            })

    class Meta:
        model = Semester
        fields = ['name', 'order']
        widgets = {
            'order': forms.NumberInput(attrs={'min': 1}),
        }
