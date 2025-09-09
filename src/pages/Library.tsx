import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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

  const handleGenerate = (config: any) => {
    console.log('Gerando conteúdo com configuração:', config);
    toast({
      title: "Geração iniciada!",
      description: "Seu conteúdo está sendo gerado. Você será notificado quando estiver pronto.",
    });
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [contentFeedbacks, setContentFeedbacks] = useState<{[key: number]: {rating: number, feedback: string}}>({});

  // Empty state - será preenchido com conteúdos gerados pela IA
  const contents: any[] = [];

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

  const openContentDrawer = (content: any) => {
    setSelectedContent(content);
    setIsDrawerOpen(true);
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
            <TabsTrigger value="todos">Todos (0)</TabsTrigger>
            <TabsTrigger value="blog">Blog (0)</TabsTrigger>
            <TabsTrigger value="social">Social (0)</TabsTrigger>
            <TabsTrigger value="email">E-mail (0)</TabsTrigger>
            <TabsTrigger value="roteiro">Roteiros (0)</TabsTrigger>
          </TabsList>
          
          {/* Empty State por tipo de conteúdo */}
          <TabsContent value="todos" className="mt-8">
            <EmptyState 
              type="todos"
              title="Biblioteca Vazia"
              description="Seus conteúdos gerados pela IA aparecerão aqui"
              icon={<FileText className="h-16 w-16" />}
            />
          </TabsContent>
          
          <TabsContent value="blog" className="mt-8">
            <EmptyState 
              type="blog"
              title="Nenhum Artigo de Blog"
              description="Gere artigos detalhados para seu blog usando nossa IA"
              icon={<FileText className="h-16 w-16" />}
            />
          </TabsContent>
          
          <TabsContent value="social" className="mt-8">
            <EmptyState 
              type="social"
              title="Nenhum Post Social"
              description="Crie posts envolventes para suas redes sociais"
              icon={<Share2 className="h-16 w-16" />}
            />
          </TabsContent>
          
          <TabsContent value="email" className="mt-8">
            <EmptyState 
              type="email"
              title="Nenhum E-mail Marketing"
              description="Desenvolva campanhas de e-mail personalizadas"
              icon={<Mail className="h-16 w-16" />}
            />
          </TabsContent>
          
          <TabsContent value="roteiro" className="mt-8">
            <EmptyState 
              type="roteiro"
              title="Nenhum Roteiro"
              description="Gere roteiros para vídeos, podcasts e webinars"
              icon={<Mic className="h-16 w-16" />}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Drawer do conteúdo selecionado */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[80vh]">
          <div className="mx-auto w-full max-w-4xl p-6">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-3">
                {selectedContent && getTypeIcon(selectedContent.type)}
                {selectedContent?.title}
              </DrawerTitle>
              <DrawerDescription>
                {selectedContent?.description}
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-6 overflow-y-auto max-h-[60vh]">
              {selectedContent && (
                <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTypeIcon(selectedContent.type)}
                    {getTypeLabel(selectedContent.type, selectedContent.category)}
                  </Badge>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {selectedContent.createdAt}
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
                          onClick={() => handleCopy(selectedContent.postCaption || "", "Legenda")}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Legenda
                        </Button>
                      </div>
                      <Textarea
                        value={selectedContent.postCaption}
                        readOnly
                        className="min-h-[200px] font-mono text-sm"
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
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}