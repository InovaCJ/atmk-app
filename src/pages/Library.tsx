import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Search,
  Sparkles,
  Edit2,
  Images,
  Trash2,
  Bot,
  User,
  Layers,
  FileEdit,
  Video,
  Youtube
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ContentGenerationModal } from "@/components/ContentGenerationModal";
import { PlanModal } from "@/components/PlanModal";
import { useClientKnowledgeValidation } from "@/hooks/useClientKnowledgeValidation";
import { useClientContext } from "@/contexts/ClientContext";
import { ContentFeedback } from "@/components/ContentFeedback";
import { ImageCarousel } from "@/components/ImageCarousel";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useContentLibrary, ContentItem } from "@/hooks/useContentLibrary";

// Componente para estado vazio
const EmptyState = ({ type, title, description, icon }: {
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  const navigate = useNavigate();

  // Usar primeiro cliente para validação ou undefined se não houver
  const { clients } = useClientContext();
  const selectedClientId = clients.length > 0 ? clients[0].id : undefined;
  const { canGenerateContent: canGenerateKnowledge, completionPercentage } = useClientKnowledgeValidation(selectedClientId);
  const { canGenerateContent: canGeneratePlan, remainingContent } = usePlanLimits();

  const canGenerate = canGenerateKnowledge && canGeneratePlan;

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
      return; // Will trigger plan modal in parent
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
    </>
  );
};

