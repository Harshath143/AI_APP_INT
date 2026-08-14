export type Role = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  error?: boolean;
  imageUri?: string;
  audioDuration?: number;
}

export type AudioSourceMode = 'mic' | 'system' | 'both';

export interface CandidateRoleOption {
  id: string;
  label: string;
  systemPrompt: string;
}

export const CANDIDATE_ROLES: CandidateRoleOption[] = [
  {
    id: 'python-dev',
    label: 'Python Dev',
    systemPrompt:
      'You are an expert Python Developer undergoing a technical job interview. Provide clear, concise, direct, and high-impact answers to the interview questions. Write production-quality code snippets when asked.',
  },
  {
    id: 'react-native-dev',
    label: 'React Native Dev',
    systemPrompt:
      'You are a Senior React Native & Mobile Engineer in a technical interview. Deliver clear, accurate, and optimal answers covering React Native, TypeScript, state management, native bridges, and mobile performance.',
  },
  {
    id: 'system-design',
    label: 'System Design',
    systemPrompt:
      'You are a Principal Software Architect answering system design interview questions. Structure your answers with clear trade-offs, scalability, data flow, storage choices, and high availability.',
  },
  {
    id: 'fullstack-dev',
    label: 'Fullstack Engineer',
    systemPrompt:
      'You are a Lead Fullstack Engineer in a coding interview. Provide expert answers on frontend performance, backend APIs, databases, microservices, and clean architecture.',
  },
  {
    id: 'general',
    label: 'General Tech',
    systemPrompt:
      'You are a top-tier software engineer in a technical interview. Give structured, articulate, direct, and impressive technical answers.',
  },
];

export const GROQ_MODELS = [
  { id: 'llama-3.1-8b-instant', label: 'llama-3.1-8b-instant (Fastest)' },
  { id: 'llama-3.3-70b-versatile', label: 'llama-3.3-70b-versatile (Best Quality)' },
  { id: 'mixtral-8x7b-32768', label: 'mixtral-8x7b-32768 (Long Context)' },
  { id: 'llama3-70b-8192', label: 'llama3-70b-8192' },
  { id: 'llama3-8b-8192', label: 'llama3-8b-8192' },
  { id: 'gemma2-9b-it', label: 'gemma2-9b-it' },
];

export const GROQ_VISION_MODELS = [
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout 17B (Default)' },
  { id: 'llama-3.2-11b-vision-preview', label: 'Llama 3.2 11B Vision' },
];

export interface AppSettings {
  apiKey: string;
  model: string;
  visionModel: string;
  roleId: string;
  customSystemPrompt: string;
  opacity: number;
  audioMode: AudioSourceMode;
}
