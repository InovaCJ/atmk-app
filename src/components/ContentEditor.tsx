import { useEffect, useRef, useState, useMemo } from "react";
import { AIChatKit } from "@/components/AIChatKit";
import { chatKitOptions as defaultChatKitOptions } from "@/lib/chatkit-options";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Bot, User, Check, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePostV1ApiGeneratedContentGeneratedcontentidChat, useGetV1ApiGeneratedContentGeneratedcontentidMessages } from "@/http/generated";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "./CopyButton";
import { ContentFeedbackModal } from "./ContentFeedbackModal";
import { useContentFeedback } from "@/hooks/useContentFeedback";
import { marked } from "marked";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface ContentEditorProps {
  isLoading: boolean;
  contentId?: string;
}

type ProgressStep = {
  id: number;
  message: string;
  completed: boolean;
};

const GENERATION_STEPS: ProgressStep[] = [
  {
    id: 1,
    message: "Estou lendo a notícia completa para extrair as informações mais estratégicas para você...",
    completed: false,
  },
  {
    id: 2,
    message: "Agora vou ler sua base de conhecimento para relacionar a estratégia do seu negócio",
    completed: false,
  },
  {
    id: 3,
    message: "Cruzando tudo com seu objetivo de conteúdo",
    completed: false,
  },
  {
    id: 4,
    message: "Finalizando com a categoria final e formatando seu conteúdo neste instante...",
    completed: false,
  },
  {
    id: 5,
    message: "Gerando conteúdo...",
    completed: false,
  },
];

const CHAT_STEPS: ProgressStep[] = [
  {
    id: 1,
    message: "Analisando sua solicitação...",
    completed: false,
  },
  {
    id: 2,
    message: "Consultando o contexto do conteúdo gerado...",
    completed: false,
  },
  {
    id: 3,
    message: "Gerando resposta personalizada...",
    completed: false,
  },
];

interface Message {
  id: string;
  sender: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: Date;
}

