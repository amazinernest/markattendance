from django import forms
from .models import AttendanceSession


class AttendanceSessionForm(forms.ModelForm):
    RADIUS_CHOICES = [
        (30, '30m – Small Seminar Room / Lab'),
        (60, '60m – Medium Lecture Hall'),
        (100, '100m – Large Lecture Complex (Recommended)'),
        (150, '150m – Amphitheatre / Multi-floor Block'),
        (250, '250m – Wide Faculty Quadrangle'),
    ]

    geofence_radius_meters = forms.ChoiceField(
        choices=RADIUS_CHOICES,
        initial=100,
        required=False,
        label='Allowed Geofence Radius'
    )

    enable_geofence = forms.BooleanField(
        initial=True,
        required=False,
        label='Enforce Classroom GPS Geofence (Anti-Proxy)'
    )

    enforce_device_lock = forms.BooleanField(
        initial=True,
        required=False,
        label='Block Multiple Check-ins from Same Device'
    )

    strict_anti_spoofing = forms.BooleanField(
        initial=True,
        required=False,
        label='Strict Anti-Spoofing & Fake GPS Detection'
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for name, field in self.fields.items():
            if name in ('enable_geofence', 'enforce_device_lock', 'strict_anti_spoofing'):
                field.widget.attrs.update({
                    'class': 'h-4 w-4 rounded border-slate-300 text-[#84cc16] focus:ring-[#84cc16]'
                })
            elif not isinstance(field.widget, forms.HiddenInput):
                field.widget.attrs.update({
                    'class': 'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#84cc16] focus:ring-1 focus:ring-[#84cc16] text-xs text-slate-900 transition outline-none'
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
            'enforce_device_lock',
            'strict_anti_spoofing',
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
