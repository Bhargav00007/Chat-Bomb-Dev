from rest_framework import serializers
from .models import Room
from .models import Message

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['code', 'name', 'created_by', 'created_at', 'expires_at']
        read_only_fields = ['code', 'created_at', 'expires_at']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'username', 'content', 'timestamp']