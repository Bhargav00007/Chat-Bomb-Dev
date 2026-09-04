'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/app/lib/api';
import { ChatMessage } from '@/app/types';

export default function ChatPage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const code = params.code;
  const username = searchParams.get('username') || 'Anonymous';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [roomName, setRoomName] = useState('');
  const [creator, setCreator] = useState('');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const room = await api.getRoom(code);
        setRoomName(room.name);
        setCreator(room.created_by);
        const expiry = new Date(room.expires_at);
        const now = new Date();
        const diff = expiry.getTime() - now.getTime();
        if (diff <= 0) {
          setError('This room has expired.');
        } else {
          setRemaining(Math.floor(diff / 1000));
        }
      } catch {
        setError('Room not found or expired.');
      }
    };
    fetchRoom();
  }, [code]);

  // Timer
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('Room expired!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  // Poll messages
  const fetchMessages = async () => {
    try {
      const data = await api.get<any[]>(`/rooms/${code}/messages/`);
      // Convert API response (content) to our message field
      const mapped = data.map((msg) => ({
        username: msg.username,
        message: msg.content,
        timestamp: msg.timestamp,
      }));
      setMessages(mapped);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  useEffect(() => {
    if (error) return;
    // Fetch immediately
    fetchMessages();
    // Poll every 2 seconds
    pollInterval.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [code, error]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await api.post(`/rooms/${code}/messages/`, {
        username,
        content: input,
      });
      setInput('');
      // Immediately fetch new messages
      await fetchMessages();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 font-mono flex flex-col items-center justify-center p-4">
        <p className="text-2xl">{error}</p>
        <a href="/" className="mt-4 border border-yellow-300 px-6 py-2 text-yellow-300 hover:bg-yellow-300 hover:text-black">
          ↩ Back Home
        </a>
      </div>
    );
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col p-4">
      {/* Header with room info and timer */}
      <div className="border-b border-green-600 pb-2 mb-4 flex justify-between items-center flex-wrap">
        <div>
          <span className="text-yellow-300 text-2xl">{roomName}</span>
          <span className="text-sm text-gray-400 ml-4">by {creator}</span>
          <span className="text-sm text-gray-400 ml-4">code: {code}</span>
        </div>
        <div className="text-xl text-yellow-300">{formatTime(remaining)}</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 border border-green-600 p-2 h-96 bg-gray-900">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <span className="text-yellow-300 font-bold">{msg.username}</span>
            <span className="text-gray-500 text-xs ml-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
            <p className="text-green-300 break-words">{msg.message}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-900 border border-green-600 p-2 text-green-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          disabled={remaining <= 0}
        />
        <button
          type="submit"
          className="border-2 border-yellow-300 px-6 py-2 hover:bg-yellow-300 hover:text-black transition disabled:opacity-50"
          disabled={remaining <= 0}
        >
          SEND
        </button>
      </form>

      <div className="mt-2 text-sm text-gray-500">
        {remaining > 0 ? `Room will self‑destruct in ${formatTime(remaining)}` : 'Room expired'}
      </div>
    </div>
  );
}