import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, ChatMessage } from '../types/chat';

const STORAGE_KEYS = {
  SETTINGS: '@interview_ai_settings_v1',
  MESSAGES: '@interview_ai_messages_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  model: 'llama-3.1-8b-instant',
  visionModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
  roleId: 'python-dev',
  customSystemPrompt: '',
  opacity: 0.95,
  audioMode: 'system',
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Silent fail or log sanitized
  }
}

export async function loadMessages(): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveMessages(messages: ChatMessage[]): Promise<void> {
  try {
    // Keep max 50 recent messages to optimize storage
    const trimmed = messages.slice(-50);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(trimmed));
  } catch {
    // Silent fail
  }
}

export async function clearStorageMessages(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.MESSAGES);
  } catch {
    // Silent fail
  }
}
