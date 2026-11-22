from django import forms
from .models import Course

class CourseForm(forms.ModelForm):
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
