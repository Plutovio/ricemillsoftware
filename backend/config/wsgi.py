"""
WSGI config for Rice Mill Software project.
"""

import os
import django
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Run migrations and seed data programmatically on server startup
django.setup()
try:
    from django.core.management import call_command
    print("Programmatic startup: Running migrate...")
    call_command('migrate', interactive=False)
    print("Programmatic startup: Running seed_bg...")
    call_command('seed_bg')
    print("Programmatic startup database setup complete!")
except Exception as e:
    print(f"Programmatic startup error: {e}")

application = get_wsgi_application()
