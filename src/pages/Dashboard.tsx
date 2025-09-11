import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  FileText, 
  Mail, 
  Share2, 
  Calendar,
  ChevronRight,
  Sparkles,
  Settings
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContentGenerationModal } from "@/components/ContentGenerationModal";
import { PlanModal } from "@/components/PlanModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { toast } from "@/hooks/use-toast";
import { useKnowledgeValidation } from "@/hooks/useKnowledgeValidation";
import { useNavigate } from "react-router-dom";
import { useCompanyContext } from "@/contexts/CompanyContext";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedCompanyId, selectedCompany } = useCompanyContext();
  const navigate = useNavigate();
  
  const { canGenerateContent, completionPercentage, missingFields } = useKnowledgeValidation(selectedCompanyId || undefined);

  // Mock data para trends/oportunidades de conteúdo
  const opportunities = [
    {
      id: 1,
      title: "Black Friday 2024: Estratégias de Marketing Digital",
      source: "Google Trends",
      trend: "+245%",
      type: "trending",
      channels: ["blog", "social", "email"],
      description: "Aumento significativo nas buscas por estratégias de Black Friday"
    },
    {
      id: 2,
      title: "Inteligência Artificial no E-commerce",
      source: "Google News",
      trend: "+189%",
      type: "news",
      channels: ["blog", "social"],
      description: "Discussões sobre IA transformando o varejo online"
    },
    {
      id: 3,
      title: "Marketing de Conteúdo 2025",
      source: "Trends BR",
      trend: "+156%",
      type: "trending",
      channels: ["blog", "email"],
      description: "Tendências emergentes para o próximo ano"
    }
  ];

  const stats = [
    {
      title: "Conteúdos Gerados",
      value: canGenerateContent ? "0" : "-",
      change: "0%",
      icon: FileText
    },
    {
      title: "Oportunidades Ativas",
      value: "12",
      change: "+8.2%",
      icon: TrendingUp
    },
    {
      title: "Taxa de Engajamento",
      value: canGenerateContent ? "0%" : "-",
      change: "0%",
      icon: Share2
    },
    {
      title: "Próximas Publicações",
      value: canGenerateContent ? "0" : "-",
      change: "0",
      icon: Calendar
    }
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "blog": return <FileText className="h-3 w-3" />;
      case "email": return <Mail className="h-3 w-3" />;
      case "social": return <Share2 className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleGenerateContent = (opportunityId: number) => {
    if (!canGenerateContent) {
      toast({
        title: "Base de conhecimento incompleta",
        description: `Complete pelo menos 50% da sua base de conhecimento para gerar conteúdos. Atual: ${completionPercentage}%`,
        variant: "destructive"
      });
      navigate("/knowledge");
      return;
    }

    // Check if user is on free plan - this feature is PRO only
    const currentPlan = selectedCompany?.plan_type || 'free';
    if (currentPlan === 'free') {
      setIsModalOpen(true); // Open upgrade modal instead
      return;
    }
    
    // Open generation modal with preselected opportunity (PRO/Business only)
    setSelectedOpportunityId(opportunityId.toString());
    setIsModalOpen(true);
  };

  const handleGenerationConfirm = async (config: any) => {
    try {
      setIsModalOpen(false);
      setIsGenerating(true);
      
      toast({
        title: "Gerando conteúdo...",
        description: "Nossa IA está criando seu conteúdo personalizado. Isso pode levar alguns segundos.",
      });

      const { generateContentWithAI } = await import('@/utils/contentGeneration');
      await generateContentWithAI(config);
      
      setIsGenerating(false);
      toast({
        title: "Conteúdo gerado com sucesso!",
        description: "Seus conteúdos estão prontos na biblioteca.",
      });
      navigate('/library');
    } catch (error) {
      console.error('Error generating content:', error);
      setIsGenerating(false);
    }
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    navigate('/library');
  };

  if (isGenerating) {
    return <LoadingScreen onComplete={handleGenerationComplete} />;
  }

  return (
    <div className="p-6 space-y-6">

      {/* Onboarding Alert */}
      {!canGenerateContent && (
        <Alert className="border-primary/20 bg-primary/5">
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between w-full">
            <div>
              <p className="font-medium">Base de conhecimento incompleta ({completionPercentage}%)</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete pelo menos 50% para gerar conteúdos personalizados
              </p>
              {missingFields.length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer text-primary hover:underline">
                    Ver campos faltantes ({missingFields.length})
                  </summary>
                  <ul className="text-xs text-muted-foreground mt-1 ml-4 list-disc">
                    {missingFields.slice(0, 5).map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                    {missingFields.length > 5 && <li>+ {missingFields.length - 5} outros...</li>}
                  </ul>
                </details>
              )}
            </div>
            <Button variant="default" size="sm" onClick={() => navigate("/knowledge")}>
              <Settings className="h-4 w-4 mr-2" />
              Completar Base
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-card to-card/50 border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} desde o último mês
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Opportunities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Oportunidades em Destaque</h2>
        </div>

        <div className="grid gap-4">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="bg-gradient-to-r from-card to-card/50 border shadow-card hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={opportunity.type === "trending" ? "default" : "secondary"}>
                        {opportunity.source}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {opportunity.trend}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    <CardDescription>{opportunity.description}</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleGenerateContent(opportunity.id)}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    disabled={!canGenerateContent}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Conteúdo
                  </Button>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm text-muted-foreground">Canais sugeridos:</span>
                  <div className="flex gap-1">
                    {opportunity.channels.map((channel) => (
                      <Badge key={channel} variant="outline" className="text-xs">
                        {getChannelIcon(channel)}
                        <span className="ml-1 capitalize">{channel}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
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
          onConfirm={handleGenerationConfirm}
          preselectedOpportunity={selectedOpportunityId}
        />
      )}
    </div>
  );
}