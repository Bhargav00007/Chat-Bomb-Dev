'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';

export default function CreatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomName.trim()) {
      setError('Both fields are required');
      return;
    }
    try {
      const room = await api.createRoom({ created_by: name, name: roomName });
      router.push(`/chat/${room.code}?username=${encodeURIComponent(name)}`);
    } catch {
      setError('Failed to create room. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl mb-6 text-yellow-300">💣 CREATE ROOM</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-sm">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-900 border border-green-600 p-2 text-green-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm">Room Name</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full bg-gray-900 border border-green-600 p-2 text-green-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Give your room a name"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full border-2 border-yellow-300 py-2 text-lg hover:bg-yellow-300 hover:text-black transition"
        >
          🚀 CREATE
        </button>
      </form>
    </div>
  );
}