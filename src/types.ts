export type ProviderId = 'gemini' | 'groq' | 'sambanova' | 'openrouter';

export type SearchEngineProvider = 'google' | 'tavily' | 'serper' | 'brave' | 'duckduckgo';

export interface ProviderKeyConfig {
  gemini?: string;
  groq?: string;
  sambanova?: string;
  openrouter?: string;
  tavily?: string;
  serper?: string;
  brave?: string;
}

export type AgentRole = 'architect' | 'skeptic' | 'verifier' | 'arbiter';

export interface AgentConfig {
  id: AgentRole;
  name: string;
  roleTitle: string;
  description: string;
  provider: ProviderId;
  model: string;
  avatarColor: string;
  systemPrompt: string;
}

export interface DebateStep {
  stepId: string;
  role: AgentRole;
  agentName: string;
  provider: ProviderId;
  model: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  content: string;
  timestamp: number;
  durationMs?: number;
  critiqueSummary?: string;
  summary?: string;
  agreedPoints?: string[];
  disputedPoints?: string[];
}

export type DebateTone = 'diplomatic' | 'balanced' | 'rigorous' | 'aggressive';

export interface DebateSession {
  id: string;
  prompt: string;
  protocol: 'trio' | 'quad' | 'duel';
  tone?: DebateTone;
  searchEngine?: SearchEngineProvider;
  enableSearchGrounding?: boolean;
  createdAt: number;
  updatedAt?: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  steps: DebateStep[];
  finalOutput?: string;
  metrics?: {
    durationMs: number;
    consensusRate: number; // 0 - 100%
    contentionLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
    resolvedPointsCount: number;
  };
  error?: string;
}

export interface PresetQuestion {
  id: string;
  title: string;
  category: string;
  prompt: string;
  difficulty: 'Quick' | 'Complex' | 'Deep';
}

export type WindowViewMode = 'chat' | 'council' | 'split';

export interface HeartbeatState {
  bpm: number;
  role?: AgentRole;
  agentName?: string;
  statusText: string;
  taskReminder?: string;
  timestamp: number;
}

export interface SessionSnapshot {
  id: string;
  sessionId: string;
  name: string;
  prompt: string;
  protocol: 'trio' | 'quad' | 'duel';
  steps: DebateStep[];
  finalOutput?: string;
  timestamp: number;
}
