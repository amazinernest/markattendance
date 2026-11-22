from django import forms
from .models import Course

class CourseForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if not isinstance(field.widget, forms.CheckboxInput):
                field.widget.attrs.update({
                    'class': 'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm placeholder:text-slate-400 text-slate-800 transition'
                })
            else:
                field.widget.attrs.update({
                    'class': 'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
                })

    class Meta:
        model = Course
        fields = [
            "title",
            "code",
            "description",
            "institution",
            "faculty",
            "department",
            "academic_session",
            "semester",
            "level",
            "lecturer",
            "expected_population",
            "attendance_threshold",
            "schedule",
            "is_archived",
        ]
        widgets = {
            "description": forms.Textarea(attrs={"rows": 3}),
            "attendance_threshold": forms.NumberInput(attrs={"step": "0.01"}),
        }
