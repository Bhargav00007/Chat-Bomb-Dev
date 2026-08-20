export interface Room {
  code: string;
  name: string;
  created_by: string;
  created_at: string;   // ISO datetime
  expires_at: string;   // ISO datetime
}

export interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
}

// WebSocket incoming message structure
export interface WsMessage {
  type: 'message';
  username: string;
  message: string;
  timestamp: string;
}