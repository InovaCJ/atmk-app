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
  ExternalLink
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export default function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Mock data para conteúdos gerados
  const contents = [
    {
      id: 1,
      type: "blog",
      title: "Black Friday 2024: 10 Estratégias Infalíveis para E-commerce",
      description: "Guia completo com estratégias testadas para maximizar vendas na Black Friday",
      createdAt: "2024-01-15",
      status: "published",
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
      title: "Carousel: IA no E-commerce",
      description: "5 slides sobre como a IA está transformando o varejo online",
      createdAt: "2024-01-14",
      status: "draft",
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
      status: "scheduled",
      category: "Tendências",
      subject: "🚀 As 7 Tendências de Marketing que Vão Dominar 2025",
      preheader: "Fique à frente da concorrência com essas previsões exclusivas",
      content: `Olá [NOME],

O marketing digital está em constante evolução, e 2025 promete trazer mudanças significativas...

## Tendência #1: Marketing Conversacional com IA
...`,
      rating: 0,
      tags: ["Tendências", "Marketing", "2025"]
    }
  ];

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || content.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "blog": return <FileText className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "social": return <Share2 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "blog": return "Artigo de Blog";
      case "email": return "E-mail Marketing";
      case "social": return "Post Social";
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
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
    setRating(newRating);
    toast({
      title: "Avaliação salva",
      description: "Sua avaliação foi registrada com sucesso",
    });
  };

  const handleFeedback = (contentId: number) => {
    if (feedback.trim()) {
      toast({
        title: "Feedback enviado",
        description: "Seu feedback foi registrado e será usado para melhorar futuras gerações",
      });
      setFeedback("");
    }
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
            <TabsTrigger value="all">Todos ({contents.length})</TabsTrigger>
            <TabsTrigger value="blog">Blog ({contents.filter(c => c.type === 'blog').length})</TabsTrigger>
            <TabsTrigger value="social">Social ({contents.filter(c => c.type === 'social').length})</TabsTrigger>
            <TabsTrigger value="email">E-mail ({contents.filter(c => c.type === 'email').length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContents.map((content) => (
          <Card key={content.id} className="bg-gradient-to-br from-card to-card/50 border-0 shadow-card hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(content.type)}
                  <Badge variant="outline">{getTypeLabel(content.type)}</Badge>
                  <Badge className={getStatusColor(content.status)}>
                    {content.status}
                  </Badge>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getTypeIcon(content.type)}
                        {content.title}
                      </DialogTitle>
                      <DialogDescription>
                        {content.description}
                      </DialogDescription>
                    </DialogHeader>

                    {/* Content Details */}
                    <div className="space-y-6">
                      {content.type === "blog" && (
                        <div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium">Título</label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input value={content.title} readOnly />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleCopy(content.title, "Título")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Slug</label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input value={content.slug} readOnly />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleCopy(content.slug, "Slug")}
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
                                onClick={() => handleCopy(content.content || "", "Conteúdo")}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar Artigo
                              </Button>
                            </div>
                            <Textarea
                              value={content.content}
                              readOnly
                              className="min-h-[200px] font-mono text-sm"
                            />
                          </div>

                          <div className="mt-4">
                            <label className="text-sm font-medium">Imagem de Capa Sugerida</label>
                            <div className="flex items-center gap-2 mt-2">
                              <img 
                                src={content.coverImage} 
                                alt="Capa sugerida" 
                                className="w-16 h-16 object-cover rounded" 
                              />
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver no Unsplash
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {content.type === "social" && (
                        <div>
                          <div className="space-y-4">
                            <label className="text-sm font-medium">Imagens Geradas</label>
                            <div className="grid grid-cols-2 gap-4">
                              {content.images?.map((image, index) => (
                                <div key={index} className="space-y-2">
                                  <img 
                                    src={image} 
                                    alt={`Slide ${index + 1}`} 
                                    className="w-full aspect-square object-cover rounded-lg" 
                                  />
                                  <div className="flex items-center gap-2">
                                    <Textarea
                                      value={content.captions?.[index] || ""}
                                      readOnly
                                      className="text-sm"
                                      rows={2}
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleCopy(content.captions?.[index] || "", "Caption")}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Download className="h-4 w-4 mr-2" />
                                    Baixar Imagem
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {content.type === "email" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Assunto</label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input value={content.subject} readOnly />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleCopy(content.subject || "", "Assunto")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Preheader</label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input value={content.preheader} readOnly />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleCopy(content.preheader || "", "Preheader")}
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
                                onClick={() => handleCopy(content.content || "", "E-mail")}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar E-mail
                              </Button>
                            </div>
                            <Textarea
                              value={content.content}
                              readOnly
                              className="min-h-[200px] font-mono text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Rating and Feedback */}
                      <div className="border-t pt-6 space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Avalie este conteúdo (0 = inútil, 5 = muito útil)
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Button
                                key={star}
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRating(content.id, star)}
                                className="p-1"
                              >
                                <Star 
                                  className={`h-5 w-5 ${
                                    star <= (content.rating || rating) 
                                      ? "fill-yellow-400 text-yellow-400" 
                                      : "text-gray-300"
                                  }`} 
                                />
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Feedback para melhorias
                          </label>
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Descreva melhorias que poderiam ser aplicadas neste conteúdo..."
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              rows={3}
                            />
                            <Button 
                              onClick={() => handleFeedback(content.id)}
                              disabled={!feedback.trim()}
                              size="sm"
                            >
                              Enviar Feedback
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                    {content.rating}/5
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