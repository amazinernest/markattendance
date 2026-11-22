from django import forms
from .models import AttendanceSession


class AttendanceSessionForm(forms.ModelForm):
    RADIUS_CHOICES = [
        (50, '50m – Compact Seminar Room / Lab'),
        (100, '100m – Standard Lecture Hall'),
        (150, '150m – Large Amphitheatre / Lecture Complex (Recommended)'),
        (250, '250m – Multi-building Faculty Block'),
        (500, '500m – Wide Campus Wing'),
    ]

    geofence_radius_meters = forms.ChoiceField(
        choices=RADIUS_CHOICES,
        initial=150,
        required=False,
        label='Allowed Geofence Radius'
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for name, field in self.fields.items():
            if name == 'enable_geofence':
                field.widget.attrs.update({
                    'class': 'h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900'
                })
            elif not isinstance(field.widget, forms.HiddenInput):
                field.widget.attrs.update({
                    'class': 'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 transition'
                })

    class Meta:
        model = AttendanceSession
        fields = [
            'topic',
            'title',
            'session_date',
            'start_time',
            'location_name',
            'enable_geofence',
            'venue_latitude',
            'venue_longitude',
            'geofence_radius_meters',
        ]
        labels = {
            'topic': 'Class Lecture Topic',
            'title': 'Session Reference / Lecture No.',
            'session_date': 'Class Meeting Date',
            'start_time': 'Start Time',
            'location_name': 'Classroom / Lecture Hall',
            'enable_geofence': 'Enforce Classroom GPS Geofence (Anti-Proxy)',
            'geofence_radius_meters': 'Classroom Verification Radius',
        }
        widgets = {
            'topic': forms.TextInput(attrs={'placeholder': 'e.g. Introduction to Psychological Measurement & Testing'}),
            'title': forms.TextInput(attrs={'placeholder': 'e.g. Lecture 1 or Week 3 Meeting'}),
            'session_date': forms.DateInput(attrs={'type': 'date'}),
            'start_time': forms.TimeInput(attrs={'type': 'time'}),
            'location_name': forms.TextInput(attrs={'placeholder': 'e.g. Science Lecture Theatre 2 or Hall A'}),
            'venue_latitude': forms.HiddenInput(),
            'venue_longitude': forms.HiddenInput(),
        }
