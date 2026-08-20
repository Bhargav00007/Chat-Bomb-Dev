import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat_bomb.settings')

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.asgi import get_asgi_application
from django.urls import re_path   # 👈 this is the fix

class EchoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("🔥🔥🔥 WEBSOCKET ACCEPTED (no checks)")
        await self.accept()

    async def disconnect(self, close_code):
        print("🔥🔥🔥 DISCONNECT")

    async def receive(self, text_data):
        await self.send(text_data=text_data)

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter([
        re_path(r"^.*$", EchoConsumer.as_asgi()),  # 👈 now using re_path
    ]),
})