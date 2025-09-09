import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BasicInfo } from "./BasicInfo";
import { LoadingScreen } from "@/components/LoadingScreen";
import { toast } from "@/hooks/use-toast";

interface OnboardingData {
  basicInfo?: {
    fullName: string;
    email: string;
    phone: string;
    companyName: string;
  };
  // Adicionar outros steps futuramente
}

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleBasicInfoNext = async (data: any) => {
    setIsLoading(true);
    
    // Simular salvamento dos dados
    setTimeout(() => {
      setOnboardingData(prev => ({ ...prev, basicInfo: data }));
      
      toast({
        title: "Dados salvos com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      
      // Por enquanto, redirecionar direto para dashboard
      // Futuramente, avançar para próximo step
      navigate("/");
      setIsLoading(false);
    }, 2000);
  };

  const handleSkip = () => {
    navigate("/");
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Por enquanto só temos um step, mas pode expandir facilmente
  switch (currentStep) {
    case 1:
    default:
      return (
        <BasicInfo
          onNext={handleBasicInfoNext}
          onSkip={handleSkip}
          initialData={onboardingData.basicInfo}
        />
      );
  }
}