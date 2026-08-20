from django.urls import re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r'^ws/chat/(?P<code>[a-zA-Z0-9]{6})/?$', ChatConsumer.as_asgi()),
]