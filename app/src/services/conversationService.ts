import type { ContentBrief } from '@/types';

// In-memory conversation storage (in production, use Redis or database)
const conversations = new Map<string, Conversation>();

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    duration?: number;
    model?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  brief: ContentBrief;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  channel?: string;
  tone?: string;
  language?: string;
}

export interface CreateConversationOptions {
  brief: ContentBrief;
  channel?: string;
  tone?: string;
  language?: string;
}

export interface AddMessageOptions {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Message['metadata'];
}

/**
 * Generate a unique conversation ID
 */
function generateId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new conversation session
 */
export function createConversation(options: CreateConversationOptions): Conversation {
  const { brief, channel = 'general', tone = 'professional', language = 'en' } = options;
  
  const conversation: Conversation = {
    id: generateId(),
    title: brief.title || 'New Conversation',
    brief,
    channel,
    tone,
    language,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Add system message with context
  const systemMessage: Message = {
    id: generateMessageId(),
    role: 'system',
    content: `You are an expert content creator. You are helping create content for ${channel}.
Tone: ${tone}
Language: ${language}

Brief Context:
- Title: ${brief.title}
- Objective: ${brief.objective}
- Target Audience: ${brief.targetAudience}
- Key Messages: ${brief.keyMessages?.join(', ') || 'N/A'}
- Call to Action: ${brief.callToAction || 'N/A'}

Guidelines:
- Maintain consistent tone throughout the conversation
- Reference previous context when refining content
- Provide specific, actionable suggestions
- Keep responses concise and focused`,
    timestamp: new Date()
  };

  conversation.messages.push(systemMessage);
  conversations.set(conversation.id, conversation);
  
  console.log(`[Conversation] Created: ${conversation.id}`);
  return conversation;
}

/**
 * Add a message to an existing conversation
 */
export function addMessage(options: AddMessageOptions): Message {
  const { conversationId, role, content, metadata } = options;
  
  const conversation = conversations.get(conversationId);
  if (!conversation) {
    throw new Error(`Conversation not found: ${conversationId}`);
  }

  const message: Message = {
    id: generateMessageId(),
    role,
    content,
    timestamp: new Date(),
    metadata
  };

  conversation.messages.push(message);
  conversation.updatedAt = new Date();
  
  console.log(`[Conversation] Added ${role} message to ${conversationId}`);
  return message;
}

/**
 * Get a conversation by ID
 */
export function getConversation(id: string): Conversation | undefined {
  return conversations.get(id);
}

/**
 * Get all messages for a conversation (excluding system message for display)
 */
export function getConversationMessages(id: string): Message[] {
  const conversation = conversations.get(id);
  if (!conversation) return [];
  
  // Return all messages except system message
  return conversation.messages.filter(m => m.role !== 'system');
}

/**
 * Get all messages including system message (for API calls)
 */
export function getAllMessages(id: string): Message[] {
  const conversation = conversations.get(id);
  return conversation?.messages || [];
}

/**
 * Get all active conversations
 */
export function getAllConversations(): Conversation[] {
  return Array.from(conversations.values()).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

/**
 * Update conversation title
 */
export function updateConversationTitle(id: string, title: string): void {
  const conversation = conversations.get(id);
  if (conversation) {
    conversation.title = title;
    conversation.updatedAt = new Date();
  }
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): boolean {
  return conversations.delete(id);
}

/**
 * Clear all conversations (use with caution)
 */
export function clearAllConversations(): void {
  conversations.clear();
}

/**
 * Get conversation statistics
 */
export function getConversationStats(): {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
} {
  const totalConversations = conversations.size;
  const totalMessages = Array.from(conversations.values()).reduce(
    (sum, conv) => sum + conv.messages.length,
    0
  );
  
  return {
    totalConversations,
    totalMessages,
    avgMessagesPerConversation: totalConversations > 0 
      ? Math.round(totalMessages / totalConversations) 
      : 0
  };
}

/**
 * Export conversation to JSON (for saving/sharing)
 */
export function exportConversation(id: string): string {
  const conversation = conversations.get(id);
  if (!conversation) {
    throw new Error(`Conversation not found: ${id}`);
  }
  
  return JSON.stringify(conversation, null, 2);
}

// Auto-cleanup old conversations (optional)
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CONVERSATION_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [id, conversation] of conversations.entries()) {
    if (now - conversation.updatedAt.getTime() > MAX_CONVERSATION_AGE) {
      conversations.delete(id);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`[Conversation] Cleaned up ${cleaned} old conversations`);
  }
}, CLEANUP_INTERVAL);

export default {
  createConversation,
  addMessage,
  getConversation,
  getConversationMessages,
  getAllMessages,
  getAllConversations,
  updateConversationTitle,
  deleteConversation,
  clearAllConversations,
  getConversationStats,
  exportConversation
};
