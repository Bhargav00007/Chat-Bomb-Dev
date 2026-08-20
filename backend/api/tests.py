import datetime

from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from django.utils import timezone

from chat_bomb.asgi import application
from .models import Room


class ChatConsumerTests(TransactionTestCase):
	async def test_live_room_accepts_websocket_and_broadcasts_messages(self):
		room = await self.create_room()
		communicator = WebsocketCommunicator(
			application,
			f'/ws/chat/{room.code}',
		)

		connected, _ = await communicator.connect()
		self.assertTrue(connected)

		await communicator.send_json_to({
			'message': 'hello',
			'username': 'tester',
		})
		response = await communicator.receive_json_from()

		self.assertEqual(response['message'], 'hello')
		self.assertEqual(response['username'], 'tester')
		await communicator.disconnect()

	@database_sync_to_async
	def create_room(self):
		return Room.objects.create(
			code='ABC123',
			name='Test room',
			created_by='tester',
			expires_at=timezone.now() + datetime.timedelta(minutes=5),
		)
