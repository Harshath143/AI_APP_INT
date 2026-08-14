import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, ChatMessage } from '../types/chat';

const STORAGE_KEYS = {
  SETTINGS: '@interview_ai_settings_v1',
  MESSAGES: '@interview_ai_messages_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  model: 'qwen/qwen3.6-27b',
  visionModel: 'qwen/qwen3.6-27b',
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

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export async function saveMessages(messages: ChatMessage[]): Promise<void> {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(async () => {
    try {
      // Keep max 50 recent messages to optimize storage
      const trimmed = messages.slice(-50);
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(trimmed));
    } catch {
      // Silent fail
    }
  }, 1000);
}

export async function clearStorageMessages(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.MESSAGES);
  } catch {
    // Silent fail
  }
}
