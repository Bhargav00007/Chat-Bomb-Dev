import os

# 1. Set the settings module FIRST (note the correct variable name!)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat_bomb.settings')

# 2. Load the Django ASGI application (this populates the app registry)
from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

# 3. Now import Channels stuff (which can safely import models)
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from api.routing import websocket_urlpatterns

# 4. Build the final application
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})