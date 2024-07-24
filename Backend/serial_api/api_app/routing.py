# api_app/routing.py
from django.urls import re_path
from . import consumer

websocket_urlpatterns = [
    re_path(r'ws/arduino/$', consumer.ArduinoConsumer.as_asgi()),
]