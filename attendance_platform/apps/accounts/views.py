from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import login, logout, get_user_model
from django.contrib import messages
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from .forms import LoginForm, LecturerRegistrationForm
from attendance_platform.apps.institutions.models import Institution

User = get_user_model()


@never_cache
@csrf_protect
def register_view(request):
    """Allows any new lecturer to self-register an account."""
    if request.user.is_authenticated:
        return redirect('frontend:dashboard')

    if request.method == 'POST':
        form = LecturerRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.role = User.Role.LECTURER
            user.set_password(form.cleaned_data['password'])
            
            # Link to default institution if available
            default_inst = Institution.objects.first()
            if default_inst:
                user.institution = default_inst

            user.save()
            login(request, user)
            messages.success(request, f"Welcome to Attendly, {user.first_name or 'Professor'}! Your account is active. Let's create your first course.")
            return redirect('courses:course_create')
    else:
        form = LecturerRegistrationForm()

    return render(request, 'accounts/register.html', {'form': form})


@never_cache
@csrf_protect
def login_view(request):
    redirect_to = request.POST.get('next') or request.GET.get('next') or '/'
    # If already logged in, redirect to dashboard/home
    if request.user.is_authenticated:
        return redirect(redirect_to)

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            user = form.cleaned_data['user']
            login(request, user)
            display_name = user.first_name or user.email.split('@')[0].capitalize()
            messages.success(request, f"Welcome back, {display_name}!")
            return redirect(redirect_to)
    else:
        form = LoginForm()
    return render(request, 'accounts/login.html', {'form': form, 'next': redirect_to})

def logout_view(request):
    logout(request)
    messages.info(request, "You have been signed out successfully.")
    return redirect('accounts:login')

def password_reset_view(request):
    return HttpResponse('Password reset feature coming soon')

def password_reset_done_view(request):
    return HttpResponse('Password reset done placeholder')

def password_reset_confirm_view(request, uidb64, token):
    return HttpResponse('Password reset confirm placeholder')

def password_reset_complete_view(request):
    return HttpResponse('Password reset complete placeholder')
