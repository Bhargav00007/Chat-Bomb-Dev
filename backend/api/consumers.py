import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Room
from django.utils import timezone

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            logger.info("🔥 CONNECT STARTED")
            raw_code = self.scope['url_route']['kwargs']['code']
            self.room_code = raw_code.upper()
            self.room_group_name = f'chat_{self.room_code}'
            logger.info(f"Room code: {self.room_code}")

            room = await self.get_room()
            if not room:
                logger.warning(f"❌ Room {self.room_code} not found")
                await self.close()
                return

            logger.info(f"✅ Room found: {room.name}, expires={room.expires_at}, now={timezone.now()}")

            if not room.is_active():
                logger.warning(f"⏰ Room {self.room_code} expired")
                await self.close()
                return

            logger.info("✅ Accepting connection")
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            logger.info("✅ Connection accepted")
        except Exception as e:
            logger.exception(f"💥 Exception in connect: {e}")
            await self.close()

    async def disconnect(self, close_code):
        room_code = getattr(self, 'room_code', '<unknown>')
        logger.info(f"🔌 Disconnect {room_code}, code={close_code}")
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name,
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': data.get('message'),
                'username': data.get('username', 'Anonymous'),
                'timestamp': timezone.now().isoformat(),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'username': event['username'],
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def get_room(self):
        try:
            return Room.objects.get(code=self.room_code)
        except Room.DoesNotExist:
            return None