import axios, { AxiosInstance } from 'axios';
import { Room } from '@/app/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async createRoom(data: { created_by: string; name: string }): Promise<Room> {
    return this.post<Room>('/rooms/create/', data);
  }

  async getRoom(code: string): Promise<Room> {
    return this.get<Room>(`/rooms/${code}/`);
  }

  async getActiveRooms(): Promise<Room[]> {
    return this.get<Room[]>('/rooms/active/');
  }
}

export const api = new ApiClient();