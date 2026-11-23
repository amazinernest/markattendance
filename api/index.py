import os
import logging
import django.core.wsgi

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
application = django.core.wsgi.get_wsgi_application()

# Safe auto-migration execution on deployment/cold-start
try:
    from django.core.management import call_command
    call_command('migrate', interactive=False)
except Exception as e:
    logging.getLogger('classmarker.startup').warning("Auto-migration check notice: %s", e)

app = application
