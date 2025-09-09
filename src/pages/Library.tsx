import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Mail, 
  Share2, 
  Copy, 
  Download, 
  Star,
  Search,
  Filter,
  Calendar,
  Eye,
  ExternalLink,
  Mic,
  Edit2
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ContentFeedback } from "@/components/ContentFeedback";

export default function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contentFeedbacks, setContentFeedbacks] = useState<{[key: number]: {rating: number, feedback: string}}>({});

  // Mock data para conteúdos gerados
  const contents = [
    {
      id: 1,
      type: "blog",
      title: "Black Friday 2024: 10 Estratégias Infalíveis para E-commerce",
      description: "Guia completo com estratégias testadas para maximizar vendas na Black Friday",
      createdAt: "2024-01-15",
      status: "publicado",
      category: "Marketing Digital",
      slug: "black-friday-2024-estrategias-ecommerce",
      coverImage: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&h=200&fit=crop",
      content: `# Black Friday 2024: 10 Estratégias Infalíveis para E-commerce

A Black Friday representa uma das maiores oportunidades do ano para e-commerces...

## 1. Preparação Antecipada da Campanha
...

## 2. Segmentação Inteligente de Público
...`,
      rating: 4,
      tags: ["Black Friday", "E-commerce", "Marketing"]
    },
    {
      id: 2,
      type: "social",
      title: "Carrossel: IA no E-commerce",
      description: "5 slides sobre como a IA está transformando o varejo online",
      createdAt: "2024-01-14",
      status: "rascunho",
      category: "Tecnologia",
      images: [
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop"
      ],
      captions: [
        "🤖 A IA está revolucionando o e-commerce! Descubra como implementar na sua loja",
        "💡 Personalização em tempo real aumenta conversões em até 30%"
      ],
      rating: 5,
      tags: ["IA", "Tecnologia", "Inovação"]
    },
    {
      id: 3,
      type: "email",
      title: "Newsletter: Tendências Marketing 2025",
      description: "E-mail sobre as principais tendências para o próximo ano",
      createdAt: "2024-01-13",
      status: "agendado",
      category: "Tendências",
      subject: "🚀 As 7 Tendências de Marketing que Vão Dominar 2025",
      preheader: "Fique à frente da concorrência com essas previsões exclusivas",
      content: `Olá [NOME],

O marketing digital está em constante evolução, e 2025 promete trazer mudanças significativas...

## Tendência #1: Marketing Conversacional com IA
...`,
      rating: 0,
      tags: ["Tendências", "Marketing", "2025"]
    },
    {
      id: 4,
      type: "roteiro",
      title: "Roteiro para Podcast: Marketing Digital para PMEs",
      description: "Roteiro estruturado para episódio sobre estratégias de marketing digital",
      createdAt: "2024-01-12",
      status: "publicado",
      category: "Roteiro para Podcast",
      content: `[INTRO - 2 minutos]
Olá, pessoal! Bem-vindos ao nosso podcast sobre marketing digital...

[BLOCO 1 - 8 minutos]
Hoje vamos falar sobre as principais estratégias...

[INTERVALO - 30 segundos]
Este episódio é patrocinado por...`,
      rating: 4,
      tags: ["Roteiro para Podcast", "Marketing Digital", "PMEs"]
    },
    {
      id: 5,
      type: "roteiro",
      title: "Roteiro para Vídeo: Tutorial de SEO",
      description: "Roteiro para vídeo tutorial sobre otimização para motores de busca",
      createdAt: "2024-01-11",
      status: "rascunho",
      category: "Roteiro para Vídeos",
      content: `[ABERTURA - 15 segundos]
VISUAL: Logo animado + música de abertura
NARRAÇÃO: "Oi, pessoal! Hoje vamos aprender SEO do zero..."

[CENA 1 - 2 minutos]
VISUAL: Tela do Google com busca
NARRAÇÃO: "O que é SEO e por que ele é importante..."`,
      rating: 0,
      tags: ["Roteiro para Vídeos", "SEO", "Tutorial"]
    },
    {
      id: 6,
      type: "roteiro",
      title: "Roteiro para Webinar: IA no Marketing",
      description: "Roteiro completo para webinar sobre inteligência artificial no marketing",
      createdAt: "2024-01-10",
      status: "agendado",
      category: "Roteiro para Webnars",
      content: `[PRÉ-WEBINAR - 5 minutos antes]
- Música de fundo suave
- Slide: "O webinar começará em breve"
- Chat: Boas-vindas aos participantes

[ABERTURA - 5 minutos]
Slide 1: Título do webinar
"Olá, pessoal! Bem-vindos ao nosso webinar sobre IA no Marketing..."`,
      rating: 5,
      tags: ["Roteiro para Webnars", "IA", "Marketing"]
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
      case "roteiro": return <Mic className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string, category?: string) => {
    switch (type) {
      case "blog": return "Artigo de Blog";
      case "email": return "E-mail Marketing";
      case "social": return "Post Social";
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

  const openContentDialog = (content: any) => {
    setSelectedContent(content);
    setIsDialogOpen(true);
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
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
            <TabsTrigger value="social">Social ({contents.filter(c => c.type === 'social').length})</TabsTrigger>
            <TabsTrigger value="email">E-mail ({contents.filter(c => c.type === 'email').length})</TabsTrigger>
            <TabsTrigger value="roteiro">Roteiros ({contents.filter(c => c.type === 'roteiro').length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContents.map((content) => (
          <Card 
            key={content.id} 
            className="bg-gradient-to-br from-card to-card/50 border border-border/50 shadow-card hover:shadow-elegant hover:border-border transition-all duration-300 cursor-pointer"
            onClick={() => openContentDialog(content)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(content.type)}
                  <Badge variant="outline">{getTypeLabel(content.type, content.category)}</Badge>
                  <Badge className={getStatusColor(content.status)}>
                    {getStatusLabel(content.status)}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    openContentDialog(content);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">{content.title}</CardTitle>
              <CardDescription>{content.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(content.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {getCurrentRating(content.id)}/5
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {content.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          {selectedContent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedContent.type)}
                  {selectedContent.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedContent.description}
                </DialogDescription>
              </DialogHeader>

              {/* Content Details */}
              <div className="space-y-6">
                {selectedContent.type === "blog" && (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium">Título</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input value={selectedContent.title} readOnly />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopy(selectedContent.title, "Título")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Slug</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input value={selectedContent.slug} readOnly />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopy(selectedContent.slug, "Slug")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Conteúdo do Artigo</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(selectedContent.content || "", "Conteúdo")}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Artigo
                        </Button>
                      </div>
                      <Textarea
                        value={selectedContent.content}
                        readOnly
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </div>

                      <div className="mt-4">
                        <label className="text-sm font-medium">Imagem de Capa Sugerida</label>
                        <div className="flex items-center gap-2 mt-2">
                          <img 
                            src={selectedContent.coverImage} 
                            alt="Capa sugerida" 
                            className="w-16 h-16 object-cover rounded" 
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await fetch(selectedContent.coverImage);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `capa-${selectedContent.slug || selectedContent.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                                toast({
                                  title: "Download iniciado",
                                  description: "A imagem está sendo baixada para sua pasta de downloads."
                                });
                              } catch (error) {
                                toast({
                                  title: "Erro no download",
                                  description: "Não foi possível baixar a imagem. Tente novamente.",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar Imagem
                          </Button>
                        </div>
                      </div>
                  </div>
                )}

                {selectedContent.type === "social" && (
                  <div>
                    <div className="space-y-4">
                      <label className="text-sm font-medium">Imagens Geradas</label>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedContent.images?.map((image: string, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-start gap-2">
                              <Textarea
                                value={selectedContent.captions?.[index] || ""}
                                readOnly
                                className="text-sm flex-1"
                                rows={2}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleCopy(selectedContent.captions?.[index] || "", "Legenda")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <img 
                              src={image} 
                              alt={`Imagem ${index + 1}`} 
                              className="w-full aspect-square object-cover rounded-lg" 
                            />
                            <Button variant="outline" size="sm" className="w-full"
                              onClick={async () => {
                                try {
                                  const response = await fetch(image);
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `post-imagem-${index + 1}-${selectedContent.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  window.URL.revokeObjectURL(url);
                                  toast({
                                    title: "Download iniciado",
                                    description: "A imagem está sendo baixada para sua pasta de downloads."
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Erro no download",
                                    description: "Não foi possível baixar a imagem. Tente novamente.",
                                    variant: "destructive"
                                  });
                                }
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Baixar Imagem
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedContent.type === "email" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                          <Input value={selectedContent.preheader} readOnly />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopy(selectedContent.preheader || "", "Preheader")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
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
            </>
          )}
        </DialogContent>
      </Dialog>

      {filteredContents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum conteúdo encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente outro termo de busca" : "Comece gerando seu primeiro conteúdo"}
          </p>
        </div>
      )}
    </div>
  );
}