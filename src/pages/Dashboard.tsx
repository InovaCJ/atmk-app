import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  FileText, 
  Mail, 
  Share2, 
  Calendar,
  ChevronRight,
  Sparkles,
  Settings,
  Building2,
  Info,
  Rss,
  Search,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContentGenerationModal } from "@/components/ContentGenerationModal";
import { PlanModal } from "@/components/PlanModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useClientContext } from "@/contexts/ClientContext";
import { useClients } from "@/hooks/useClients";
import { useClientKnowledgeValidation } from "@/hooks/useClientKnowledgeValidation";
import { useClientStatus } from "@/hooks/useClientStatus";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { useFeaturedTopics } from "@/hooks/useFeaturedTopics";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedClientId, selectedClient } = useClientContext();
  const { clients, loading: clientsLoading } = useClients();
  const navigate = useNavigate();
  const firstClientId = useMemo(() => clients[0]?.id as string | undefined, [clients]);
  const { canGenerateContent: canGenerateFromKnowledge } = useClientKnowledgeValidation(firstClientId);
  // Detectar automação do buscador para marcar etapa como concluída
  const { status: firstClientStatus } = useClientStatus(firstClientId || '', false);
  const hasSearchAutomation = !!firstClientStatus?.hasSearchAutomation;
  const hasNewsSources = !!firstClientStatus?.hasNewsSources;
  const { topics: featuredTopics } = useFeaturedTopics(firstClientId || '', 7, 8);
  const handleRefreshFeed = async () => {
    if (!firstClientId) return;
    try {
      toast({ title: "Atualizando feed...", description: "Buscando itens das fontes." });
      const { data, error } = await supabase.functions.invoke('ingest-news', {
        body: { clientId: firstClientId, days: 7 }
      });
      if (data && Array.isArray(data.validation) && data.validation.length > 0) {
        const invalid = data.validation.filter((v: any) => !v.isRss || v.itemsFound === 0);
        if (invalid.length > 0) {
          toast({
            title: "Validação de fontes",
            description: `${invalid.length} fonte(s) sem RSS válido ou sem itens recentes.`
          });
        }
      }
      if (error) throw error;
      toast({ title: "Feed atualizado", description: "Atualize a página para ver novos itens." });
    } catch (e: any) {
      toast({ title: "Erro ao atualizar feed", description: e?.message || 'Falha ao invocar ingest-news', variant: 'destructive' });
    }
  };
  

  // Dados vazios para novos usuários - serão carregados do Supabase quando implementado
  const opportunities: any[] = [];

  const stats = [
    {
      title: "Clientes",
      value: selectedClient ? "1" : "0",
      change: selectedClient ? "+100%" : "0%",
      icon: TrendingUp
    },
    {
      title: "Conteúdos Gerados",
      value: "0",
      change: "0%",
      icon: FileText,
      onClick: () => navigate('/library')
    }
  ];

  const renderFeaturedTopics = () => {
    if (!featuredTopics || featuredTopics.length === 0) {
      return (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          {(!hasNewsSources) ? (
            <span>Sem fontes cadastradas. Adicione fontes na aba "Fontes de Notícias".</span>
          ) : (
            <span>Sem temas em destaque no período selecionado. Suas fontes podem não ter publicado recentemente.</span>
          )}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {featuredTopics.map(t => (
          <div key={t.term} className="rounded-md border px-3 py-2 text-sm flex items-center justify-between">
            <span className="truncate">#{t.term}</span>
            <span className="opacity-60">{t.count}</span>
          </div>
        ))}
      </div>
    );
  };

  // removed latest news section per request

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "blog": return <FileText className="h-3 w-3" />;
      case "email": return <Mail className="h-3 w-3" />;
      case "social": return <Share2 className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleGenerateContent = (opportunityId: number) => {
    // Open generation modal with preselected opportunity for all users
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

  // Cálculo de progresso e próximo passo (mantendo regras atuais)
  const hasCompany = clients.length > 0;
  const hasConfiguredInfo = !!firstClientId; // mesma regra atual
  const automationConfigured = hasSearchAutomation;
  const canCreateFirstContent = hasCompany && canGenerateFromKnowledge;

  const totalSteps = 5;
  const completedSteps = [
    hasCompany,
    hasConfiguredInfo,
    hasNewsSources,
    automationConfigured,
    canCreateFirstContent
  ].filter(Boolean).length;

  const nextStep = !hasCompany
    ? {
        id: 1,
        title: "Criar uma Empresa",
        description:
          "Configure sua primeira empresa para começar a gerar conteúdos personalizados.",
        ctaLabel: "Criar Empresa",
        onClick: () => navigate('/clients')
      }
    : !hasConfiguredInfo
    ? {
        id: 2,
        title: "Configurar Informações",
        description:
          "Adicione tom de voz, público-alvo e descrição para personalizar sua IA.",
        ctaLabel: "Configurar Informações",
        onClick: () =>
          firstClientId ? navigate(`/clients/${firstClientId}?tab=knowledge`) : navigate('/clients')
      }
    : !hasNewsSources
    ? {
        id: 3,
        title: "Fontes de Notícias",
        description:
          "Conecte fontes confiáveis para sugerir temas relevantes e atualizados.",
        ctaLabel: "Configurar Fontes",
        onClick: () =>
          firstClientId ? navigate(`/clients/${firstClientId}?tab=news`) : navigate('/clients')
      }
    : !automationConfigured
    ? {
        id: 4,
        title: "Automação de Busca",
        description:
          "Habilite a automação para buscar temas relevantes automaticamente.",
        ctaLabel: "Configurar Automação",
        onClick: () =>
          firstClientId ? navigate(`/clients/${firstClientId}?tab=integrations`) : navigate('/clients')
      }
    : !canCreateFirstContent
    ? {
        id: 5,
        title: "Criar Primeiro Conteúdo",
        description:
          "Conclua as etapas anteriores para liberar a geração do primeiro conteúdo.",
        ctaLabel: "Gerar Conteúdo",
        onClick: () => navigate('/library')
      }
    : undefined;

  return (
    <div className="p-6 space-y-6">
      <OnboardingBanner
        totalSteps={totalSteps}
        completedSteps={completedSteps}
        nextStep={nextStep}
        allDoneTitle="Bem-vindo ao ATMK!"
      />


      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`bg-gradient-to-br from-card to-card/50 border shadow-card ${
              stat.onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
            }`}
            onClick={stat.onClick}
          >
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

      {/* Featured Topics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Temas em Destaque</h2>
          <Button size="sm" variant="outline" onClick={handleRefreshFeed}>Atualizar feed agora</Button>
        </div>
        {renderFeaturedTopics()}
      </div>

      

      {/* Content Generation Modal - Available for all users */}
      <ContentGenerationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onConfirm={handleGenerationConfirm}
        preselectedOpportunity={selectedOpportunityId}
      />

    </div>
  );
}