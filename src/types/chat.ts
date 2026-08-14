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
  { id: 'qwen/qwen3.6-27b', label: 'qwen/qwen3.6-27b' },
  { id: 'openai/gpt-oss-120b', label: 'openai/gpt-oss-120b' },
  { id: 'openai/gpt-oss-20b', label: 'openai/gpt-oss-20b' },
];

export const GROQ_VISION_MODELS = [
  { id: 'qwen/qwen3.6-27b', label: 'qwen/qwen3.6-27b' },
  { id: 'openai/gpt-oss-120b', label: 'openai/gpt-oss-120b' },
  { id: 'openai/gpt-oss-20b', label: 'openai/gpt-oss-20b' },
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
