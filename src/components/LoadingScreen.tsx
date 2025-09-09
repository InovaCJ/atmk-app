import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Sparkles, Brain, FileText, TrendingUp } from "lucide-react";

interface LoadingScreenProps {
  onComplete?: () => void;
  estimatedTime?: number; // in seconds
}

export function LoadingScreen({ onComplete, estimatedTime = 10 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);

  const tasks = [
    {
      icon: Brain,
      title: "Analisando sua base de conhecimento",
      description: "Processando informações da marca e público-alvo"
    },
    {
      icon: TrendingUp,
      title: "Consultando tendências atuais",
      description: "Coletando dados do Google Trends e notícias relevantes"
    },
    {
      icon: Sparkles,
      title: "Gerando conteúdos personalizados",
      description: "Criando artigos, posts e e-mails com IA"
    },
    {
      icon: FileText,
      title: "Organizando sua biblioteca",
      description: "Estruturando conteúdos por categoria e formato"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + (100 / estimatedTime), 100);
        
        // Update current task based on progress
        const taskIndex = Math.floor((newProgress / 100) * tasks.length);
        setCurrentTask(Math.min(taskIndex, tasks.length - 1));
        
        // Update time remaining
        const remaining = Math.max(0, estimatedTime - Math.floor((newProgress / 100) * estimatedTime));
        setTimeRemaining(remaining);
        
        if (newProgress >= 100 && onComplete) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 1000);
        }
        
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [estimatedTime, onComplete, tasks.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const CurrentIcon = tasks[currentTask]?.icon || Sparkles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm border-0 shadow-elegant p-8">
        <div className="text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
                  <CurrentIcon className="h-8 w-8 text-primary animate-bounce" />
                </div>
                <div className="absolute -inset-2 rounded-full border-2 border-primary/20 animate-spin" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Gerando seus conteúdos...
              </h1>
              <p className="text-muted-foreground">
                Nossa IA está trabalhando para criar conteúdos personalizados para sua marca
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{Math.round(progress)}%</span>
                <span className="text-muted-foreground">
                  • {formatTime(timeRemaining)} restantes
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Current Task */}
          <div className="space-y-6">
            <div className="text-left p-4 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 mt-1">
                  <CurrentIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">
                    {tasks[currentTask]?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tasks[currentTask]?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {tasks.map((task, index) => {
                const isActive = index === currentTask;
                const isCompleted = index < currentTask;
                const TaskIcon = task.icon;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-primary/5 border border-primary/20"
                        : isCompleted
                        ? "opacity-60"
                        : "opacity-30"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        isCompleted
                          ? "bg-green-100 text-green-600"
                          : isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <TaskIcon className="h-3 w-3" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="text-xs text-muted-foreground bg-muted/10 p-4 rounded-lg">
            <p>💡 <strong>Dica:</strong> Em até 2 minutos você terá conteúdos personalizados prontos para usar. Pode aguardar ou navegar para outras abas do navegador.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}