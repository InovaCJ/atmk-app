import { useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Mail, 
  Share2, 
  Mic, 
  TrendingUp,
  Newspaper,
  Calendar,
  Building,
  Sparkles,
  AlertTriangle,
  Settings
} from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { useKnowledgeValidation } from "@/hooks/useKnowledgeValidation";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { useNavigate } from "react-router-dom";
import { useCompanyContext } from "@/contexts/CompanyContext";

interface ContentGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (config: GenerationConfig) => void;
  preselectedOpportunity?: string;
}

interface GenerationConfig {
  opportunityId: string;
  contentType: string;
  companyId: string;
}

// Mock data para oportunidades
const mockOpportunities = [
  {
    id: "1",
    title: "Black Friday 2024: Tendências de E-commerce",
    type: "trend",
    description: "Análise das principais estratégias que estão dominando a Black Friday este ano",
    source: "Google Trends",
    relevanceScore: 95,
    date: "2024-01-15"
  },
  {
    id: "2", 
    title: "IA Generativa Atinge Novo Marco no Marketing Digital",
    type: "news",
    description: "Empresas reportam 40% de aumento na eficiência com uso de IA para conteúdo",
    source: "Marketing Tech News",
    relevanceScore: 88,
    date: "2024-01-14"
  },
  {
    id: "3",
    title: "Tendência: Marketing Conversacional em 2025",
    type: "trend", 
    description: "Chatbots inteligentes e personalização em tempo real lideram preferências",
    source: "Trend Analysis",
    relevanceScore: 82,
    date: "2024-01-13"
  },
  {
    id: "4",
    title: "Regulamentação do E-commerce: Novas Regras para 2024",
    type: "news",
    description: "Governo anuncia mudanças nas regras de proteção ao consumidor online",
    source: "Governo Federal",
    relevanceScore: 75,
    date: "2024-01-12"
  }
];

const contentFormats = [
  {
    type: "social",
    label: "Post para Redes Sociais",
    description: "Posts envolventes com carrosséis e legendas otimizadas",
    icon: <Share2 className="h-5 w-5" />
  },
  {
    type: "email", 
    label: "E-mail Marketing",
    description: "Campanhas personalizadas com assunto e conteúdo completo",
    icon: <Mail className="h-5 w-5" />
  },
  {
    type: "blog",
    label: "Artigo de Blog", 
    description: "Conteúdo longo e detalhado otimizado para SEO",
    icon: <FileText className="h-5 w-5" />
  },
  {
    type: "podcast",
    label: "Roteiro para Podcast",
    description: "Roteiro estruturado com blocos e tempos definidos",
    icon: <Mic className="h-5 w-5" />
  },
  {
    type: "video",
    label: "Roteiro para Vídeo", 
    description: "Script completo com indicações visuais e narração",
    icon: <Mic className="h-5 w-5" />
  },
  {
    type: "webinar",
    label: "Roteiro para Webinar",
    description: "Apresentação interativa com slides e atividades",
    icon: <Mic className="h-5 w-5" />
  }
];

