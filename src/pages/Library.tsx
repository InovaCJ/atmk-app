import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
  , Trash2, Folder
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
import { useAuth } from "@/contexts/AuthContext";
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
  const navigate = useNavigate();
  const { toast: toastFunc } = useToast();
  
  // Usar primeiro cliente para validação ou undefined se não houver
  const { clients } = useClientContext();
  const selectedClientId = clients.length > 0 ? clients[0].id : undefined;
  const { canGenerateContent: canGenerateKnowledge, completionPercentage } = useClientKnowledgeValidation(selectedClientId);
  const { canGenerateContent: canGeneratePlan, remainingContent } = usePlanLimits();
  
  const canGenerate = canGenerateKnowledge && canGeneratePlan;

  // Geração agora redireciona para a tela de criação

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
    navigate('/content/create');
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
      
      {/* Modal de geração removido em favor da página de criação */}
    </>
  );
};

export default function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modeTab, setModeTab] = useState("manual"); // manual | auto
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [contentFeedbacks, setContentFeedbacks] = useState<{[key: number]: {rating: number, feedback: string}}>({});
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  
  const navigate = useNavigate();
  const { selectedClient, selectedClientId } = useClientContext();
  const { user } = useAuth();
  const { canGenerateContent: canGenerateKnowledge, completionPercentage } = useClientKnowledgeValidation(selectedClientId || undefined);
  const { canGenerateContent: canGeneratePlan, remainingContent } = usePlanLimits();
  const { toast } = useToast();
  
  const canGenerate = canGenerateKnowledge && canGeneratePlan;

  // Mock local por usuário (email da sessão)
  const initialContents = useMemo(() => {
    const email = user?.email || "";
    if (email === "naturerota@gmail.com") {
      const now = Date.now();
      const make = (id: number, type: string, title: string, extra: any = {}, isAutomated: boolean = false) => ({ id, type, title, description: "Conteúdo gerado pela IA.", updatedAt: new Date(now - id * 86400000).toISOString(), isAutomated, ...extra });
      const arr: any[] = [];
      let idx = 1;
      for (let i = 0; i < 3; i++) arr.push(make(idx++, "blog", `Sustentabilidade no Agro ${i+1}`, { content: "<p>Artigo...</p>" }, false));
      for (let i = 0; i < 2; i++) arr.push(make(idx++, "blog", `Tendências Semana ${i+1}`, { content: "<p>Artigo...</p>" }, true));
      for (let i = 0; i < 3; i++) arr.push(make(idx++, "email", `Campanha Outono ${i+1}`, { subject: "Assunto", content: "Corpo..." }, false));
      for (let i = 0; i < 2; i++) arr.push(make(idx++, "email", `Boletim Automático ${i+1}`, { subject: "Assunto", content: "Corpo..." }, true));
      for (let i = 0; i < 3; i++) arr.push(make(idx++, "social", `Post Engajamento ${i+1}`, { caption: "Legenda..." }, false));
      for (let i = 0; i < 2; i++) arr.push(make(idx++, "social", `Post Automático ${i+1}`, { caption: "Legenda..." }, true));
      for (let i = 0; i < 3; i++) arr.push(make(idx++, "carrossel", `Carrossel Produtos ${i+1}`, { slides: [{ title: "Slide 1", description: "..." }] }, false));
      for (let i = 0; i < 2; i++) arr.push(make(idx++, "carrossel", `Carrossel Automático ${i+1}`, { slides: [{ title: "Slide 1", description: "..." }] }, true));
      for (let i = 0; i < 3; i++) arr.push(make(idx++, "roteiro", `Roteiro Vídeo ${i+1}`, { category: "Tutorial", content: "Roteiro..." }, false));
      for (let i = 0; i < 2; i++) arr.push(make(idx++, "roteiro", `Roteiro Automático ${i+1}`, { category: "Tutorial", content: "Roteiro..." }, true));
      return arr;
    }
    return [];
  }, [user?.email]);

  const [contents, setContents] = useState<any[]>(initialContents);

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isAuto = !!content.isAutomated;
    const matchesMode = modeTab === "manual" ? !isAuto : isAuto;
    const matchesCategory = categoryFilter === "todos" ? true : content.type === categoryFilter;
    return matchesSearch && matchesMode && matchesCategory;
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

  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const confirmDelete = () => {
    // Apenas simulação local
    setContents(prev => prev.filter(c => c.id !== deleteTarget?.id));
    setDeleteTarget(null);
    toast({ title: "Conteúdo removido", description: "Esta ação não pode ser desfeita." });
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

        <Tabs value={modeTab} onValueChange={setModeTab}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="manual">Manuais</TabsTrigger>
              <TabsTrigger value="auto">Automáticas</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Categoria:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="carrossel">Carrossel</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="social">Post social</SelectItem>
                  <SelectItem value="roteiro">Roteiros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Content Display */}
          {filteredContents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
              {filteredContents.map((content) => (
                <Card key={content.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(content.type)}
                        <Badge variant="outline">{getTypeLabel(content.type)}</Badge>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/content/create?id=${content.id}`)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(content)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-semibold line-clamp-2 min-h-[44px]">{content.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Edited {content.updatedAt ? new Date(content.updatedAt).toLocaleDateString() : "--"}</span>
                      <span className="flex items-center gap-1"><Folder className="h-3 w-3" /> 12 Files</span>
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

        {/* Modal de confirmação de exclusão */}
        <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir conteúdo?</DialogTitle>
              <DialogDescription>Esta ação não pode ser desfeita. O conteúdo será removido permanentemente.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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