import { useEffect, useRef, useState } from "react";
import { AIChatKit } from "@/components/AIChatKit";
import { chatKitOptions as defaultChatKitOptions } from "@/lib/chatkit-options";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePostV1ApiGeneratedContentGeneratedcontentidChat, useGetV1ApiGeneratedContentGeneratedcontentidMessages } from "@/http/generated";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "./CopyButton";
import { usePostHog } from '@posthog/react';


interface ContentEditorProps {
  isLoading: boolean;
  contentId?: string;
}

interface Message {
  id: string;
  sender: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: Date;
}

export function ContentEditor({ isLoading, contentId }: ContentEditorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();
  const posthog = usePostHog();

  const client = {
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    }
  };

  const { mutateAsync: chatWithContent } = usePostV1ApiGeneratedContentGeneratedcontentidChat({
    client
  });

  const { data } = useGetV1ApiGeneratedContentGeneratedcontentidMessages(contentId, { client });

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedMessages = data.map(msg => {
        // @ts-ignore: Type from generated code is not perfect
        const typedMsg = msg as Message;
        return {
          id: typedMsg.id,
          sender: typedMsg.sender,
          content: typedMsg.content,
          timestamp: new Date(typedMsg.timestamp),
        }
      });
      setMessages(formattedMessages);
      return;
    }
    setMessages([]);

  }, [data, contentId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const addMessage = (message) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: message.sender,
      content: message.content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUserSend = async (text: string) => {
    addMessage({
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      timestamp: new Date(),
    });
    setIsTyping(true);

    if (!contentId) {
      toast({
        title: "Erro",
        description: "ID de conteúdo ausente. Não é possível enviar mensagem para a IA.",
        variant: "destructive"
      });
      setIsTyping(false);
      return;
    }

    try {
      posthog?.capture('Content Generation Message Started', { contentId, message: text });
      const result = await chatWithContent({
        generatedContentId: contentId,
        data: {
          message: text
        }
      });
      posthog?.capture('Content Generation Message Completed', { result });
      addMessage(result);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem para a IA.",
        variant: "destructive"
      });
      // Fallback or remove user message? For now just stop typing indicator
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background" data-testid="chat-area-panel">
      {/* Chat History Area */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Bot className="h-12 w-12 mb-4 opacity-20" />
              <p>O conteúdo gerado aparecerá aqui.</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 w-full max-w-3xl mx-auto",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === 'assistant' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "rounded-lg p-4 text-sm shadow-sm max-w-[85%]",
                  message.sender === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border prose prose-sm dark:prose-invert max-w-none"
                )}
              >
                {message.sender === 'assistant' ? (
                  <div className="relative group">
                    <div className="flex flex-col gap-2">
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
                      <CopyButton content={message.content} className="self-end" />
                    </div>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}

              </div>

              {message.sender === 'user' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-secondary"><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Loading/Typing Indicator */}
          {(isLoading || isTyping) && (
            <div className="flex gap-3 w-full max-w-3xl mx-auto">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Chat Input Area */}
      {contentId && (
        <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-3xl mx-auto">
            <AIChatKit
              options={defaultChatKitOptions}
              onSendFallback={handleUserSend}
            />
            <p className="text-xs text-center text-muted-foreground mt-2">
              A IA pode cometer erros. Verifique as informações importantes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
