from django import forms
from .models import Course


class CourseForm(forms.ModelForm):
    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user

        # Tailor form visibility: lecturers should not be forced into complex institution/admin selects
        is_admin = False
        if user and hasattr(user, 'role') and user.role == getattr(user.Role, 'ADMIN', 'admin'):
            is_admin = True

        if not is_admin:
            if 'institution' in self.fields:
                self.fields['institution'].required = False
                self.fields['institution'].widget = forms.HiddenInput()
            if 'lecturer' in self.fields:
                self.fields['lecturer'].required = False
                self.fields['lecturer'].widget = forms.HiddenInput()
            if 'academic_session' in self.fields:
                self.fields['academic_session'].required = False
            if 'semester' in self.fields:
                self.fields['semester'].required = False
            if 'is_archived' in self.fields:
                self.fields['is_archived'].widget = forms.HiddenInput()
        else:
            if 'institution' in self.fields:
                self.fields['institution'].required = False
            if 'lecturer' in self.fields:
                self.fields['lecturer'].required = False
            if 'academic_session' in self.fields:
                self.fields['academic_session'].required = False
            if 'semester' in self.fields:
                self.fields['semester'].required = False

        # Apply modern Tailwind styles to all inputs
        for field_name, field in self.fields.items():
            if not isinstance(field.widget, (forms.CheckboxInput, forms.HiddenInput)):
                field.widget.attrs.update({
                    'class': 'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs placeholder:text-slate-400 text-slate-800 transition'
                })
            elif isinstance(field.widget, forms.CheckboxInput):
                field.widget.attrs.update({
                    'class': 'h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900'
                })

        # Helpful placeholders
        if 'code' in self.fields:
            self.fields['code'].widget.attrs['placeholder'] = 'e.g. GCE 104 or CSC 201'
        if 'title' in self.fields:
            self.fields['title'].widget.attrs['placeholder'] = 'e.g. Introduction to Psychological Testing'
        if 'department' in self.fields:
            self.fields['department'].widget.attrs['placeholder'] = 'e.g. Guidance & Counselling'
        if 'faculty' in self.fields:
            self.fields['faculty'].widget.attrs['placeholder'] = 'e.g. Education'
        if 'level' in self.fields:
            self.fields['level'].widget.attrs['placeholder'] = 'e.g. 100 Level or Year 1'
        if 'schedule' in self.fields:
            self.fields['schedule'].widget.attrs['placeholder'] = 'e.g. Tuesdays 10:00 AM - 12:00 PM, Hall A'
        if 'participating_departments' in self.fields:
            self.fields['participating_departments'].widget.attrs['placeholder'] = 'e.g. Guidance & Counselling, Educational Psychology'

    class Meta:
        model = Course
        fields = [
            "title",
            "code",
            "description",
            "department",
            "faculty",
            "level",
            "schedule",
            "participating_departments",
            "expected_population",
            "attendance_threshold",
            "academic_session",
            "semester",
            "institution",
            "lecturer",
            "is_archived",
        ]
        widgets = {
            "description": forms.Textarea(attrs={"rows": 3, "placeholder": "Brief course overview or learning objectives..."}),
            "attendance_threshold": forms.NumberInput(attrs={"step": "1", "min": "1", "max": "100"}),
            "expected_population": forms.NumberInput(attrs={"min": "0"}),
        }
