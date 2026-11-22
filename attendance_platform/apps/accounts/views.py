from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import login, logout, get_user_model
from django.contrib import messages
from .forms import LoginForm

User = get_user_model()

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