export default function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  const [generationType, setGenerationType] = useState("all"); // all | manual | automatic
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [contentFeedbacks, setContentFeedbacks] = useState<{ [key: string]: { rating: number, feedback: string } }>({});
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);

  const navigate = useNavigate();
  const { selectedClient, selectedClientId } = useClientContext();

  // Hook de dados reais
  const { contents, loading, deleteContent } = useContentLibrary();

  const { canGenerateContent: canGenerateKnowledge, completionPercentage } = useClientKnowledgeValidation(selectedClientId || undefined);
  const { canGenerateContent: canGeneratePlan, remainingContent } = usePlanLimits();

  const canGenerate = canGenerateKnowledge && canGeneratePlan;

  // Filter logic
  const filteredContents = useMemo(() => {
    return contents.filter(content => {
      const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by generation type (manual vs automatic)
      // Note: Adjust 'manual' string if your backend uses a different value like 'created' or null
      const typeValue = content.type || 'manual';
      const matchesType = generationType === "all" ? true : typeValue === generationType;

      // Map backend types to filter categories if needed
      // Backend types: post, story, reel, article, newsletter
      const matchesCategory = categoryFilter === "todos" ? true : content.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [contents, searchTerm, generationType, categoryFilter]);

  const contentCategories = {
    email: { label: "Email", icon: Mail },
    blog: { label: "Artigo", icon: FileText },
    carousel: { label: "Carrossel", icon: Images },
    post: { label: "Post", icon: FileEdit },
    scriptShort: { label: "Reel/Story", icon: Video },
    scriptYoutube: { label: "YouTube", icon: Youtube },
  };

  const getTypeIcon = (type: string) => {
    const Icon =
      contentCategories[type as keyof typeof contentCategories]?.icon ||
      FileText;

    return <Icon className="h-4 w-4" />;
  };


  const getTypeLabel = (type: string) => {
    return (contentCategories[type as keyof typeof contentCategories])?.label || type;
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência`,
    });
  };

  const handleGenerationConfirm = async (_config: any) => {
    setIsGenerationModalOpen(false);
    navigate('/content/create');
  };

  const handleRating = (contentId: number | string, newRating: number) => {
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

  const handleFeedback = (contentId: number | string, feedbackText: string) => {
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
        description: "Seu feedback foi registrado.",
      });
    }
  };

  const openContentSheet = (content: ContentItem) => {
    setSelectedContent(content);
    setIsSheetOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      const success = await deleteContent(deleteTarget.id);
      if (success) {
        toast({ title: "Conteúdo removido", description: "O conteúdo foi excluído permanentemente." });
        setDeleteTarget(null);
        if (selectedContent?.id === deleteTarget.id) {
          setIsSheetOpen(false);
        }
      }
    }
  };

  const getCurrentRating = (contentId: string) => {
    return contentFeedbacks[contentId]?.rating || 0;
  };

  const getCurrentFeedback = (contentId: string) => {
    return contentFeedbacks[contentId]?.feedback || "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando biblioteca...</p>
        </div>
      </div>
    );
  }

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

        <Tabs value={generationType} onValueChange={setGenerationType}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="all" className="flex gap-2">
                <Layers className="h-4 w-4" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex gap-2">
                <User className="h-4 w-4" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="automatic" className="flex gap-2">
                <Sparkles className="h-4 w-4" />
                Automático
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tipo:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(contentCategories).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Display */}
          {filteredContents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
              {filteredContents.map((content) => (
                <Card
                  key={content.id}
                  className="group hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openContentSheet(content)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(content.category)}
                        <Badge variant="outline">{getTypeLabel(content.category)}</Badge>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
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
                      <span>{new Date(content.created_at).toLocaleDateString()}</span>
                    </div>
                    {/* <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      {content.ai_model && (
                        <span className="flex items-center gap-1" title="Gerado por IA">
                          <Sparkles className="h-3 w-3" />
                          {content.ai_model === 'openai_gpt4' ? 'GPT-4' : 'IA'}
                        </span>
                      )}
                    </div> */}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                type="todos"
                title={`Nenhum conteúdo ${generationType === 'manual' ? 'manual' : 'automático'} encontrado`}
                description={generationType === 'manual'
                  ? "Gere novos conteúdos manualmente na tela de criação."
                  : "Configure automações para gerar conteúdo automaticamente."
                }
                icon={generationType === 'manual' ? <User className="h-16 w-16" /> : <Bot className="h-16 w-16" />}
              />
            </div>
          )}
        </Tabs>
      </div>

      {/* Sheet lateral do conteúdo selecionado */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-[70vw] sm:max-w-[70vw] max-w-none h-full overflow-y-auto">
          <SheetHeader className="space-y-3 pb-4 border-b">
            <SheetTitle className="flex items-center gap-3 text-xl">
              {selectedContent && getTypeIcon(selectedContent.category)}
              {selectedContent?.title}
            </SheetTitle>
            <SheetDescription className="text-base flex gap-2 items-center">
              <span>Criado em {selectedContent?.created_at ? new Date(selectedContent.created_at).toLocaleString() : ''}</span>
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {selectedContent && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTypeIcon(selectedContent.category)}
                    {getTypeLabel(selectedContent.category)}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedContent.type === 'automatic' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {selectedContent.type === 'automatic' ? 'Automático' : 'Manual'}
                  </Badge>
                </div>

                {/* Exibição genérica baseada no conteúdo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Conteúdo</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(selectedContent.text || "", "Conteúdo")}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  {/* Tenta renderizar como HTML se parecer HTML, senão texto puro */}
                  {selectedContent.title.includes('<') ? (
                    <div
                      className="min-h-[300px] p-4 border rounded-md prose prose-sm max-w-none dark:prose-invert bg-card"
                      dangerouslySetInnerHTML={{ __html: selectedContent.title }}
                    />
                  ) : (
                    <Textarea
                      value={selectedContent.title}
                      readOnly
                      className="min-h-[300px] font-mono text-sm"
                    />
                  )}
                </div>

                {/* Metadata específica se houver mídia */}
                {/* {selectedContent.media_urls && selectedContent.media_urls.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mídia</label>
                    <ImageCarousel
                      images={selectedContent.media_urls}
                      title={selectedContent.title}
                    />
                  </div>
                )} */}

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

      {/* Show plan modal for free users who hit limit */}
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