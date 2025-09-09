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
  Plus
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Dashboard() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Mock data para trends/oportunidades
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
      value: hasCompletedOnboarding ? "0" : "-",
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
      value: hasCompletedOnboarding ? "0%" : "-",
      change: "0%",
      icon: Share2
    },
    {
      title: "Próximas Publicações",
      value: hasCompletedOnboarding ? "0" : "-",
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
    if (!hasCompletedOnboarding) {
      // Redirect to settings/onboarding
      window.location.href = "/onboarding";
    } else {
      // Generate content logic
      console.log("Generating content for opportunity:", opportunityId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie suas oportunidades de conteúdo e performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Últimos 30 dias
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Conteúdo
          </Button>
        </div>
      </div>

      {/* Onboarding Alert */}
      {!hasCompletedOnboarding && (
        <Alert className="border-primary/20 bg-primary/5">
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span>
              Complete seu cadastro para desbloquear a geração de conteúdos personalizados
            </span>
            <Button variant="primary" size="sm" asChild>
              <a href="/onboarding">
                <Settings className="h-4 w-4 mr-2" />
                Completar Cadastro
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-card to-card/50 border-0 shadow-card">
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
          <Button variant="ghost" size="sm">
            Ver todas
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid gap-4">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="bg-gradient-to-r from-card to-card/50 border-0 shadow-card hover:shadow-elegant transition-all duration-300">
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
    </div>
  );
}