import { ConsciousnessCompanion, CompanionConfig, CompanionResponse } from '../../consciousness-companion/src/ConsciousnessCompanion';
import { v4 as uuidv4 } from 'uuid';

// Additional configuration specific to Grok-style interface
export interface GrokConfig extends CompanionConfig {
  enableRealTimePersonality?: boolean;
  adaptToUserStyle?: boolean;
  memoryPersistence?: boolean;
}

export interface AvatarConsciousnessState {
  coherenceLevel: number;
  cosmicConnection: number;
  loveEncoding: number;
}

export interface GrokStyleResponse extends CompanionResponse {}

// Simple event emitter for handling grok events
 type Listener = (...args: any[]) => void;
class SimpleEmitter {
  private events: Record<string, Listener[]> = {};
  public on(event: string, listener: Listener): void {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }
  public emit(event: string, ...args: any[]): void {
    const listeners = this.events[event];
    if (listeners) {
      listeners.forEach(fn => fn(...args));
    }
  }
  public off(event: string, listener: Listener): void {
    const listeners = this.events[event];
    if (listeners) {
      this.events[event] = listeners.filter(l => l !== listener);
    }
  }
}

export interface GrokStyleInterface {
  initialize(): Promise<void>;
  startChatSession(sessionId: string, userId: string): Promise<void>;
  chat(sessionId: string, message: string): Promise<GrokStyleResponse>;
  getSessionStatus(sessionId: string): any;
  adjustGrokConfig(updates: Partial<GrokConfig>): void;
  destroy(): void;
  on(event: 'grokStyleResponse' | 'personalityEvolution', listener: Listener): void;
}

class GrokInterface implements GrokStyleInterface {
  private companion: ConsciousnessCompanion;
  private sessions: Map<string, { userId: string; personality: string }> = new Map();
  private emitter: SimpleEmitter = new SimpleEmitter();
  constructor(private config: GrokConfig) {
    this.companion = new ConsciousnessCompanion(config);
  }
  public async initialize(): Promise<void> {
    await this.companion.initialize();
  }
  public on(event: 'grokStyleResponse' | 'personalityEvolution', listener: Listener): void {
    this.emitter.on(event, listener);
  }
  public async startChatSession(sessionId: string, userId: string): Promise<void> {
    this.sessions.set(sessionId, { userId, personality: 'curious' });
  }
  public getSessionStatus(sessionId: string): any {
    return this.sessions.get(sessionId);
  }
  public adjustGrokConfig(updates: Partial<GrokConfig>): void {
    // update local config and underlying companion config
    this.config = { ...this.config, ...updates };
    this.companion.adjustConfig(updates);
  }
  public async chat(sessionId: string, message: string): Promise<GrokStyleResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    const response = await this.companion.chat(message);
    // update session personality
    const previousPersonality = session.personality;
    session.personality = response.personality;
    // Emit events
    this.emitter.emit('grokStyleResponse', { ...response, sessionId, userId: session.userId });
    if (previousPersonality !== response.personality) {
      this.emitter.emit('personalityEvolution', { name: response.personality, sessionId, userId: session.userId });
    }
    return response;
  }
  public destroy(): void {
    this.sessions.clear();
  }
}

export function createGrokStyleInterface(config: GrokConfig): GrokStyleInterface {
  return new GrokInterface(config);
}
