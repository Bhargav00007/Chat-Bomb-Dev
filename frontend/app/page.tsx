'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/app/lib/api';
import { Room } from '@/app/types';

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await api.getActiveRooms();
        setRooms(data);
      } catch (error) {
        console.error('Failed to fetch active rooms', error);
      }
    };
    fetchRooms();
  }, []);

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-8 tracking-widest text-yellow-300">CHAT BOMB</h1>
      <div className="flex gap-6 mb-10">
        <Link
          href="/create"
          className="border-2 border-yellow-300 px-8 py-3 text-xl hover:bg-yellow-300 hover:text-black transition"
        >
          CREATE ROOM
        </Link>
        <Link
          href="/join"
          className="border-2 border-yellow-300 px-8 py-3 text-xl hover:bg-yellow-300 hover:text-black transition"
        >
          ENTER ROOM
        </Link>
      </div>

      {rooms.length > 0 && (
        <div className="w-full max-w-md border border-dashed border-green-600 p-4">
          <h2 className="text-center text-lg mb-3 text-yellow-300">↺ RECENT ROOMS</h2>
          <ul className="space-y-2">
            {rooms.map((room) => (
              <li key={room.code} className="flex justify-between items-center bg-gray-900 p-2 rounded">
                <div>
                  <span className="font-bold">{room.name}</span>
                  <span className="text-sm text-gray-400 ml-2">by {room.created_by}</span>
                </div>
                <Link href={`/chat/${room.code}`} className="text-yellow-300 underline hover:no-underline">
                  join →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}