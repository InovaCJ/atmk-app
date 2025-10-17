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
  Filter,
  Sparkles,
  Calendar,
  Eye,
  ExternalLink,
  Mic,
  Edit2,
  Images
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ContentGenerationModal } from "@/components/ContentGenerationModal";
import { PlanModal } from "@/components/PlanModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useClientKnowledgeValidation } from "@/hooks/useClientKnowledgeValidation";
import { useClientContext } from "@/contexts/ClientContext";
import { ContentFeedback } from "@/components/ContentFeedback";
import { ImageCarousel } from "@/components/ImageCarousel";
import { usePlanLimits } from "@/hooks/usePlanLimits";

// Componente para estado vazio
const EmptyState = ({ type, title, description, icon }: {
  type: string;
  title: string; 
  description: string;
  icon: React.ReactNode;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast: toastFunc } = useToast();
  
  // Usar primeiro cliente para validação ou undefined se não houver
  const { clients } = useClientContext();
  const selectedClientId = clients.length > 0 ? clients[0].id : undefined;
  const { canGenerateContent: canGenerateKnowledge, completionPercentage } = useClientKnowledgeValidation(selectedClientId);
  const { canGenerateContent: canGeneratePlan, remainingContent } = usePlanLimits();
  
  const canGenerate = canGenerateKnowledge && canGeneratePlan;

  const handleGenerate = async (config: any) => {
    try {
      toast({
        title: "Gerando conteúdo...",
        description: "Nossa IA está criando seu conteúdo personalizado. Isso pode levar alguns segundos.",
      });
      
      const { generateContentWithAI } = await import('@/utils/contentGeneration');
      await generateContentWithAI(config);
      // The utility function handles all toasts and UI feedback
    } catch (error) {
      console.error('Error in content generation:', error);
    }
  };

  const handleGenerateClick = () => {
    if (!canGenerateKnowledge) {
      toast({
        title: "Base de conhecimento incompleta",
        description: `Complete pelo menos 50% da sua base de conhecimento para gerar conteúdos. Atual: ${completionPercentage}%`,
        variant: "destructive"
      });
      navigate("/knowledge");
      return;
    }
    if (!canGeneratePlan) {
      return; // Will trigger plan modal
    }
    setIsModalOpen(true);
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
        <Button 
          onClick={handleGenerateClick}
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          disabled={!canGenerate}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {clients.length > 0 && clients[0].plan === 'free' 
            ? `Gerar Conteúdo (${remainingContent} restantes)`
            : 'Gerar Primeiro Conteúdo'
          }
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
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  
  const navigate = useNavigate();
  const { selectedClient, selectedClientId } = useClientContext();
  const { canGenerateContent: canGenerateKnowledge, completionPercentage } = useClientKnowledgeValidation(selectedClientId || undefined);
  const { canGenerateContent: canGeneratePlan, remainingContent } = usePlanLimits();
  const { toast } = useToast();
  
  const canGenerate = canGenerateKnowledge && canGeneratePlan;

  // Conteúdos vazios para novos usuários - serão carregados do Supabase quando implementado
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

  const handleGenerationConfirm = async (config: any) => {
    // This is now handled directly in the modal
    // The modal will close and redirect to library after generation
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
        <Button 
          onClick={() => {
            if (!canGenerateKnowledge) {
              toast({
                title: "Base de conhecimento incompleta",
                description: `Complete pelo menos 50% da sua base de conhecimento para gerar conteúdos. Atual: ${completionPercentage}%`,
                variant: "destructive"
              });
              navigate("/knowledge");
              return;
            }
            if (!canGeneratePlan) {
              setIsPlanModalOpen(true);
              return;
            }
            // Agora navegamos para a página de criação
            navigate('/content/create');
          }}
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          disabled={!canGenerate}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {selectedClient?.plan === 'free' 
            ? `Gerar Conteúdo (${remainingContent} restantes)`
            : 'Gerar Novo Conteúdo'
          }
        </Button>
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
                        </div>
                        <h3 className="font-semibold mb-1">{content.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{content.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {content.createdAt ? new Date(content.createdAt).toLocaleDateString() : 'Data não disponível'}
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
        <SheetContent side="right" className="w-[70vw] sm:max-w-[70vw] max-w-none h-full overflow-y-auto">
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
                  {selectedContent.createdAt ? new Date(selectedContent.createdAt).toLocaleDateString() : 'Data não disponível'}
                </Badge>
                {selectedContent.tags?.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>

                {selectedContent.type === "blog" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Meta Description (SEO)</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Textarea 
                          value={selectedContent.metaDescription || ""} 
                          readOnly 
                          className="min-h-[60px] resize-none"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(selectedContent.metaDescription || "", "Meta Description")}
                          className="shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ideal para SEO: até 160 caracteres
                      </p>
                    </div>

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

        {/* Show plan modal for free users who hit limit, content modal otherwise */}
        {!canGeneratePlan && selectedClient?.plan === 'free' ? (
          <PlanModal 
            isOpen={isPlanModalOpen}
            onClose={() => setIsPlanModalOpen(false)}
          />
        ) : null}
        
        <PlanModal 
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
        />
        
        <ContentGenerationModal
          open={isGenerationModalOpen}
          onOpenChange={setIsGenerationModalOpen}
          onConfirm={handleGenerationConfirm}
        />
      </div>
    );
  }