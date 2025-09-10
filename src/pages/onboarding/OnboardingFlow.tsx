import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BasicInfo } from "./BasicInfo";
import { BrandIdentity } from "./BrandIdentity";
import { BusinessOffer } from "./BusinessOffer";
import { AudiencePersonas } from "./AudiencePersonas";
import { SEOSemantics } from "./SEOSemantics";
import { ContentFormats } from "./ContentFormats";
import { toast } from "@/hooks/use-toast";
import { OnboardingData } from "@/types/onboarding";
import { useCompanies } from "@/hooks/useCompanies";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    completedSteps: []
  });
  const { companies, createCompany } = useCompanies();
  const { saveOnboardingDataForCompany } = useKnowledgeBase();

  const handleStepNext = async (stepData: any, step: number) => {
    const stepKeys = ['basicInfo', 'brandIdentity', 'business', 'audience', 'seo', 'contentFormats'];
    const stepKey = stepKeys[step - 1];
    
    setOnboardingData(prev => ({
      ...prev,
      [stepKey]: stepData,
      completedSteps: [...prev.completedSteps, step].filter((v, i, a) => a.indexOf(v) === i)
    }));
    
    if (step < 6) {
      setCurrentStep(step + 1);
      toast({
        title: "Etapa concluída!",
        description: `Avançando para a etapa ${step + 1}...`,
      });
    } else {
      // Finalizar onboarding - salvar dados e redirecionar
      await finalizeOnboarding();
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/");
    }
  };

  const finalizeOnboarding = async () => {
    try {
      let currentCompany = companies.length > 0 ? companies[0] : null;

      // Se não existe empresa, criar uma automaticamente
      if (!currentCompany && onboardingData.basicInfo?.companyName) {
        console.log('Creating company automatically with name:', onboardingData.basicInfo.companyName);
        
        currentCompany = await createCompany({
          name: onboardingData.basicInfo.companyName,
          description: null,
          website: null,
          industry: null,
          target_audience: null,
          brand_voice: null,
          logo_url: null,
          plan_type: 'free' as const,
          plan_expires_at: null
        });

        if (!currentCompany) {
          toast({
            title: "Erro",
            description: "Não foi possível criar a empresa. Tente novamente.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Empresa criada!",
          description: `Empresa "${currentCompany.name}" foi criada automaticamente.`,
        });
      }

      if (!currentCompany) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa encontrada e não foi possível criar uma automaticamente.",
          variant: "destructive"
        });
        return;
      }

      // Salvar dados completos do onboarding na base de conhecimento
      await saveOnboardingDataForCompany(onboardingData, currentCompany.name, currentCompany.id);
      
      toast({
        title: "Onboarding concluído!",
        description: "Seus dados foram salvos e estão prontos para gerar conteúdos personalizados!",
      });
      
      // Aguardar um pouco antes de navegar para mostrar o toast
      setTimeout(() => {
        navigate("/generate");
      }, 1500);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados do onboarding. Redirecionando mesmo assim...",
        variant: "destructive"
      });
      
      setTimeout(() => {
        navigate("/generate");
      }, 2000);
    }
  };


  switch (currentStep) {
    case 1:
      return (
        <BasicInfo
          onNext={(data) => handleStepNext(data, 1)}
          onSkip={handleSkip}
          initialData={onboardingData.basicInfo}
        />
      );
    case 2:
      return (
        <BrandIdentity
          onNext={(data) => handleStepNext(data, 2)}
          onBack={handleStepBack}
          onSkip={handleSkip}
          initialData={onboardingData.brandIdentity}
        />
      );
    case 3:
      return (
        <BusinessOffer
          onNext={(data) => handleStepNext(data, 3)}
          onBack={handleStepBack}
          onSkip={handleSkip}
          initialData={onboardingData.business}
        />
      );
    case 4:
      return (
        <AudiencePersonas
          onNext={(data) => handleStepNext(data, 4)}
          onBack={handleStepBack}
          onSkip={handleSkip}
          initialData={onboardingData.audience}
        />
      );
    case 5:
      return (
        <SEOSemantics
          onNext={(data) => handleStepNext(data, 5)}
          onBack={handleStepBack}
          onSkip={handleSkip}
          initialData={onboardingData.seo}
        />
      );
    case 6:
      return (
        <ContentFormats
          onNext={(data) => handleStepNext(data, 6)}
          onBack={handleStepBack}
          onSkip={handleSkip}
          initialData={onboardingData.contentFormats}
        />
      );
    default:
      return (
        <BasicInfo
          onNext={(data) => handleStepNext(data, 1)}
          onSkip={handleSkip}
          initialData={onboardingData.basicInfo}
        />
      );
  }
}