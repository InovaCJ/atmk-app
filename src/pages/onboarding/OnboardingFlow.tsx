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

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    completedSteps: []
  });

  const handleStepNext = (stepData: any, step: number) => {
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
      // Finalizar onboarding - redirecionar para generate
      toast({
        title: "Onboarding concluído!",
        description: "Gerando seus conteúdos personalizados...",
      });
      navigate("/generate");
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