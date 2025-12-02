import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, X, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface NextStep {
  id: number;
  title: string;
  description: string;
  ctaLabel: string;
  onClick: () => void;
}

interface OnboardingBannerProps {
  totalSteps: number;
  completedSteps: number;
  nextStep?: NextStep;
  allDoneTitle?: string;
}

export function OnboardingBanner({
  totalSteps,
  completedSteps,
  nextStep,
  allDoneTitle = "Bem-vindo ao ATMK!"
}: OnboardingBannerProps) {
  const progress = Math.round((completedSteps / Math.max(totalSteps, 1)) * 100);
  const isAllDone = !nextStep && completedSteps >= totalSteps;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const flag = localStorage.getItem("onboarding_banner_dismissed") === "1";
      setDismissed(flag);
    } catch { }
  }, []);

  if (isAllDone && dismissed) return null;

  return (
    <Card className="relative border-0 shadow-elegant bg-purple-100/60 p-6 md:p-8">
      {isAllDone && (
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => {
            try { localStorage.setItem("onboarding_banner_dismissed", "1"); } catch { }
            setDismissed(true);
          }}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="space-y-4">
        {/* Top row: Content and CTA */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              {isAllDone ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary" />
              )}
              <span className="text-sm text-muted-foreground">
                {completedSteps} de {totalSteps} etapas concluídas · {progress}%
              </span>
            </div>
            <h2 className="text-2xl font-bold">
              {isAllDone ? allDoneTitle : "Vamos configurar sua conta"}
            </h2>
            <p className="text-muted-foreground">
              {isAllDone
                ? "Você concluiu todas as etapas iniciais. Agora é hora de explorar: comece criando seu primeiro conteúdo na tela de Criação."
                : nextStep?.description}
            </p>
          </div>

          {!isAllDone && nextStep && (
            <div className="flex-shrink-0">
              <Button onClick={nextStep.onClick} className="w-full md:w-auto">
                {nextStep.ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Bottom row: Progress bar spanning full width */}
        <div className="w-full">
          <Progress value={progress} className="h-2 w-full bg-purple-200/40" />
        </div>
      </div>
    </Card>
  );
}


