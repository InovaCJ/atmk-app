import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

interface CompanyDescriptionData {
  description: string;
}

interface CompanyDescriptionProps {
  onNext: (data: CompanyDescriptionData) => void;
  onBack: () => void;
  initialData?: CompanyDescriptionData;
}

export function CompanyDescription({
  onNext,
  onBack,
  initialData
}: CompanyDescriptionProps) {
  const [description, setDescription] = useState(initialData?.description || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    const trimmedDescription = description.trim();
    
    if (!trimmedDescription) {
      return;
    }

    setIsLoading(true);
    
    try {
      const data: CompanyDescriptionData = {
        description: trimmedDescription
      };
      
      onNext(data);
    } finally {
      setIsLoading(false);
    }
  };

  const isNextEnabled = description.trim().length > 0;

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={2}
      title="Descreva sua empresa"
      description="Conte-nos sobre sua empresa, o que ela faz e seus principais objetivos"
      onNext={handleNext}
      onBack={onBack}
      isNextEnabled={isNextEnabled}
      isLoading={isLoading}
      nextButtonText="Finalizar"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="description" className="text-base font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            O que é e o que sua empresa faz?
          </Label>
          <Textarea
            id="description"
            placeholder="Ex: Somos uma agência de marketing digital especializada em pequenas e médias empresas. Oferecemos serviços de gestão de redes sociais, criação de conteúdo e campanhas de anúncios online. Nosso objetivo é ajudar nossos clientes a aumentar sua presença digital e gerar mais vendas através de estratégias personalizadas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={1000}
          />
          <div className="text-right text-sm text-muted-foreground">
            {description.length}/1000 caracteres
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Dica:</strong> Seja específico sobre seus produtos/serviços, público-alvo e diferenciais. 
            Essas informações serão usadas para gerar conteúdos mais precisos e estratégicos para seu negócio.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}