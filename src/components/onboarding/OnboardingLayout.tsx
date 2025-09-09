import { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  isNextEnabled?: boolean;
  isLoading?: boolean;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  title,
  description,
  onNext,
  onPrevious,
  onSkip,
  isNextEnabled = true,
  isLoading = false
}: OnboardingLayoutProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              ATMK
            </h1>
          </div>
          <p className="text-muted-foreground">
            Configure sua base de conhecimento para gerar conteúdos estratégicos
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Etapa {currentStep} de {totalSteps}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-elegant p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <div className="mb-8">
            {children}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={onPrevious}
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
              {onSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  disabled={isLoading}
                >
                  Pular por agora
                </Button>
              )}
            </div>

            {onNext && (
              <Button
                onClick={onNext}
                disabled={!isNextEnabled || isLoading}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                {isLoading ? (
                  "Salvando..."
                ) : currentStep === totalSteps ? (
                  "Finalizar"
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}