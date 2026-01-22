export enum SessionStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
}

export interface TranscriptionEntry {
  id: string;
  role: 'user' | 'model';
  text: string;
  isFinal: boolean;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  transcriptions: TranscriptionEntry[];
  createdAt: number;
  updatedAt: number;
}
