'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';

export default function JoinPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Both fields are required');
      return;
    }
    const upperCode = code.toUpperCase();
    try {
      await api.getRoom(upperCode);
      router.push(`/chat/${upperCode}?username=${encodeURIComponent(name)}`);
    } catch {
      setError('Invalid room code or room expired');
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl mb-6 text-yellow-300">ENTER ROOM</h1>
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
          <label className="block text-sm">Room Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full bg-gray-900 border border-green-600 p-2 text-green-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 uppercase"
            placeholder="e.g. A1B2C3"
            maxLength={6}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full border-2 border-yellow-300 py-2 text-lg hover:bg-yellow-300 hover:text-black transition"
        >
          JOIN
        </button>
      </form>
    </div>
  );
}