import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  FileText, 
  Mail, 
  Share2, 
  Copy, 
  Star,
  Search,
  Calendar,
  Eye,
  ExternalLink,
  Mic,
  Edit2,
  Images
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ContentFeedback } from "@/components/ContentFeedback";
import { ImageCarousel } from "@/components/ImageCarousel";
import { ContentGenerationModal } from "@/components/ContentGenerationModal";

// Componente para estado vazio
const EmptyState = ({ type, title, description, icon }: {
  type: string;
  title: string; 
  description: string;
  icon: React.ReactNode;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerate = async (config: any) => {
    try {
      const { generateContentWithAI } = await import('@/utils/contentGeneration');
      await generateContentWithAI(config);
      // The utility function handles all toasts and UI feedback
    } catch (error) {
      console.error('Error in content generation:', error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-muted-foreground mb-6">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
        <Button onClick={() => setIsModalOpen(true)}>
          Gerar Primeiro Conteúdo
        </Button>
      </div>
      
      <ContentGenerationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onConfirm={handleGenerate}
      />
    </>
  );
};

export default function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [contentFeedbacks, setContentFeedbacks] = useState<{[key: number]: {rating: number, feedback: string}}>({});

  // Conteúdos de exemplo para teste
  const contents = [
    {
      id: 1,
      title: "Como Criar uma Estratégia de Marketing Digital Eficaz",
      description: "Guia completo para desenvolver e implementar uma estratégia de marketing digital que gera resultados",
      type: "blog",
      status: "published",
      createdAt: new Date("2024-12-01"),
      content: "O marketing digital se tornou essencial para o sucesso de qualquer negócio nos dias atuais. Neste artigo completo, vamos abordar os pilares fundamentais para criar uma estratégia que realmente funciona.\n\n## 1. Definindo seus objetivos\n\nAntes de qualquer ação, é crucial estabelecer metas claras e mensuráveis. Seja aumentar vendas, gerar leads ou fortalecer a marca, seus objetivos devem ser específicos.\n\n## 2. Conhecendo sua audiência\n\nUma pesquisa profunda sobre seu público-alvo é a base de toda estratégia bem-sucedida. Entenda suas dores, desejos e comportamentos.\n\n## 3. Escolhendo os canais certos\n\nNem toda plataforma será adequada para seu negócio. Foque onde sua audiência realmente está presente.\n\n## 4. Criando conteúdo relevante\n\nO conteúdo é o coração do marketing digital. Produza materiais que eduquem, entretenham e engajem seu público.\n\n## 5. Mensurando resultados\n\nSem análise de dados, você está navegando às cegas. Acompanhe métricas relevantes e ajuste sua estratégia conforme necessário.",
      slug: "estrategia-marketing-digital-eficaz",
      tags: ["marketing digital", "estratégia", "negócios"],
      readTime: "8 min",
      images: ["/placeholder.svg"],
      rating: 5
    },
    {
      id: 2,
      title: "Carrossel: Tendências de Design 2024",
      description: "As principais tendências visuais que vão dominar o design em 2024",
      type: "carrossel",
      status: "published",
      createdAt: new Date("2024-12-02"),
      content: "Carrossel com 8 slides sobre as tendências de design mais relevantes para este ano.",
      images: [
        "/placeholder.svg",
        "/placeholder.svg", 
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg"
      ],
      slides: [
        { title: "Gradientes Vibrantes", description: "Cores que saltam aos olhos" },
        { title: "Tipografia Bold", description: "Fontes que fazem declarações" },
        { title: "Minimalismo Funcional", description: "Menos é mais, sempre" },
        { title: "Ilustrações 3D", description: "Profundidade e realismo" },
        { title: "Cores Pastéis", description: "Suavidade e elegância" },
        { title: "Assimetria Controlada", description: "Quebrando padrões com propósito" },
        { title: "Micro-interações", description: "Detalhes que encantam" },
        { title: "Dark Mode", description: "Elegância e conforto visual" }
      ],
      rating: 4
    },
    {
      id: 3,
      title: "Newsletter: Novidades da Semana",
      description: "Resumo semanal com as principais atualizações e dicas da indústria",
      type: "email",
      status: "published",
      createdAt: new Date("2024-12-03"),
      content: "Olá!\n\nEspero que sua semana esteja sendo produtiva! Trouxe algumas novidades importantes que podem interessar você:\n\n🔥 **Destaque da Semana**\nNova funcionalidade de IA revoluciona o marketing de conteúdo\n\n📊 **Números que Impressionam**\n- 75% das empresas já usam automação\n- ROI médio de 300% em campanhas personalizadas\n\n💡 **Dica Rápida**\nPersonalize o máximo possível suas comunicações - isso pode aumentar as conversões em até 40%!\n\n🎯 **Próximos Eventos**\n- Webinar gratuito sobre IA no Marketing (15/12)\n- Workshop de Growth Hacking (20/12)\n\nUm ótimo resto de semana!\n\nEquipe Marketing Pro",
      subject: "🚀 Novidades que vão turbinar seus resultados",
      previewText: "IA, automação e dicas práticas para acelerar seu crescimento",
      images: [],
      rating: 5
    },
    {
      id: 4,
      title: "Carrossel: Dicas de Produtividade",
      description: "8 estratégias comprovadas para aumentar sua produtividade no trabalho",
      type: "carrossel", 
      status: "published",
      createdAt: new Date("2024-12-04"),
      content: "Carrossel educativo com dicas práticas de produtividade.",
      images: [
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg", 
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg"
      ],
      slides: [
        { title: "Técnica Pomodoro", description: "25 min focado + 5 min pausa" },
        { title: "Lista de Prioridades", description: "Foque no que importa" },
        { title: "Elimine Distrações", description: "Celular no modo avião" },
        { title: "Organize seu Espaço", description: "Ambiente limpo = mente clara" },
        { title: "Automatize Tarefas", description: "Use ferramentas a seu favor" },
        { title: "Delegue Responsabilidades", description: "Você não precisa fazer tudo" },
        { title: "Faça Pausas Regulares", description: "Descanso é parte do processo" },
        { title: "Planeje o Dia Anterior", description: "Comece com clareza" }
      ],
      rating: 5
    },
    {
      id: 5,
      title: "Email: Oferta Especial Black Friday",
      description: "Campanha promocional com desconto exclusivo para clientes",
      type: "email",
      status: "published", 
      createdAt: new Date("2024-12-05"),
      content: "🖤 BLACK FRIDAY CHEGOU! 🖤\n\nOlá [NOME],\n\nA oportunidade que você estava esperando finalmente chegou!\n\n🔥 **OFERTA EXCLUSIVA**\n50% OFF em todos os nossos cursos\n\n⏰ **APENAS 48 HORAS**\nPromoção válida até 29/11 às 23:59\n\n✨ **O QUE VOCÊ GANHA:**\n• Acesso vitalício aos conteúdos\n• Certificado de conclusão\n• Suporte direto com especialistas\n• Materiais complementares exclusivos\n\nDe R$ 497 por apenas R$ 248,50\n\n[BOTÃO: QUERO APROVEITAR AGORA]\n\n💡 **Depoimento de Cliente:**\n\"Melhor investimento que fiz na minha carreira!\" - Maria Silva\n\nNão deixe essa oportunidade passar!\n\nAbraços,\nEquipe EduTech",
      subject: "🔥 BLACK FRIDAY: 50% OFF - Apenas 48h!",
      previewText: "Sua chance de economizar 50% em todos os cursos. Corre!",
      images: [],
      rating: 4
    },
    {
      id: 6,
      title: "Carrossel: Erros Comuns no Instagram",
      description: "Os 8 erros mais frequentes que prejudicam o crescimento no Instagram",
      type: "carrossel",
      status: "published",
      createdAt: new Date("2024-12-06"),
      content: "Carrossel educativo sobre erros comuns no Instagram.",
      images: [
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg"
      ],
      slides: [
        { title: "Não ter Estratégia", description: "Postar sem planejamento não funciona" },
        { title: "Ignorar Analytics", description: "Dados guiam decisões inteligentes" },
        { title: "Comprar Seguidores", description: "Qualidade > Quantidade sempre" },
        { title: "Não Engajar", description: "Responda comentários e DMs" },
        { title: "Usar Hashtags Genéricas", description: "Seja específico e relevante" },
        { title: "Postar no Horário Errado", description: "Conheça sua audiência" },
        { title: "Não Contar Histórias", description: "Stories conectam com pessoas" },
        { title: "Abandonar a Consistência", description: "Regularidade constrói audiência" }
      ],
      rating: 4
    },
    {
      id: 7,
      title: "Email: Boas-vindas Novo Assinante",
      description: "Email de boas-vindas automatizado para novos leads da lista",
      type: "email",
      status: "draft",
      createdAt: new Date("2024-12-07"),
      content: "Seja muito bem-vindo(a), [NOME]! 🎉\n\nQue alegria ter você conosco!\n\nEu sou [SEU NOME], fundador(a) da [EMPRESA], e quero te contar um pouco sobre nossa missão:\n\n🎯 **Nossa Missão**\nAjudar empreendedores como você a alcançar resultados extraordinários através de estratégias práticas e comprovadas.\n\n📚 **O que você vai receber:**\n• Dicas semanais exclusivas\n• Cases de sucesso reais\n• Ferramentas gratuitas\n• Acesso a webinars especiais\n\n🎁 **BÔNUS DE BOAS-VINDAS**\nBaixe gratuitamente nosso e-book \"10 Estratégias para Dobrar suas Vendas\"\n\n[BOTÃO: BAIXAR E-BOOK GRÁTIS]\n\n💌 **Próximos Conteúdos:**\nNos próximos dias, você receberá uma série especial com os fundamentos do marketing digital.\n\nTem alguma dúvida específica? Responda este email - eu leio pessoalmente todas as mensagens!\n\nMais uma vez, seja bem-vindo(a) à nossa comunidade!\n\nCom carinho,\n[SEU NOME]",
      subject: "🎉 Bem-vindo(a)! Aqui está seu presente...",
      previewText: "Sua jornada de crescimento começa agora + e-book gratuito",
      images: [],
      rating: 5
    }
  ];

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "todos" || content.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "blog": return <FileText className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "social": return <Share2 className="h-4 w-4" />;
      case "carrossel": return <Images className="h-4 w-4" />;
      case "roteiro": return <Mic className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string, category?: string) => {
    switch (type) {
      case "blog": return "Artigo de Blog";
      case "email": return "E-mail Marketing";
      case "social": return "Post Social";
      case "carrossel": return "Carrossel";
      case "roteiro": return category || "Roteiro";
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "publicado": return "bg-green-100 text-green-800";
      case "rascunho": return "bg-yellow-100 text-yellow-800";
      case "agendado": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "publicado": return "Publicado";
      case "rascunho": return "Rascunho";
      case "agendado": return "Agendado";
      default: return status;
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência`,
    });
  };

  const handleRating = (contentId: number, newRating: number) => {
    setContentFeedbacks(prev => ({
      ...prev,
      [contentId]: {
        ...prev[contentId],
        rating: newRating
      }
    }));
    toast({
      title: "Avaliação salva",
      description: "Sua avaliação foi registrada com sucesso",
    });
  };

  const handleFeedback = (contentId: number, feedbackText: string) => {
    if (feedbackText.trim()) {
      setContentFeedbacks(prev => ({
        ...prev,
        [contentId]: {
          ...prev[contentId],
          feedback: feedbackText,
          rating: prev[contentId]?.rating || 0
        }
      }));
      toast({
        title: "Feedback salvo",
        description: "Seu feedback foi registrado e será usado para melhorar futuras gerações",
      });
    }
  };

  const openContentSheet = (content: any) => {
    setSelectedContent(content);
    setIsSheetOpen(true);
  };

  const getCurrentRating = (contentId: number) => {
    return contentFeedbacks[contentId]?.rating || contents.find(c => c.id === contentId)?.rating || 0;
  };

  const getCurrentFeedback = (contentId: number) => {
    return contentFeedbacks[contentId]?.feedback || "";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Conteúdos</h1>
          <p className="text-muted-foreground">
            Seus conteúdos gerados organizados por categoria
          </p>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conteúdos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="todos">Todos ({contents.length})</TabsTrigger>
            <TabsTrigger value="blog">Blog ({contents.filter(c => c.type === 'blog').length})</TabsTrigger>
            <TabsTrigger value="carrossel">Carrossel ({contents.filter(c => c.type === 'carrossel').length})</TabsTrigger>
            <TabsTrigger value="email">E-mail ({contents.filter(c => c.type === 'email').length})</TabsTrigger>
            <TabsTrigger value="roteiro">Roteiros ({contents.filter(c => c.type === 'roteiro').length})</TabsTrigger>
          </TabsList>
          
          {/* Content Display */}
          {filteredContents.length > 0 ? (
            <div className="grid gap-4 mt-8">
              {filteredContents.map((content) => (
                <Card key={content.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openContentSheet(content)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(content.type)}
                          <Badge variant="outline">{getTypeLabel(content.type)}</Badge>
                          <Badge className={getStatusColor(content.status)}>
                            {getStatusLabel(content.status)}
                          </Badge>
                        </div>
                        <h3 className="font-semibold mb-1">{content.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{content.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {content.createdAt.toLocaleDateString()}
                          </span>
                          {content.readTime && (
                            <span>{content.readTime}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${star <= getCurrentRating(content.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <TabsContent value="todos" className="mt-8">
              <EmptyState 
                type="todos"
                title="Nenhum conteúdo encontrado"
                description="Tente ajustar sua busca ou gerar novos conteúdos"
                icon={<FileText className="h-16 w-16" />}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Sheet lateral do conteúdo selecionado */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-[600px] sm:w-[700px] h-full overflow-y-auto">
          <SheetHeader className="space-y-3 pb-4 border-b">
            <SheetTitle className="flex items-center gap-3 text-xl">
              {selectedContent && getTypeIcon(selectedContent.type)}
              {selectedContent?.title}
            </SheetTitle>
            <SheetDescription className="text-base">
              {selectedContent?.description}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {selectedContent && (
              <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getTypeIcon(selectedContent.type)}
                  {getTypeLabel(selectedContent.type, selectedContent.category)}
                </Badge>
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {selectedContent.createdAt.toLocaleDateString()}
                </Badge>
                <Badge className={getStatusColor(selectedContent.status)}>
                  {getStatusLabel(selectedContent.status)}
                </Badge>
                {selectedContent.tags?.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>

              {selectedContent.type === "blog" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Slug URL</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={selectedContent.slug} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(selectedContent.slug || "", "Slug")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Conteúdo Completo</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(selectedContent.content || "", "Artigo")}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Artigo
                      </Button>
                    </div>
                    <Textarea
                      value={selectedContent.content}
                      readOnly
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {selectedContent.type === "social" && (
                <div className="space-y-4">
                  {selectedContent.images && selectedContent.images.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Imagens do Carrossel</label>
                      <ImageCarousel 
                        images={selectedContent.images}
                        captions={selectedContent.captions}
                        title={selectedContent.title}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Legenda do Post</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(selectedContent.caption || selectedContent.postCaption || "", "Legenda")}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Legenda
                      </Button>
                    </div>
                    <Textarea
                      value={selectedContent.caption || selectedContent.postCaption || ""}
                      readOnly
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {selectedContent.type === "carrossel" && (
                <div className="space-y-4">
                  {selectedContent.images && selectedContent.images.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Imagens do Carrossel</label>
                      <ImageCarousel 
                        images={selectedContent.images}
                        captions={selectedContent.slides?.map((slide: any) => slide.title)}
                        title={selectedContent.title}
                      />
                    </div>
                  )}
                  
                  {selectedContent.slides && selectedContent.slides.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Slides do Carrossel</label>
                      <div className="space-y-2">
                        {selectedContent.slides.map((slide: any, index: number) => (
                          <div key={index} className="border p-3 rounded">
                            <h4 className="font-medium">{slide.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{slide.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Conteúdo Completo</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(selectedContent.content || "", "Carrossel")}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Conteúdo
                      </Button>
                    </div>
                    <Textarea
                      value={selectedContent.content || ""}
                      readOnly
                      className="min-h-[100px] font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {selectedContent.type === "email" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Assunto</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={selectedContent.subject} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(selectedContent.subject || "", "Assunto")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Preheader</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={selectedContent.previewText || selectedContent.preheader} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(selectedContent.previewText || selectedContent.preheader || "", "Preheader")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Corpo do E-mail</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(selectedContent.content || "", "E-mail")}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar E-mail
                      </Button>
                    </div>
                    <Textarea
                      value={selectedContent.content}
                      readOnly
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {selectedContent.type === "roteiro" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={selectedContent.category} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(selectedContent.category || "", "Categoria")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Roteiro</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(selectedContent.content || "", "Roteiro")}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Roteiro
                      </Button>
                    </div>
                    <Textarea
                      value={selectedContent.content}
                      readOnly
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Rating and Feedback */}
              <ContentFeedback 
                content={selectedContent}
                currentRating={getCurrentRating(selectedContent.id)}
                currentFeedback={getCurrentFeedback(selectedContent.id)}
                onRating={handleRating}
                onFeedback={handleFeedback}
              />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}