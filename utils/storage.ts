import { TranscriptionEntry, ChatSession } from '../types';

const STORAGE_KEY = 'agrivoice_chat_history';
const CURRENT_SESSION_KEY = 'agrivoice_current_session';
const MAX_SESSIONS = 50; // Limit number of stored sessions

/**
 * Save transcriptions to local storage
 */
export const saveTranscriptions = (transcriptions: TranscriptionEntry[]): void => {
  try {
    if (transcriptions.length === 0) return;

    // Get existing sessions
    const sessions = getChatSessions();
    
    // Get or create current session
    let currentSessionId = localStorage.getItem(CURRENT_SESSION_KEY);
    let currentSession: ChatSession | null = null;

    if (currentSessionId) {
      currentSession = sessions.find(s => s.id === currentSessionId) || null;
    }

    // If no current session or it's been more than 24 hours, create a new one
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    if (!currentSession || (now - currentSession.updatedAt > oneDayInMs)) {
      currentSession = {
        id: `session_${now}`,
        title: generateSessionTitle(transcriptions),
        transcriptions: [...transcriptions],
        createdAt: now,
        updatedAt: now,
      };
      currentSessionId = currentSession.id;
      localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
    } else {
      // Update existing session
      currentSession.transcriptions = [...transcriptions];
      currentSession.updatedAt = now;
      currentSession.title = generateSessionTitle(transcriptions) || currentSession.title;
    }

    // Remove old session if it exists and add/update current one
    const otherSessions = sessions.filter(s => s.id !== currentSession!.id);
    const updatedSessions = [currentSession, ...otherSessions]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_SESSIONS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Failed to save transcriptions to local storage:', error);
  }
};

/**
 * Load all chat sessions from local storage
 */
export const getChatSessions = (): ChatSession[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const sessions = JSON.parse(data) as ChatSession[];
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Failed to load chat sessions from local storage:', error);
    return [];
  }
};

/**
 * Get the current active session transcriptions
 */
export const getCurrentSessionTranscriptions = (): TranscriptionEntry[] => {
  try {
    const currentSessionId = localStorage.getItem(CURRENT_SESSION_KEY);
    if (!currentSessionId) return [];

    const sessions = getChatSessions();
    const currentSession = sessions.find(s => s.id === currentSessionId);
    
    return currentSession?.transcriptions || [];
  } catch (error) {
    console.error('Failed to load current session transcriptions:', error);
    return [];
  }
};

/**
 * Load transcriptions for a specific session
 */
export const getSessionTranscriptions = (sessionId: string): TranscriptionEntry[] => {
  try {
    const sessions = getChatSessions();
    const session = sessions.find(s => s.id === sessionId);
    return session?.transcriptions || [];
  } catch (error) {
    console.error('Failed to load session transcriptions:', error);
    return [];
  }
};

/**
 * Delete a chat session
 */
export const deleteChatSession = (sessionId: string): void => {
  try {
    const sessions = getChatSessions();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    
    // If deleting current session, clear current session reference
    const currentSessionId = localStorage.getItem(CURRENT_SESSION_KEY);
    if (currentSessionId === sessionId) {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  } catch (error) {
    console.error('Failed to delete chat session:', error);
  }
};

/**
 * Clear all chat history
 */
export const clearAllChatHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
};

/**
 * Start a new chat session
 */
export const startNewSession = (): string => {
  const sessionId = `session_${Date.now()}`;
  localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
  return sessionId;
};

/**
 * Generate a title for a session based on transcriptions
 */
const generateSessionTitle = (transcriptions: TranscriptionEntry[]): string => {
  if (transcriptions.length === 0) {
    return 'New Chat';
  }

  // Find first user message
  const firstUserMessage = transcriptions.find(t => t.role === 'user' && t.isFinal);
  if (firstUserMessage && firstUserMessage.text) {
    const text = firstUserMessage.text.trim();
    // Use first 50 characters as title
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  }

  return 'New Chat';
};
