from django import forms
from django.contrib.auth import get_user_model, authenticate
from django.core.exceptions import ValidationError

User = get_user_model()

class LoginForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'w-full p-2 border rounded'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'w-full p-2 border rounded'}))

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')
        if email and password:
            user = authenticate(username=email, password=password)
            if user is None:
                raise ValidationError('Invalid email or password')
            if not user.is_active:
                raise ValidationError('Account is inactive')
            cleaned_data['user'] = user
        return cleaned_data


class LecturerRegistrationForm(forms.ModelForm):
    password = forms.CharField(
        label="Create Password",
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs text-slate-900',
            'placeholder': 'Minimum 6 characters'
        })
    )
    confirm_password = forms.CharField(
        label="Confirm Password",
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs text-slate-900',
            'placeholder': 'Re-enter your password'
        })
    )

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']
        labels = {
            'first_name': 'First Name / Title (e.g. Dr. Alex)',
            'last_name': 'Last Name / Surname',
            'email': 'Institutional Email Address',
        }
        widgets = {
            'first_name': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs text-slate-900',
                'placeholder': 'e.g. Dr. Sarah'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs text-slate-900',
                'placeholder': 'e.g. Connor'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs text-slate-900',
                'placeholder': 'lecturer@university.edu'
            }),
        }

    def clean_email(self):
        email = self.cleaned_data.get('email', '').lower().strip()
        if User.objects.filter(email=email).exists():
            raise ValidationError("An account with this email address already exists.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')

        if password and confirm_password and password != confirm_password:
            raise ValidationError("Passwords do not match. Please re-enter them.")

        if password and len(password) < 6:
            raise ValidationError("Password must be at least 6 characters long.")

        return cleaned_data
