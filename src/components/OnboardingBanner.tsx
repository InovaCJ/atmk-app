import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Sparkles, X } from "lucide-react";
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
    } catch {}
  }, []);

  if (isAllDone && dismissed) return null;

  return (
    <Card className="relative border-0 shadow-elegant bg-gradient-to-r from-primary/10 via-purple-100/60 to-background p-6 md:p-8">
      {isAllDone && (
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => {
            try { localStorage.setItem("onboarding_banner_dismissed", "1"); } catch {}
            setDismissed(true);
          }}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
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

          <div className="w-full pt-2">
            <Progress value={progress} className="h-2 w-full" />
          </div>
        </div>

        {/* CTA removido quando finalizado; mantemos apenas a instrução no texto */}
      </div>
    </Card>
  );
}


