import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Copy,
  Bot,
  User,
  Loader2,
  Trash2,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { kimiAIProvider } from '@/services/kimiAi';
import conversationService, { type Conversation } from '@/services/conversationService';
import type { ContentBrief } from '@/types';

// Use mock mode for development (set to false to use real API)
const USE_MOCK_MODE = true;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  parsedContent?: {
    title?: string;
    content: string;
    hashtags?: string[];
  };
}

export function ConversationPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);

  // Load conversations on mount
  useEffect(() => {
    setConversations(conversationService.getAllConversations());
  }, []);

  // Load existing conversation if ID is provided
  useEffect(() => {
    if (conversationId) {
      const conversation = conversationService.getConversation(conversationId);
      if (conversation) {
        loadConversation(conversation);
      }
    }
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
    const msgs = conversationService.getConversationMessages(conversation.id);
    
    const chatMessages: ChatMessage[] = msgs
      .filter(m => m.role !== 'system')
      .map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.timestamp,
        parsedContent: m.role === 'assistant' ? parseContent(m.content) : undefined
      }));
    
    setMessages(chatMessages);
  };

  const parseContent = (text: string) => {
    const titleMatch = text.match(/TITLE:\s*(.+?)(?=\n|$)/i);
    const contentMatch = text.match(/CONTENT:\s*([\s\S]+?)(?=HASHTAGS:|$)/i);
    const hashtagsMatch = text.match(/HASHTAGS:\s*(.+?)(?=\n|$)/i);

    return {
      title: titleMatch ? titleMatch[1].trim() : undefined,
      content: contentMatch ? contentMatch[1].trim() : text,
      hashtags: hashtagsMatch 
        ? hashtagsMatch[1].trim().split(/\s+/).filter(h => h.startsWith('#'))
        : undefined
    };
  };

  const startNewConversation = async (brief: ContentBrief) => {
    setIsLoading(true);
    
    try {
      if (USE_MOCK_MODE) {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create conversation
        const conversation = conversationService.createConversation({
          brief,
          channel: 'linkedin',
          tone: 'professional'
        });
        
        // Add mock user message
        conversationService.addMessage({
          conversationId: conversation.id,
          role: 'user',
          content: `Create content for: ${brief.title}`
        });
        
        // Add mock assistant response
        const mockResponse = `TITLE: ${brief.title}

CONTENT:
🚀 ${brief.title}

${brief.objective}

Key takeaways:
${brief.keyMessages.map(msg => `• ${msg}`).join('\n')}

${brief.callToAction || 'What are your thoughts? Share below! 👇'}

HASHTAGS: #Innovation #Leadership #BusinessGrowth`;

        conversationService.addMessage({
          conversationId: conversation.id,
          role: 'assistant',
          content: mockResponse,
          metadata: { tokens: 250, duration: 1500, model: 'kimi-k2.5-mock' }
        });
        
        loadConversation(conversation);
        setConversations(conversationService.getAllConversations());
        toast.success('Content generated!');
      } else {
        // Real API call
        const response = await kimiAIProvider.startConversation({
          brief,
          channel: 'linkedin',
          tone: 'professional',
          maxTokens: 2000
        });
        
        loadConversation(kimiAIProvider.getConversation(response.conversationId)!);
        setConversations(conversationService.getAllConversations());
        toast.success('Content generated!');
      }
    } catch (error) {
      toast.error(`Failed to generate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentConversationId || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      if (USE_MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockResponse = `I've updated the content based on your feedback:

TITLE: Revised Content

CONTENT:
${userMessage.includes('shorter') ? 'Here is a more concise version...' : 'Here is the updated version...'}

Key improvements made:
• Adjusted tone and style
• Optimized for the platform
• Incorporated your suggestions

HASHTAGS: #Updated #Content`;

        conversationService.addMessage({
          conversationId: currentConversationId,
          role: 'user',
          content: userMessage
        });

        conversationService.addMessage({
          conversationId: currentConversationId,
          role: 'assistant',
          content: mockResponse,
          metadata: { tokens: 200, duration: 1000, model: 'kimi-k2.5-mock' }
        });

        const assistantMsg: ChatMessage = {
          id: `resp-${Date.now()}`,
          role: 'assistant',
          content: mockResponse,
          timestamp: new Date(),
          parsedContent: parseContent(mockResponse)
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        toast.success('Content updated!');
      } else {
        const response = await kimiAIProvider.continueConversation({
          conversationId: currentConversationId,
          userMessage,
          maxTokens: 2000
        });

        const assistantMsg: ChatMessage = {
          id: response.message.id,
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          parsedContent: {
            title: response.title,
            content: response.content,
            hashtags: response.hashtags
          }
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        toast.success('Content updated!');
      }
      
      setConversations(conversationService.getAllConversations());
    } catch (error) {
      toast.error(`Failed to get response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    conversationService.deleteConversation(id);
    setConversations(conversationService.getAllConversations());
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
    }
    toast.success('Conversation deleted');
  };

  const loadSampleBrief = () => {
    const sampleBrief: ContentBrief = {
      title: 'AI in Healthcare: 2024 Trends',
      objective: 'Educate healthcare professionals about emerging AI trends',
      targetAudience: 'Healthcare administrators and clinicians',
      keyMessages: [
        'AI diagnostics are becoming more accurate',
        'Regulatory frameworks are evolving',
        'Patient privacy remains a top priority'
      ],
      callToAction: 'Share your AI implementation experiences',
      keywords: ['AI', 'healthcare', 'technology', 'innovation']
    };
    
    startNewConversation(sampleBrief);
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Conversation History */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-border bg-card flex flex-col"
            >
              <div className="p-4 border-b border-border">
                <Button 
                  className="w-full gap-2" 
                  onClick={loadSampleBrief}
                  disabled={isLoading}
                >
                  <Sparkles className="w-4 h-4" />
                  New Conversation
                </Button>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No conversations yet
                    </div>
                  ) : (
                    conversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => loadConversation(conv)}
                        className={cn(
                          'w-full text-left p-3 rounded-lg transition-colors group relative',
                          currentConversationId === conv.id 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-secondary'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{conv.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {conv.messages.length - 1} messages • {conv.channel}
                            </p>
                          </div>
                          <button
                            onClick={(e) => deleteConversation(conv.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                {showSidebar ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
              <div>
                <h1 className="font-semibold flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  AI Content Assistant
                </h1>
                <p className="text-xs text-muted-foreground">
                  Have a conversation to refine your content
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {USE_MOCK_MODE && (
                <Badge variant="outline" className="text-amber-500">
                  Mock Mode
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate('/content-studio')}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Start a Conversation</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Create content through an interactive conversation with the AI. 
                  Start with a brief and then refine the content with follow-up messages.
                </p>
                <Button onClick={loadSampleBrief} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start with Sample Brief
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      message.role === 'user' ? 'bg-primary' : 'bg-secondary'
                    )}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <Bot className="w-4 h-4 text-secondary-foreground" />
                      )}
                    </div>
                    
                    <div className={cn(
                      'flex-1 max-w-[80%]',
                      message.role === 'user' ? 'text-right' : ''
                    )}>
                      <Card className={cn(
                        'inline-block',
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'
                      )}>
                        <CardContent className="p-3">
                          {message.role === 'assistant' && message.parsedContent ? (
                            <div className="space-y-3">
                              {message.parsedContent.title && (
                                <h3 className="font-semibold text-lg">
                                  {message.parsedContent.title}
                                </h3>
                              )}
                              <div className="whitespace-pre-wrap text-sm">
                                {message.parsedContent.content}
                              </div>
                              {message.parsedContent.hashtags && (
                                <div className="flex flex-wrap gap-1">
                                  {message.parsedContent.hashtags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                          )}
                        </CardContent>
                      </Card>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.role === 'assistant' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2"
                              onClick={() => copyToClipboard(message.parsedContent?.content || message.content)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <Card className="bg-card">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          {messages.length > 0 && (
            <div className="p-4 border-t border-border">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the AI to refine the content... (e.g., 'Make it shorter', 'Add more statistics', 'Change the tone to casual')"
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!input.trim() || isLoading}
                  className="px-3"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default ConversationPage;
