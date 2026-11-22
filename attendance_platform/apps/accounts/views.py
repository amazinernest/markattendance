from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth import login, logout, get_user_model
from .forms import LoginForm

User = get_user_model()

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            user = form.cleaned_data['user']
            login(request, user)
            return redirect('frontend:home')
    else:
        form = LoginForm()
    return render(request, 'accounts/login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('accounts:login')

def password_reset_view(request):
    return HttpResponse('Password reset placeholder')

def password_reset_done_view(request):
    return HttpResponse('Password reset done placeholder')

def password_reset_confirm_view(request, uidb64, token):
    return HttpResponse('Password reset confirm placeholder')

def password_reset_complete_view(request):
    return HttpResponse('Password reset complete placeholder')
