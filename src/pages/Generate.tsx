import { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileSearch, Sparkles, Wand2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ContentGenerationModal } from "@/components/ContentGenerationModal";
import { useKnowledgeValidation } from "@/hooks/useKnowledgeValidation";
import { PlanModal } from "@/components/PlanModal";
import { useCompanyContext } from "@/contexts/CompanyContext";

export default function Generate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { selectedCompanyId, selectedCompany } = useCompanyContext();
  
  const { canGenerateContent, completionPercentage } = useKnowledgeValidation(selectedCompanyId || undefined);

  // Auto-start generation if coming from onboarding or with config from dashboard
  useEffect(() => {
    const fromOnboarding = location.state?.fromOnboarding;
    if (fromOnboarding) {
      setIsModalOpen(true);
    }
    
    // Check if coming with config from dashboard
    const urlParams = new URLSearchParams(location.search);
    const configParam = urlParams.get('config');
    if (configParam) {
      try {
        const config = JSON.parse(decodeURIComponent(configParam));
        handleStartGeneration(config);
      } catch (error) {
        console.error('Error parsing config:', error);
      }
    }
  }, [location.state, location.search]);

  const handleStartGeneration = async (config?: any) => {
    // Always show loading screen for generation
    setIsGenerating(true);
    setIsModalOpen(false); // Close modal if open
    
    toast({
      title: "Gerando conteúdo personalizado!",
      description: "Estamos criando seus primeiros conteúdos baseados nas informações fornecidas...",
    });

    if (config) {
      try {
        const { generateContentWithAI } = await import('@/utils/contentGeneration');
        await generateContentWithAI(config);
        // Complete generation and redirect
        handleGenerationComplete();
      } catch (error) {
        console.error('Error generating content:', error);
        setIsGenerating(false);
      }
    }
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    toast({
      title: "Conteúdo gerado com sucesso!",
      description: "Seus conteúdos estão prontos na biblioteca.",
    });
    // Redirect to library page
    navigate('/library');
  };

  if (isGenerating) {
    return <LoadingScreen onComplete={handleGenerationComplete} />;
  }

  // Estado quando não há conteúdo sendo gerado
  return (
    <>
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader className="pb-6">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-purple-600/10 border border-primary/20">
                <Wand2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">Geração de Conteúdo</CardTitle>
            <CardDescription className="text-base">
              Crie conteúdos personalizados usando inteligência artificial baseada no seu perfil e empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-accent/50 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-medium">IA Personalizada</p>
                <p className="text-muted-foreground text-xs">Baseada no seu perfil</p>
              </div>
              <div className="p-4 bg-accent/50 rounded-lg">
                <FileSearch className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-medium">Tendências</p>
                <p className="text-muted-foreground text-xs">Análise de mercado</p>
              </div>
              <div className="p-4 bg-accent/50 rounded-lg">
                <Wand2 className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-medium">Multi-formato</p>
                <p className="text-muted-foreground text-xs">Posts, artigos e mais</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => {
                  if (!canGenerateContent) {
                    toast({
                      title: "Base de conhecimento incompleta",
                      description: `Complete pelo menos 50% da sua base de conhecimento para gerar conteúdos. Atual: ${completionPercentage}%`,
                      variant: "destructive"
                    });
                    navigate("/knowledge");
                    return;
                  }
                  setIsModalOpen(true);
                }}
                size="lg"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                disabled={!canGenerateContent}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Gerar Conteúdo Agora
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                size="lg"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conditional rendering based on plan type */}
      {selectedCompany?.plan_type === 'free' ? (
        <PlanModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      ) : (
        <ContentGenerationModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onConfirm={handleStartGeneration}
        />
      )}
    </>
  );
}