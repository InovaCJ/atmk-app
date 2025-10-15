import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";

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

  return (
    <Card className="border-0 shadow-elegant bg-gradient-to-r from-primary/10 via-purple-100/60 to-background p-6 md:p-8">
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
              ? "Você concluiu todas as etapas iniciais. Explore o produto e gere seus conteúdos."
              : nextStep?.description}
          </p>

          <div className="max-w-md pt-2">
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="shrink-0">
          {isAllDone ? (
            <Button onClick={() => nextStep?.onClick?.()} className="min-w-[200px]">
              Explorar produto
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : nextStep ? (
            <Button onClick={nextStep.onClick} className="min-w-[220px]">
              {nextStep.ctaLabel}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}


