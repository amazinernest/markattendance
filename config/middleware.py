import threading
from django.utils.deprecation import MiddlewareMixin
from django.db import connection

class TenantMiddleware(MiddlewareMixin):
    """Attach the current institution to the request and enforce PostgreSQL RLS.

    The middleware expects the custom user model to have an `institution` FK.
    For each authenticated request we set a session variable `app.current_institution`
    that can be used in row‑level security policies.
    """
    _local = threading.local()

    def process_request(self, request):
        request.institution = None
        if connection.vendor != 'postgresql':
            if request.user.is_authenticated and hasattr(request.user, 'institution'):
                request.institution = request.user.institution
            return

        if request.user.is_authenticated and hasattr(request.user, 'institution'):
            institution = request.user.institution
            if institution:
                request.institution = institution
                # Set a PostgreSQL GUC (user‑defined variable) for RLS policies.
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT set_config('app.current_institution', %s, false)",
                        [str(institution.id)],
                    )
        else:
            # Ensure the GUC is cleared for unauthenticated requests.
            with connection.cursor() as cursor:
                cursor.execute("SELECT set_config('app.current_institution', NULL, false)")

    def process_response(self, request, response):
        if connection.vendor == 'postgresql':
            # Clean up after the request – clear the GUC.
            with connection.cursor() as cursor:
                cursor.execute("SELECT set_config('app.current_institution', NULL, false)")
        return response
