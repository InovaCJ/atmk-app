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

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedClientId, selectedClient } = useClientContext();
  const { clients, loading: clientsLoading } = useClients();
  const navigate = useNavigate();
  

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

  // Componente de onboarding para novos usuários
  const OnboardingSteps = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Bem-vindo ao ATMK!</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Para começar a gerar conteúdos personalizados, siga estes passos essenciais:
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Passo 1: Criar Empresa */}
        <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <CardTitle className="text-lg">Criar uma Empresa</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Configure sua primeira empresa para começar a gerar conteúdos personalizados.
            </p>
            <Button 
              onClick={() => navigate('/clients')}
              className="w-full"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Criar Empresa
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Passo 2: Informações da Empresa */}
        <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <CardTitle className="text-lg">Configurar Informações</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Adicione informações importantes como tom de voz, público-alvo e descrição da empresa.
            </p>
            <Button 
              onClick={() => navigate('/clients')}
              variant="outline"
              className="w-full"
              disabled
            >
              <Info className="h-4 w-4 mr-2" />
              Configurar (Após criar empresa)
            </Button>
          </CardContent>
        </Card>

        {/* Passo 3: Fontes de Notícias */}
        <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <CardTitle className="text-lg">Fontes de Notícias</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Configure fontes confiáveis para sugerir temas relevantes e atualizados.
            </p>
            <Button 
              variant="outline"
              className="w-full"
              disabled
            >
              <Rss className="h-4 w-4 mr-2" />
              Configurar (Em breve)
            </Button>
          </CardContent>
        </Card>

        {/* Passo 4: Automação */}
        <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">4</span>
              </div>
              <CardTitle className="text-lg">Automação de Busca</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Configure a automação para buscar temas relevantes na internet automaticamente.
            </p>
            <Button 
              variant="outline"
              className="w-full"
              disabled
            >
              <Search className="h-4 w-4 mr-2" />
              Configurar (Em breve)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Dica:</strong> Comece criando sua primeira empresa. Depois você poderá configurar todas as outras funcionalidades para gerar conteúdos personalizados e relevantes.
        </AlertDescription>
      </Alert>
    </div>
  );

  // Se não há clientes e não está carregando, mostrar onboarding
  if (!clientsLoading && clients.length === 0) {
    return (
      <div className="p-6">
        <OnboardingSteps />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">


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

      {/* Opportunities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Temas em Destaque</h2>
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