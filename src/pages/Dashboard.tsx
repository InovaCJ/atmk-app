import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // Added Input
import {
  TrendingUp,
  FileText,
  Sparkles,
  ExternalLink,
  Newspaper,
  Loader2,
  Search, // Ensure Search is imported
  Zap,
  Clock,
  BookOpen,
} from "lucide-react";
import { ContentGenerationModal } from "@/components/ContentGenerationModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useClientContext } from "@/contexts/ClientContext";
import { useClients } from "@/hooks/useClients";
import { useClientKnowledgeValidation } from "@/hooks/useClientKnowledgeValidation";
import { useClientStatus } from "@/hooks/useClientStatus";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { useAuth } from "@/contexts/AuthContext";
import { usePostV1ApiIngestNews } from "@/http/generated";
import { useNewsFeed } from "@/hooks/useNewsFeed";
import { useContentLibrary } from "@/hooks/useContentLibrary";
import { usePeriod } from "@/contexts/PeriodContext";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { usePostHog } from "@posthog/react";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Added state for search

  const { selectedClientId, selectedClient } = useClientContext();
  const { clients } = useClients();
  const navigate = useNavigate();
  const firstClientId = useMemo(() => clients[0]?.id as string | undefined, [clients]);
  const { canGenerateContent: canGenerateFromKnowledge } = useClientKnowledgeValidation(firstClientId);
  const { contents } = useContentLibrary();
  const { selectedPeriod, getDaysFromPeriod } = usePeriod();
  const posthog = usePostHog();

  const { status: firstClientStatus } = useClientStatus(firstClientId || '', false);
  const hasSearchAutomation = !!firstClientStatus?.hasSearchAutomation;
  const hasNewsSources = !!firstClientStatus?.hasNewsSources;

  // Verifica se já há conteúdos gerados
  const hasGeneratedContent = contents.length > 0;

  // Converte o período selecionado para dias
  const days = getDaysFromPeriod(selectedPeriod);

  // Calcula as datas de início e fim do período
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    return { startDate, endDate };
  }, [days]);

  // Busca métricas da dashboard
  const { metrics, loading: metricsLoading } = useDashboardMetrics(
    dateRange.startDate,
    dateRange.endDate
  );

  // Pass searchQuery and days to the hook for filtering
  const { items: newsItems, loading: newsLoading, error: newsError } = useNewsFeed({
    clientId: selectedClientId || '',
    days: days,
    pageSize: 6,
    q: searchQuery // Connected search query
  });

  const [isRefreshingFeed, setIsRefreshingFeed] = useState(false);
  const { session } = useAuth();
  const { mutateAsync: ingestNews } = usePostV1ApiIngestNews({
    client: {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    },
  });

  const handleRefreshFeed = async () => {
    setIsRefreshingFeed(true);
    try {
      toast({ title: "Atualizando feed...", description: "Buscando itens das fontes." });

      posthog?.capture('News Feed Refresh Initiated', { clientId: selectedClientId });
      const result = await ingestNews({
        data: {
          clientId: selectedClientId || '',
        }
      });
      posthog?.capture('News Feed Refresh Completed', result);

      // Recarrega a página para atualizar o feed (ou idealmente invalidaria a query do useNewsFeed)
      window.location.reload();
      toast({ title: "Feed atualizado", description: "Os novos itens foram adicionados ao feed." });

    } catch (e: any) {
      toast({ title: "Erro ao atualizar feed", description: e?.message || 'Falha ao invocar ingest-news', variant: 'destructive' });
    } finally {
      setIsRefreshingFeed(false);
    }
  };

  // Monta os cards de métricas
  const stats = useMemo(() => {
    if (!metrics) {
      return [
        {
          title: "Temas Disponíveis",
          value: "—",
          subtitle: "Carregando...",
          icon: BookOpen,
        },
        {
          title: "Conteúdos Gerados",
          value: "—",
          subtitle: "Carregando...",
          icon: FileText,
          onClick: () => navigate('/library')
        },
        {
          title: "Automatizados",
          value: "—",
          subtitle: "Carregando...",
          icon: Zap,
        },
        {
          title: "Tempo Economizado",
          value: "—",
          subtitle: "Carregando...",
          icon: Clock,
        }
      ];
    }

    return [
      {
        title: "Temas Disponíveis",
        value: metrics.availableThemes.value,
        subtitle: metrics.availableThemes.subtitle,
        icon: BookOpen,
      },
      {
        title: "Conteúdos Gerados",
        value: metrics.totalContents.value,
        subtitle: metrics.totalContents.subtitle,
        icon: FileText,
        onClick: () => navigate('/library')
      },
      {
        title: "Automatizados",
        value: metrics.automatedContents.value,
        subtitle: metrics.automatedContents.subtitle,
        icon: Zap,
      },
      {
        title: "Tempo Economizado",
        value: metrics.timeSaved.value,
        subtitle: metrics.timeSaved.subtitle,
        icon: Clock,
      }
    ];
  }, [metrics, navigate]);

  const handleGenerateContent = (newsId: string) => {
    // Redireciona diretamente para a criação usando o ID da notícia como fonte
    navigate(`/content/create?source=feed&source_id=${newsId}`);
  };

  const handleGenerationConfirm = async (_config: any) => {
    setIsModalOpen(false);
    navigate('/content/create');
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    navigate('/library');
  };

  // Renderização da lista de notícias (Substituindo Featured Topics)
  const renderNewsFeed = () => {
    if (newsLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!newsItems || newsItems.length === 0) {
      return (
        <div className="rounded-md border p-8 text-center text-muted-foreground bg-muted/20">
          <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhuma notícia encontrada</p>
          <p className="text-sm mt-1 mb-4">
            {searchQuery
              ? `Nenhum resultado para "${searchQuery}"`
              : !hasNewsSources
                ? 'Cadastre fontes de notícias para começar a receber atualizações.'
                : 'Suas fontes não publicaram nada recentemente.'
            }
          </p>
          {!hasNewsSources && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/clients/${selectedClientId}?tab=news`)}>
              Configurar Fontes
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {newsItems.map((item: any) => {
          const summary =
            item.summary ||
            (item.content ? item.content.substring(0, 140) + "..." : "Sem resumo disponível.");

          return (
            <Card
              key={item.id}
              className="flex flex-col hover:border-primary/50 transition-colors h-full"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="font-normal text-xs truncate max-w-[150px]"
                  >
                    {item.news_sources?.name || "Fonte Externa"}
                  </Badge>

                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(item.published_at || item.created_at).toLocaleDateString(
                      "pt-BR"
                    )}
                  </span>
                </div>

                <CardTitle
                  className="text-base leading-tight line-clamp-2"
                  title={item.title}
                >
                  {item.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Texto */}
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                  {summary}
                </p>

                {/* Ações */}
                <div className="flex sm:flex-col gap-2 sm:mt-auto pt-2 shrink-0">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-sm"
                    onClick={() => handleGenerateContent(item.id)}
                  >
                    <Sparkles className="w-3 h-3 mr-2" />
                    Gerar conteúdo
                  </Button>

                  {item.url && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        title="Ler original"
                      >
                        <ExternalLink className="w-3 h-3 mr-2" />
                        Ler mais
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

    );
  };

  if (isGenerating) {
    return <LoadingScreen onComplete={handleGenerationComplete} />;
  }

  // Cálculo de progresso e próximo passo
  const hasCompany = clients?.length > 0;
  const hasConfiguredInfo = !!firstClientId;
  const automationConfigured = hasSearchAutomation;
  // Considera concluído se já tem conteúdos gerados OU se pode gerar baseado na validação
  const canCreateFirstContent = hasCompany && (hasGeneratedContent || canGenerateFromKnowledge);

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
      description: "Crie e configure um cliente para começar a gerar conteúdos personalizados.",
      ctaLabel: "Criar Empresa",
      onClick: () => navigate('/clients')
    }
    : !hasConfiguredInfo
      ? {
        id: 2,
        title: "Configurar Informações",
        description: "Adicione tom de voz, público-alvo e descrição para personalizar sua IA.",
        ctaLabel: "Configurar Informações",
        onClick: () => firstClientId ? navigate(`/clients/${firstClientId}?tab=knowledge`) : navigate('/clients')
      }
      : !hasNewsSources
        ? {
          id: 3,
          title: "Fontes de Notícias",
          description: "Conecte fontes confiáveis para sugerir temas relevantes e atualizados.",
          ctaLabel: "Configurar Fontes",
          onClick: () => firstClientId ? navigate(`/clients/${firstClientId}?tab=news`) : navigate('/clients')
        }
        : !automationConfigured
          ? {
            id: 4,
            title: "Automação de Busca",
            description: "Habilite a automação para buscar temas relevantes automaticamente.",
            ctaLabel: "Configurar Automação",
            onClick: () => firstClientId ? navigate(`/clients/${firstClientId}?tab=integrations`) : navigate('/clients')
          }
          : !canCreateFirstContent
            ? {
              id: 5,
              title: "Criar Primeiro Conteúdo",
              description: "Conclua as etapas anteriores para liberar a geração do primeiro conteúdo.",
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
            className={`bg-gradient-to-br from-card to-card/50 border shadow-card ${stat.onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
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
              {stat.subtitle ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* News Feed Section (Formerly Featured Topics) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Temas para gerar conteúdo
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar no feed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshFeed}
              disabled={isRefreshingFeed || !selectedClientId}
              className="w-full md:w-auto whitespace-nowrap"
            >
              {isRefreshingFeed ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" /> Atualizando...
                </>
              ) : (
                "Atualizar Feed"
              )}
            </Button>
          </div>
        </div>

        {renderNewsFeed()}
      </div>

      {/* Content Generation Modal */}
      <ContentGenerationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onConfirm={handleGenerationConfirm}
        preselectedOpportunity={selectedOpportunityId}
      />
    </div>
  );
}