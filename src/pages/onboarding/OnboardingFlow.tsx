import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BasicInfo } from "./BasicInfo";
import { CompanyDescription } from "./CompanyDescription";
import { toast } from "@/hooks/use-toast";
import { OnboardingData, CompanyDescriptionData } from "@/types/onboarding";
import { useCompanies } from "@/hooks/useCompanies";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    completedSteps: []
  });
  const { companies, createCompany } = useCompanies();
  const { saveOnboardingDataForCompany } = useKnowledgeBase();

  const handleStepNext = async (stepData: any, step: number) => {
    const stepKeys = ['basicInfo', 'companyDescription'];
    const stepKey = stepKeys[step - 1];
    
    setOnboardingData(prev => ({
      ...prev,
      [stepKey]: stepData,
      completedSteps: [...prev.completedSteps, step].filter((v, i, a) => a.indexOf(v) === i)
    }));
    
    if (step < 2) {
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
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/");
    }
  };

  const finalizeOnboarding = async () => {
    try {
      console.log('Finalizing onboarding with data:', onboardingData);
      
      // Garantir que o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated');
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado. Faça login novamente.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      console.log('User authenticated:', user.email);
      
      const companyName = onboardingData.basicInfo?.companyName?.trim();
      if (!companyName) {
        console.error('Company name not provided');
        toast({
          title: "Erro",
          description: "Nome da empresa não informado. Volte à primeira etapa e preencha o nome da empresa.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se já existe empresa para o usuário
      console.log('Checking existing companies for user:', user.id);
      const { data: existingCompanies, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id);

      if (fetchError) {
        console.error('Error fetching companies:', fetchError);
      } else {
        console.log('Existing companies:', existingCompanies);
      }

      let currentCompany = existingCompanies && existingCompanies.length > 0 ? existingCompanies[0] : null;

      // Se não existe empresa, criar uma automaticamente
      if (!currentCompany) {
        console.log('Creating company directly with Supabase client. Company name:', companyName);
        
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert({
            name: companyName,
            owner_id: user.id,
            description: null,
            website: null,
            industry: null,
            target_audience: null,
            brand_voice: null,
            logo_url: null,
            plan_type: 'free' as const,
            plan_expires_at: null
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating company:', createError);
          toast({
            title: "Erro ao criar empresa",
            description: `Erro: ${createError.message}`,
            variant: "destructive"
          });
          return;
        }

        currentCompany = newCompany;
        console.log('Company created successfully:', currentCompany);
        
        toast({
          title: "Empresa criada!",
          description: `Empresa "${currentCompany.name}" foi criada com sucesso.`,
        });
      }

      if (!currentCompany) {
        console.error('No company available after creation attempt');
        toast({
          title: "Erro",
          description: "Não foi possível criar ou encontrar uma empresa. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Salvar dados completos do onboarding na base de conhecimento
      console.log('Saving onboarding data for company:', currentCompany.id);
      await saveOnboardingDataForCompany(onboardingData, currentCompany.name, currentCompany.id);
      
      toast({
        title: "Onboarding concluído!",
        description: "Seus dados foram salvos e estão prontos para gerar conteúdos personalizados!",
      });
      
      // Aguardar um pouco antes de navegar para mostrar o toast
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error('Error in finalizeOnboarding:', error);
      toast({
        title: "Erro",
        description: "Erro ao finalizar onboarding. Tente novamente.",
        variant: "destructive"
      });
      
      // Em caso de erro, ainda navegar para não deixar o usuário preso
      setTimeout(() => {
        navigate("/");
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
        <CompanyDescription
          onNext={(data) => handleStepNext(data, 2)}
          onBack={handleStepBack}
          initialData={onboardingData.companyDescription}
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