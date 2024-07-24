"""
ASGI config for serial_api project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

# serial_api/asgi.py
import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from api_app import routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'serial_api.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter(
        routing.websocket_urlpatterns
    ),
})