export function ContentGenerationModal({ open, onOpenChange, onConfirm, preselectedOpportunity }: ContentGenerationModalProps) {
  const { companies, loading } = useCompanies();
  const { selectedCompanyId, selectedCompany } = useCompanyContext();
  const { getKnowledgeItemByType } = useKnowledgeBase(selectedCompanyId || undefined);
  const navigate = useNavigate();
  
  // Check if user is on free plan to skip opportunities step
  const isFreePlan = selectedCompany?.plan_type === 'free';
  const initialStep = isFreePlan ? 2 : (preselectedOpportunity ? 2 : 1);
  
  const [step, setStep] = useState(initialStep);
  const [selectedOpportunity, setSelectedOpportunity] = useState(preselectedOpportunity || "");
  const [selectedContentType, setSelectedContentType] = useState("");
  const [selectedCompanyState, setSelectedCompanyState] = useState(selectedCompanyId || "");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { canGenerateContent, completionPercentage, missingFields } = useKnowledgeValidation(selectedCompanyState);

  const resetModal = () => {
    setStep(initialStep);
    setSelectedOpportunity(preselectedOpportunity || "");
    setSelectedContentType("");
    setSelectedCompanyState(selectedCompanyId || "");
    setIsGenerating(false);
  };

  const handleClose = () => {
    if (!isGenerating) {
      resetModal();
      onOpenChange(false);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Get prioritized content formats from onboarding
  const getPrioritizedFormats = () => {
    try {
      const onboardingData = getKnowledgeItemByType('onboarding_data');
      const parsedContent = typeof onboardingData?.content === 'string' 
        ? JSON.parse(onboardingData.content) 
        : onboardingData?.content;
      const selectedFormats = parsedContent?.contentFormats?.preferredFormats || [];
      
      // Sort selected formats by priority and put them first
      const prioritizedFormats = selectedFormats
        .sort((a: any, b: any) => a.priority - b.priority)
        .map((format: any) => format.type);
      
      // Add remaining formats that weren't selected
      const remainingFormats = contentFormats.filter(format => 
        !prioritizedFormats.includes(format.type)
      );
      
      // Combine prioritized + remaining
      const prioritizedFormatObjects = prioritizedFormats
        .map((type: string) => contentFormats.find(f => f.type === type))
        .filter(Boolean);
      
      return [...prioritizedFormatObjects, ...remainingFormats];
    } catch (error) {
      console.error('Error getting prioritized formats:', error);
      return contentFormats;
    }
  };

  const handleConfirm = async () => {
    if (selectedOpportunity && selectedContentType && selectedCompanyState) {
      setIsGenerating(true);
      
      try {
        // Import and call the generation function directly
        const { generateContentWithAI } = await import('@/utils/contentGeneration');
        const generatedContent = await generateContentWithAI({
          opportunityId: selectedOpportunity || 'onboarding-generated',
          contentType: selectedContentType,
          companyId: selectedCompanyState
        });
        
        // Content generation completed successfully
        console.log('Content generated successfully:', generatedContent);
        handleGenerationComplete();
        
      } catch (error) {
        console.error('Error generating content:', error);
        setIsGenerating(false);
      }
    }
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    resetModal();
    onOpenChange(false);
    // Navigate to library after closing modal
    setTimeout(() => {
      navigate('/library');
    }, 100);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedOpportunity !== "";
      case 2: return selectedContentType !== "";
      case 3: return selectedCompanyState !== "" && canGenerateContent;
      default: return false;
    }
  };

  const getOpportunityIcon = (type: string) => {
    return type === "trend" ? <TrendingUp className="h-4 w-4" /> : <Newspaper className="h-4 w-4" />;
  };

  const getOpportunityTypeLabel = (type: string) => {
    return type === "trend" ? "Tendência" : "Notícia";
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Selecionar Oportunidade";
      case 2: return "Escolher Formato";  
      case 3: return "Selecionar Empresa";
      default: return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "Escolha uma tendência ou notícia como base para o conteúdo";
      case 2: return "Defina o tipo de conteúdo que você deseja gerar";
      case 3: return "Selecione a empresa para usar a base de conhecimento correta";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        {isGenerating ? (
          <LoadingScreen 
            onComplete={handleGenerationComplete}
            estimatedTime={5}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Gerar Novo Conteúdo
              </DialogTitle>
              <DialogDescription>
                Configure os parâmetros para gerar conteúdo personalizado com IA
              </DialogDescription>
            </DialogHeader>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${step >= stepNumber 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`
                        w-12 h-0.5 mx-2
                        ${step > stepNumber ? 'bg-primary' : 'bg-muted'}
                      `} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{getStepTitle()}</h3>
                <p className="text-muted-foreground">{getStepDescription()}</p>
              </div>

              {/* Step 1: Select Opportunity */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {mockOpportunities.map((opportunity) => (
                      <Card 
                        key={opportunity.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedOpportunity === opportunity.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : ''
                        }`}
                        onClick={() => setSelectedOpportunity(opportunity.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getOpportunityIcon(opportunity.type)}
                              <Badge variant="outline">
                                {getOpportunityTypeLabel(opportunity.type)}
                              </Badge>
                              <Badge variant="secondary">
                                {opportunity.relevanceScore}% relevante
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {opportunity.date}
                            </div>
                          </div>
                          <CardTitle className="text-base">{opportunity.title}</CardTitle>
                          <CardDescription>{opportunity.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-xs text-muted-foreground">
                            Fonte: {opportunity.source}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Content Format */}
              {step === 2 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {getPrioritizedFormats().map((format) => (
                    <Card
                      key={format.type}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedContentType === format.type
                          ? 'ring-2 ring-primary bg-primary/5'
                          : ''
                      }`}
                      onClick={() => setSelectedContentType(format.type)}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-md text-primary">
                            {format.icon}
                          </div>
                          <div>
                            <CardTitle className="text-base">{format.label}</CardTitle>
                            <CardDescription className="text-sm">
                              {format.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {/* Step 3: Select Company */}
              {step === 3 && (
                <div className="space-y-4">
                  <Label htmlFor="company-select">Empresa</Label>
                  <Select 
                    value={selectedCompanyState} 
                    onValueChange={setSelectedCompanyState}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Carregando empresas..." : "Selecione uma empresa"} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {company.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedCompanyState && !canGenerateContent && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        <div className="space-y-2">
                          <p className="font-medium">Base de conhecimento incompleta ({completionPercentage}%)</p>
                          <p className="text-sm">
                            É necessário completar pelo menos 50% da base de conhecimento para gerar conteúdos de qualidade.
                          </p>
                          {missingFields.length > 0 && (
                            <details className="mt-2">
                              <summary className="text-sm cursor-pointer hover:underline">
                                Ver campos faltantes ({missingFields.length})
                              </summary>
                              <ul className="text-xs mt-1 ml-4 list-disc">
                                {missingFields.slice(0, 8).map((field, index) => (
                                  <li key={index}>{field}</li>
                                ))}
                                {missingFields.length > 8 && <li>+ {missingFields.length - 8} outros...</li>}
                              </ul>
                            </details>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              onOpenChange(false);
                              navigate("/knowledge");
                            }}
                            className="mt-2"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Completar Base de Conhecimento
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {selectedCompanyState && canGenerateContent && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium mb-2 text-green-800">✓ Base de conhecimento válida ({completionPercentage}%)</h4>
                      <div className="text-sm text-green-700">
                        {companies.find(c => c.id === selectedCompanyState)?.description || 
                         "A IA utilizará as informações de marca, público-alvo, produtos e estratégias desta empresa."}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={step === 1}
              >
                Voltar
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                
                {step < 3 ? (
                  <Button 
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button 
                    onClick={handleConfirm}
                    disabled={!canProceed()}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Conteúdo
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}