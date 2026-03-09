# Session-Based Conversation Thread Feature

## Overview
Added a **conversation-based content generation** interface that allows users to have an interactive back-and-forth with the AI to refine content iteratively.

## Features

### 🗨️ Interactive Chat Interface
- Chat-like interface similar to ChatGPT/Claude
- Real-time message display with user/AI avatars
- Auto-scroll to latest message
- Timestamps on all messages

### 💬 Conversation Management
- **Start New Conversation**: Create fresh content with a brief
- **Continue Conversation**: Send follow-up messages to refine content
- **Conversation History**: Sidebar showing all past conversations
- **Delete Conversations**: Remove old conversations

### 📝 Content Display
- **Parsed Content**: AI responses are parsed to show:
  - Title (if provided)
  - Main content body
  - Hashtags as badges
- **Copy to Clipboard**: One-click copy for any AI response
- **Raw View**: Full message content available

### 🎯 Use Cases

| Scenario | How to Use |
|----------|-----------|
| **Initial Generation** | Start with a content brief |
| **Make it Shorter** | "Please make this 50% shorter" |
| **Change Tone** | "Make it more casual and friendly" |
| **Add Statistics** | "Add some industry statistics" |
| **Different Angle** | "Rewrite focusing on benefits" |
| **Translate** | "Translate this to Chinese" |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Conversation Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User creates brief                                      │
│     ↓                                                       │
│  2. startConversation() → Creates session                   │
│     ↓                                                       │
│  3. AI generates initial content                            │
│     ↓                                                       │
│  4. User sends refinement message                           │
│     ↓                                                       │
│  5. continueConversation() → Same session                   │
│     ↓                                                       │
│  6. AI responds with context awareness                      │
│     ↓                                                       │
│  7. Repeat steps 4-6 until satisfied                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Files Added/Modified

### New Files
| File | Description |
|------|-------------|
| `services/conversationService.ts` | Conversation state management |
| `pages/ConversationPage.tsx` | Chat UI interface |

### Modified Files
| File | Changes |
|------|---------|
| `services/kimiAi.ts` | Added `startConversation()` and `continueConversation()` methods |
| `services/index.ts` | Export conversation service |
| `App.tsx` | Added `/conversation` routes |
| `Sidebar.tsx` | Added "AI Assistant" navigation link |

## API Methods

### `startConversation(options)`
Creates a new conversation session with initial content generation.

```typescript
const response = await kimiAIProvider.startConversation({
  brief: {
    title: 'AI in Healthcare',
    objective: 'Educate professionals',
    targetAudience: 'Healthcare admins',
    keyMessages: ['AI is safe', 'AI is effective']
  },
  channel: 'linkedin',
  tone: 'professional',
  maxTokens: 2000
});

// Returns:
{
  conversationId: 'conv_123',
  message: Message,
  content: 'generated content...',
  title: 'AI in Healthcare: 2024 Trends',
  hashtags: ['#AI', '#Healthcare'],
  usage: { promptTokens: 150, completionTokens: 250, totalTokens: 400 }
}
```

### `continueConversation(options)`
Continues an existing conversation with follow-up messages.

```typescript
const response = await kimiAIProvider.continueConversation({
  conversationId: 'conv_123',
  userMessage: 'Make it shorter and add statistics',
  maxTokens: 2000
});

// AI responds with refined content, maintaining context
```

### `getConversation(id)`
Retrieves a conversation by ID.

### `getConversationMessages(id)`
Gets all messages for display (excludes system message).

## Conversation Service

### In-Memory Storage
- Conversations stored in a Map (in-memory)
- Auto-cleanup after 7 days of inactivity
- Max 100 conversations tracked

### Message Structure
```typescript
interface Message {
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
```

### Conversation Structure
```typescript
interface Conversation {
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
```

## User Interface

### Chat Interface
```
┌──────────────────────────────────────┬────────────────────────────┐
│  AI Assistant                        │  Conversation History      │
│  Have a conversation...              │  ┌─────────────────────┐   │
├──────────────────────────────────────┤  │ New Conversation    │   │
│                                      │  ├─────────────────────┤   │
│  🤖 AI                               │  │ 📄 AI in Healthcare │   │
│  ┌──────────────────────────────┐    │  │ 5 messages          │   │
│  │ TITLE: AI in Healthcare      │    │  └─────────────────────┘   │
│  │                              │    │  │ 📄 Product Launch   │   │
│  │ Content body...              │    │  │ 3 messages          │   │
│  │                              │    │  └─────────────────────┘   │
│  │ #AI #Healthcare              │    │                            │
│  └──────────────────────────────┘    │                            │
│                              2:30 PM │                            │
│                                      │                            │
│  👤 You                              │                            │
│  ┌──────────────────────────────┐    │                            │
│  │ Make it shorter              │    │                            │
│  └──────────────────────────────┘    │                            │
│                              2:31 PM │                            │
│                                      │                            │
│  🤖 AI                               │                            │
│  ┌──────────────────────────────┐    │                            │
│  │ Here's a shorter version...  │    │                            │
│  └──────────────────────────────┘    │                            │
│                              2:32 PM │                            │
│                                      │                            │
├──────────────────────────────────────┤                            │
│  [Ask AI to refine content...] [Send]│                            │
└──────────────────────────────────────┴────────────────────────────┘
```

## Benefits Over One-Shot Generation

| Feature | One-Shot | Conversation |
|---------|----------|--------------|
| **Initial Content** | ✅ Yes | ✅ Yes |
| **Refinement** | ❌ Start over | ✅ Continue chatting |
| **Context Memory** | ❌ None | ✅ Full context |
| **Iteration Speed** | ❌ Slow (new API call) | ✅ Faster (context retained) |
| **User Experience** | ❌ Frustrating | ✅ Natural chat flow |
| **Final Quality** | ⚠️ Depends on prompt | ✅ Higher through iteration |

## Performance Considerations

### Caching
- Identical requests are still cached at proxy level
- Conversation history is stored in memory (lost on refresh)
- In production, use Redis or database for persistence

### Token Usage
- Longer conversations use more tokens (context accumulation)
- Consider max conversation length (e.g., 20 messages)
- Clear old messages to reduce token usage

### Optimization Tips
1. **Keep conversations focused**: One topic per conversation
2. **Start fresh for new topics**: Don't mix unrelated content
3. **Use concise follow-ups**: Short messages reduce token usage
4. **Clear old conversations**: Prevents memory bloat

## Future Enhancements

### Planned
- [ ] Export conversation to content library
- [ ] Conversation templates
- [ ] Multi-turn content comparison
- [ ] Conversation sharing
- [ ] Persistent storage (Redis/Database)

### Potential
- [ ] Real-time streaming responses
- [ ] Voice input for messages
- [ ] AI suggestions for follow-ups
- [ ] Conversation branching (A/B variants)

## Usage Example

```typescript
// 1. Start conversation
const response1 = await kimiAIProvider.startConversation({
  brief: { title: 'Product Launch', ... },
  channel: 'linkedin'
});

// 2. Refine content
const response2 = await kimiAIProvider.continueConversation({
  conversationId: response1.conversationId,
  userMessage: 'Add more excitement and emojis'
});

// 3. Further refinement
const response3 = await kimiAIProvider.continueConversation({
  conversationId: response1.conversationId,
  userMessage: 'Make it shorter, under 200 words'
});

// 4. Save final content
const finalContent = response3.content;
```

## Navigation

Access the conversation interface at:
- **URL**: `/conversation`
- **Sidebar**: "AI Assistant" menu item
- **Direct Link**: http://localhost:5173/conversation
