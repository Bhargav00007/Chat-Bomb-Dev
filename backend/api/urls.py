from django.urls import path
from .views import CreateRoomView, JoinRoomView, active_rooms, room_messages

urlpatterns = [
    path('rooms/active/', active_rooms, name='active-rooms'),
    path('rooms/create/', CreateRoomView.as_view(), name='create-room'),
    path('rooms/<str:code>/', JoinRoomView.as_view(), name='join-room'),
    path('rooms/<str:code>/messages/', room_messages, name='room-messages'),
]