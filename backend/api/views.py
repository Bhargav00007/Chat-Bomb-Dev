from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.utils import timezone
from .models import Room
from .serializers import RoomSerializer
import random
import string

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class CreateRoomView(generics.CreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def perform_create(self, serializer):
        code = generate_code()
        # Ensure uniqueness
        while Room.objects.filter(code=code).exists():
            code = generate_code()
        serializer.save(code=code)

class JoinRoomView(generics.RetrieveAPIView):
    serializer_class = RoomSerializer
    lookup_field = 'code'

    def get_queryset(self):
        return Room.objects.filter(expires_at__gt=timezone.now())

@api_view(['GET'])
def active_rooms(request):
    rooms = Room.objects.filter(expires_at__gt=timezone.now()).order_by('-created_at')[:10]
    serializer = RoomSerializer(rooms, many=True)
    return Response(serializer.data)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Room, Message
from .serializers import MessageSerializer
from django.utils import timezone

@api_view(['GET', 'POST'])
def room_messages(request, code):
    try:
        room = Room.objects.get(code=code, expires_at__gt=timezone.now())
    except Room.DoesNotExist:
        return Response({'error': 'Room not found or expired'}, status=404)

    if request.method == 'GET':
        # Return messages for this room, newest last (or oldest first)
        messages = room.messages.all().order_by('timestamp')[:100]
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        username = request.data.get('username')
        content = request.data.get('content')
        if not username or not content:
            return Response({'error': 'Missing username or content'}, status=400)
        msg = Message.objects.create(room=room, username=username, content=content)
        serializer = MessageSerializer(msg)
        return Response(serializer.data, status=201)