// Helper function to convert markdown to HTML
const convertMarkdownToHTML = (content: string): string => {
  if (!content) return '';
  
  // Check if content looks like HTML (contains HTML tags)
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
  
  // If it's already HTML, return as is
  if (hasHtmlTags) {
    return content;
  }
  
  // Check if content looks like markdown (contains markdown syntax)
  const hasMarkdownSyntax = /(^#{1,6}\s|^\*\s|^-\s|^\d+\.\s|```|`|\[.*\]\(.*\)|!\[.*\]\(.*\))/m.test(content);
  
  // If it has markdown syntax, convert it
  if (hasMarkdownSyntax) {
    try {
      return marked.parse(content, { breaks: true, gfm: true });
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return content;
    }
  }
  
  // Otherwise, return as plain text (will be escaped by dangerouslySetInnerHTML)
  return content;
};

export function ContentEditor({ isLoading, contentId }: ContentEditorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(GENERATION_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [chatProgressSteps, setChatProgressSteps] = useState<ProgressStep[]>(CHAT_STEPS);
  const [chatCurrentStepIndex, setChatCurrentStepIndex] = useState(0);
  const [chatProgressValue, setChatProgressValue] = useState(0);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatProgressBarIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const generationStartTimeRef = useRef<number | null>(null);
  const chatStartTimeRef = useRef<number | null>(null);
  const { session } = useAuth();
  const { toast } = useToast();
  const { saveFeedback, isLoading: isSavingFeedback } = useContentFeedback();

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
  }, [messages, isTyping, progressSteps, chatProgressSteps]);

  // Progress steps animation during content generation
  useEffect(() => {
    if (isLoading && !contentId) {
      // Reset progress when starting generation
      setProgressSteps(GENERATION_STEPS.map(step => ({ ...step, completed: false })));
      setCurrentStepIndex(0);
      setProgressValue(0);
      generationStartTimeRef.current = Date.now(); // Registrar tempo de início

      // Tempo total estimado: 60 segundos
      const TOTAL_ESTIMATED_TIME = 60000; // 60 segundos em ms
      const STEP_DURATION = 10000; // 10 segundos por step (4 steps = 40s)
      const PROGRESS_BAR_START_TIME = STEP_DURATION * (GENERATION_STEPS.length - 1); // 40s
      const PROGRESS_BAR_DURATION = 20000; // 20s para chegar a 90% (40s a 60s)

      // Start progress animation based on real elapsed time
      progressIntervalRef.current = setInterval(() => {
        if (!generationStartTimeRef.current) return;
        
        const elapsed = Date.now() - generationStartTimeRef.current;
        
        // Calcular step atual baseado no tempo decorrido
        const currentStep = Math.min(
          Math.floor(elapsed / STEP_DURATION),
          GENERATION_STEPS.length - 1
        );

        setCurrentStepIndex(currentStep);

        // Marcar steps anteriores como completos
        setProgressSteps((steps) =>
          steps.map((step, idx) => ({
            ...step,
            completed: idx < currentStep
          }))
        );

        // Quando chegar no último step, iniciar barra de progresso
        if (currentStep === GENERATION_STEPS.length - 1) {
          // Limpar interval anterior se existir
          if (progressBarIntervalRef.current) {
            clearInterval(progressBarIntervalRef.current);
          }

          // Calcular progresso baseado no tempo real
          const progressElapsed = Math.max(0, elapsed - PROGRESS_BAR_START_TIME);
          const progressPercent = Math.min(
            (progressElapsed / PROGRESS_BAR_DURATION) * 90, // 0% a 90% em 20s
            90
          );

          setProgressValue(progressPercent);

          // Atualizar barra de progresso continuamente
          progressBarIntervalRef.current = setInterval(() => {
            if (!generationStartTimeRef.current) return;
            
            const currentElapsed = Date.now() - generationStartTimeRef.current;
            const currentProgressElapsed = Math.max(0, currentElapsed - PROGRESS_BAR_START_TIME);
            const currentProgressPercent = Math.min(
              (currentProgressElapsed / PROGRESS_BAR_DURATION) * 90,
              90
            );

            setProgressValue(currentProgressPercent);
          }, 100); // Atualiza a cada 100ms para suavidade
        }
      }, 500); // Verifica a cada 500ms

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        if (progressBarIntervalRef.current) {
          clearInterval(progressBarIntervalRef.current);
          progressBarIntervalRef.current = null;
        }
      };
    } else {
      // Complete all steps when loading finishes
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (progressBarIntervalRef.current) {
        clearInterval(progressBarIntervalRef.current);
        progressBarIntervalRef.current = null;
      }
      if (!isLoading) {
        // Complete progress bar to 100% and mark all steps as completed
        setProgressValue(100);
        setTimeout(() => {
          setProgressSteps((steps) =>
            steps.map((step) => ({ ...step, completed: true }))
          );
        }, 300);
        generationStartTimeRef.current = null;
      }
    }
  }, [isLoading, contentId]);

  const addMessage = (message) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: message.sender,
      content: message.content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Chat progress steps animation
  useEffect(() => {
    if (isTyping && !isLoading) {
      // Reset chat progress when starting
      setChatProgressSteps(CHAT_STEPS.map(step => ({ ...step, completed: false })));
      setChatCurrentStepIndex(0);
      setChatProgressValue(0);
      chatStartTimeRef.current = Date.now(); // Registrar tempo de início

      // Tempo total estimado para chat: 30 segundos (mais rápido que geração)
      const CHAT_TOTAL_TIME = 30000; // 30 segundos
      const CHAT_STEP_DURATION = 8000; // 8 segundos por step (2 steps = 16s)
      const CHAT_PROGRESS_BAR_START_TIME = CHAT_STEP_DURATION * (CHAT_STEPS.length - 1); // 16s
      const CHAT_PROGRESS_BAR_DURATION = 14000; // 14s para chegar a 90% (16s a 30s)

      // Start chat progress animation based on real elapsed time
      chatProgressIntervalRef.current = setInterval(() => {
        if (!chatStartTimeRef.current) return;
        
        const elapsed = Date.now() - chatStartTimeRef.current;
        
        // Calcular step atual baseado no tempo decorrido
        const currentStep = Math.min(
          Math.floor(elapsed / CHAT_STEP_DURATION),
          CHAT_STEPS.length - 1
        );

        setChatCurrentStepIndex(currentStep);

        // Marcar steps anteriores como completos
        setChatProgressSteps((steps) =>
          steps.map((step, idx) => ({
            ...step,
            completed: idx < currentStep
          }))
        );

        // Quando chegar no último step, iniciar barra de progresso
        if (currentStep === CHAT_STEPS.length - 1) {
          // Limpar interval anterior se existir
          if (chatProgressBarIntervalRef.current) {
            clearInterval(chatProgressBarIntervalRef.current);
          }

          // Calcular progresso baseado no tempo real
          const progressElapsed = Math.max(0, elapsed - CHAT_PROGRESS_BAR_START_TIME);
          const progressPercent = Math.min(
            (progressElapsed / CHAT_PROGRESS_BAR_DURATION) * 90, // 0% a 90% em 14s
            90
          );

          setChatProgressValue(progressPercent);

          // Atualizar barra de progresso continuamente
          chatProgressBarIntervalRef.current = setInterval(() => {
            if (!chatStartTimeRef.current) return;
            
            const currentElapsed = Date.now() - chatStartTimeRef.current;
            const currentProgressElapsed = Math.max(0, currentElapsed - CHAT_PROGRESS_BAR_START_TIME);
            const currentProgressPercent = Math.min(
              (currentProgressElapsed / CHAT_PROGRESS_BAR_DURATION) * 90,
              90
            );

            setChatProgressValue(currentProgressPercent);
          }, 100); // Atualiza a cada 100ms
        }
      }, 500); // Verifica a cada 500ms

      return () => {
        if (chatProgressIntervalRef.current) {
          clearInterval(chatProgressIntervalRef.current);
          chatProgressIntervalRef.current = null;
        }
        if (chatProgressBarIntervalRef.current) {
          clearInterval(chatProgressBarIntervalRef.current);
          chatProgressBarIntervalRef.current = null;
        }
      };
    } else {
      // Complete chat progress when typing finishes
      if (chatProgressIntervalRef.current) {
        clearInterval(chatProgressIntervalRef.current);
        chatProgressIntervalRef.current = null;
      }
      if (chatProgressBarIntervalRef.current) {
        clearInterval(chatProgressBarIntervalRef.current);
        chatProgressBarIntervalRef.current = null;
      }
      if (!isTyping) {
        // Complete progress bar to 100% and mark all steps as completed
        setChatProgressValue(100);
        setTimeout(() => {
          setChatProgressSteps((steps) =>
            steps.map((step) => ({ ...step, completed: true }))
          );
        }, 200);
        chatStartTimeRef.current = null;
      }
    }
  }, [isTyping, isLoading]);

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
      console.log('Enviando mensagem para o chat:', { contentId, message: text });
      const result = await chatWithContent({
        generatedContentId: contentId,
        data: {
          message: text
        }
      });
      console.log('Resposta do chat recebida:', result);
      addMessage(result);
    } catch (error: any) {
      console.error("Erro detalhado ao enviar mensagem:", {
        error,
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
        contentId,
        text
      });

      // Determinar tipo de erro e mensagem apropriada
      let errorTitle = "Erro ao enviar mensagem";
      let errorDescription = "Falha ao enviar mensagem para a IA.";

      if (error?.response) {
        // Erro da API (backend)
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 404) {
          errorTitle = "Conteúdo não encontrado";
          errorDescription = "O conteúdo gerado não foi encontrado. Tente gerar um novo conteúdo.";
        } else if (status === 401 || status === 403) {
          errorTitle = "Erro de autenticação";
          errorDescription = "Sua sessão expirou. Por favor, faça login novamente.";
        } else if (status === 500) {
          errorTitle = "Erro no servidor";
          errorDescription = errorData?.error?.message || errorData?.message || "Erro interno do servidor. Tente novamente em alguns instantes.";
        } else if (status >= 400 && status < 500) {
          errorTitle = "Erro na requisição";
          errorDescription = errorData?.error?.message || errorData?.message || `Erro ${status}: Verifique os dados enviados.`;
        } else {
          errorDescription = errorData?.error?.message || errorData?.message || `Erro ${status} do servidor.`;
        }
      } else if (error?.message) {
        // Erro de rede ou outro erro
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorTitle = "Erro de conexão";
          errorDescription = "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.";
        } else if (error.message.includes('timeout')) {
          errorTitle = "Tempo esgotado";
          errorDescription = "A requisição demorou muito para responder. Tente novamente.";
        } else {
          errorDescription = error.message;
        }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden" data-testid="chat-area-panel">
      {/* Chat History Area */}
      <ScrollArea className="flex-1 min-w-0 min-h-0 overflow-x-hidden">
        <div className="space-y-6 px-4 md:px-6 pt-4 md:pt-6 pb-2 min-w-0 w-full">
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
                "flex gap-3 w-full min-w-0 max-w-full px-2",
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
                  "rounded-lg p-4 text-sm shadow-sm",
                  message.sender === 'user'
                    ? "bg-primary text-primary-foreground max-w-[85%] flex-shrink-0"
                    : "bg-card border border-border flex-1 min-w-0"
                )}
              >
                {message.sender === 'assistant' ? (
                  <div className="relative group min-w-0 w-full max-w-full">
                    <div className="flex flex-col gap-2 min-w-0 w-full max-w-full">
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none w-full [&_h1]:break-words [&_h2]:break-words [&_h3]:break-words [&_h4]:break-words [&_h5]:break-words [&_h6]:break-words [&_p]:break-words [&_li]:break-words [&_strong]:break-words [&_em]:break-words [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre_code]:whitespace-pre-wrap [&_pre_code]:break-words [&_a]:break-words [&_ul]:my-4 [&_ol]:my-4 [&_p]:my-2 [&_hr]:my-4"
                        style={{ 
                          wordBreak: 'break-word', 
                          overflowWrap: 'anywhere'
                        }}
                        dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(message.content) }}
                      />
                      <div className="flex items-center gap-2 self-end">
                        <CopyButton content={message.content} />
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  setSelectedMessageId(message.id);
                                  setFeedbackModalOpen(true);
                                }}
                                className="p-1 rounded-md hover:bg-muted transition"
                                aria-label="Dar feedback sobre o conteúdo"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center">
                              <p>Feedback</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="break-words overflow-wrap-anywhere">{message.content}</p>
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
          {isLoading && !contentId && (
            <div className="flex flex-col gap-3 w-full min-w-0 px-2">
              {progressSteps.map((step, index) => {
                const isLastStep = index === GENERATION_STEPS.length - 1;
                const isProgressStep = isLastStep && index === currentStepIndex;
                
                return (
                  <div key={step.id} className="flex gap-3 w-full min-w-0">
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                      <AvatarFallback className={cn(
                        "bg-primary/10",
                        step.completed ? "text-primary" : index === currentStepIndex ? "text-primary" : "text-muted-foreground"
                      )}>
                        {step.completed ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "bg-card border rounded-lg p-4 flex-1 transition-all duration-300",
                      step.completed
                        ? "border-primary/20 bg-primary/5"
                        : index === currentStepIndex
                        ? "border-primary/40 shadow-sm"
                        : "border-border opacity-60"
                    )}>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          {index === currentStepIndex && !step.completed && !isProgressStep && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          )}
                          <p className={cn(
                            "text-sm",
                            step.completed
                              ? "text-muted-foreground"
                              : index === currentStepIndex
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          )}>
                            {step.message}
                          </p>
                        </div>
                        
                        {/* Barra de progresso na última etapa */}
                        {isProgressStep && (
                          <div className="space-y-2">
                            <Progress value={progressValue} className="h-2" />
                            <p className="text-xs text-muted-foreground text-right">
                              {Math.round(progressValue)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Chat progress indicator */}
          {isTyping && !isLoading && (
            <div className="flex flex-col gap-3 w-full min-w-0 px-2">
              {chatProgressSteps.map((step, index) => {
                const isLastStep = index === CHAT_STEPS.length - 1;
                const isProgressStep = isLastStep && index === chatCurrentStepIndex;
                
                return (
                  <div key={step.id} className="flex gap-3 w-full min-w-0">
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                      <AvatarFallback className={cn(
                        "bg-primary/10",
                        step.completed ? "text-primary" : index === chatCurrentStepIndex ? "text-primary" : "text-muted-foreground"
                      )}>
                        {step.completed ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "bg-card border rounded-lg p-4 flex-1 transition-all duration-300",
                      step.completed
                        ? "border-primary/20 bg-primary/5"
                        : index === chatCurrentStepIndex
                        ? "border-primary/40 shadow-sm"
                        : "border-border opacity-60"
                    )}>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          {index === chatCurrentStepIndex && !step.completed && !isProgressStep && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          )}
                          <p className={cn(
                            "text-sm",
                            step.completed
                              ? "text-muted-foreground"
                              : index === chatCurrentStepIndex
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          )}>
                            {step.message}
                          </p>
                        </div>
                        
                        {/* Barra de progresso na última etapa do chat */}
                        {isProgressStep && (
                          <div className="space-y-2">
                            <Progress value={chatProgressValue} className="h-2" />
                            <p className="text-xs text-muted-foreground text-right">
                              {Math.round(chatProgressValue)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Chat Input Area */}
      {contentId && (
        <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

      {/* Feedback Modal */}
      <ContentFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => {
          setFeedbackModalOpen(false);
          setSelectedMessageId(null);
        }}
        contentId={contentId}
        onFeedbackSubmit={async (feedback) => {
          if (!contentId) return;
          
          try {
            await saveFeedback(contentId, selectedMessageId, feedback);
            toast({
              title: "Feedback enviado",
              description: "Obrigado pelo seu feedback! Ele nos ajuda a melhorar.",
            });
            setFeedbackModalOpen(false);
            setSelectedMessageId(null);
          } catch (error) {
            // Erro já é tratado no hook
            console.error("Erro ao salvar feedback:", error);
          }
        }}
      />
    </div>
  );
}
