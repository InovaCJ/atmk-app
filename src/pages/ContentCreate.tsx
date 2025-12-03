import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { useClientContext } from "@/contexts/ClientContext";
import { useNewsFeed } from "@/hooks/useNewsFeed";
import { Sparkles, Link as LinkIcon, Newspaper, Globe, ListRestart, Search } from "lucide-react";
import { usePostV1ApiGenerateContent, PostV1ApiGenerateContentMutationRequestTypeEnumKey, SourceTypeEnumKey } from "@/http/generated";
import { useAuth } from "@/contexts/AuthContext";
import { useGetV1ApiGeneratedContentGeneratedcontentid } from "@/http/generated/hooks/useGetV1ApiGeneratedContentGeneratedcontentid";
import { ContentEditor } from "@/components/ContentEditor";

// Categorias únicas (sem subtipos)
type Category = "post" | "carousel" | "scriptShort" | "scriptYoutube" | "blog" | "email";

export default function ContentCreate() {
  const navigate = useNavigate();
  const { selectedClientId } = useClientContext();
  const [params, setSearchParams] = useSearchParams();

  // Fonte
  const [newsSearchTerm, setNewsSearchTerm] = useState<string>("");
  const [newsId, setNewsId] = useState<string>("");
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [contextText, setContextText] = useState<string>("");
  const [objective, setObjective] = useState<string>("");
  const [useKnowledge, setUseKnowledge] = useState<boolean>(true);
  const [category, setCategory] = useState<Category | "">("");
  const { session } = useAuth();
  const [inputType, setInputType] = useState("text");
  const [generatedContentId, setGeneratedContentId] = useState<string | null>(params.get("id"));
  const [isGenerating, setIsGenerating] = useState(false);
  const newsDropdownTriggerRef = useRef<HTMLDivElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined);



  const { data: content, isLoading: isContentLoading } = useGetV1ApiGeneratedContentGeneratedcontentid(generatedContentId || "", {
    client: {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    },
  });

  const { mutateAsync: generateContent } = usePostV1ApiGenerateContent({
    client: {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    },
  });

  // Carregar itens de notícia recentes
  const { items: newsItems, loading: newsLoading } = useNewsFeed({ clientId: selectedClientId || "", days: 7, pageSize: 50 });

  const filteredNewsItems = useMemo(() => {
    if (!newsSearchTerm.trim()) return newsItems;
    const searchLower = newsSearchTerm.toLowerCase();
    return newsItems.filter((n) =>
      n.title?.toLowerCase().includes(searchLower) ||
      n?.news_sources?.name?.toLowerCase().includes(searchLower)
    );
  }, [newsItems, newsSearchTerm]);

  const canGenerate = useMemo(() => {
    const hasSource = Boolean(newsId || sourceUrl.trim());
    const hasContext = contextText.trim().length > 0;
    const hasCategory = Boolean(category);
    // Para edição existente, fonte pode não ser obrigatória se já temos conteúdo, mas mantemos a regra de campos mínimos
    return (hasSource || hasContext) && hasCategory && Boolean(selectedClientId);
  }, [newsId, sourceUrl, contextText, category, selectedClientId]);

  const clearAll = () => {
    setNewsId("");
    setSourceUrl("");
    setContextText("");
    setObjective("");
    setCategory("");
    setGeneratedContentId(null);
    setSearchParams({});
  }

  // Carregar conteúdo se ID estiver na URL
  useEffect(() => {
    const contentId = params.get("id");
    const sourceParam = params.get("source"); // feed, url
    const sourceId = params.get("source_id"); // ID da notícia se source=feed

    const loadContent = async () => {
      // Caso 1: Carregando para EDIÇÃO de conteúdo já gerado (se não tiver flag source=feed)
      if (contentId && sourceParam !== 'feed') {
        if (!content) {
          toast({ title: "Erro", description: "Não foi possível carregar o conteúdo.", variant: "destructive" });
          return;
        }

        // Popula configurações
        if (content.category) setCategory(content.category as Category);
        if (content.objective) setObjective(content.objective);
        if (content.context) setContextText(content.context);

        // Tenta mapear a fonte original se disponível
        if (content.sourceCategory === 'feed' && content.sourceContent) {
          setInputType('feed');
          setNewsId(content.sourceContent);
          return;
        }
        if (content.sourceCategory === 'url' && content.sourceContent) {
          setInputType('url');
          setSourceUrl(content.sourceContent);
          return;
        }
        setInputType('text');
      }

      // Caso 2: Criando novo conteúdo a partir de uma fonte (Dashboard redirect)
      if (sourceParam === 'feed' && sourceId) {
        setInputType('feed');
        setNewsId(sourceId);
      }
    };

    loadContent();
  }, [params, content]);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({ title: "Preencha os campos", description: "Selecione ao menos um formato e informe fonte ou contexto.", variant: "destructive" });
      return;
    }

    if (!selectedClientId) {
      toast({ title: "Cliente não selecionado", description: "Selecione um cliente antes de gerar conteúdo.", variant: "destructive" });
      return;
    }

    try {
      setIsGenerating(true);
      const result = await generateContent({
        data: {
          type: category as PostV1ApiGenerateContentMutationRequestTypeEnumKey,
          source: inputType === "text" ? undefined : {
            type: inputType as SourceTypeEnumKey,
            resource: inputType === "feed" ? newsId : sourceUrl.trim(),
          },
          useKnowledgeBase: useKnowledge,
          objective: objective.trim(),
          context: contextText.trim(),
        }
      });

      const generatedId = result.id;
      if (generatedId) {
        setGeneratedContentId(generatedId);
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.set("id", generatedId);
          newParams.delete("source"); // Remove source param to switch to edit mode
          return newParams;
        });
      }

      toast({ title: "Conteúdo gerado!", description: "Você pode refinar o resultado usando o chat abaixo." });
    } catch (e: any) {
      const errorMessage = e.response?.data?.error?.message || e.message || "Erro desconhecido";
      toast({ title: "Erro ao gerar", description: errorMessage, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const INPUT_TYPE_OPTIONS = [
    { value: "text", label: "Texto" },
    { value: "url", label: "URL" },
    { value: "feed", label: "Feed de notícias" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 overflow-x-hidden h-[calc(100vh-100px)]">
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border h-full">
        <ResizablePanel defaultSize={40} minSize={25} maxSize={55}>
          <Card className="h-full rounded-none border-0">
            <CardContent className="space-y-6 p-4 md:p-6">
              <div className="space-y-2">
                <Label>Fonte do tema</Label>
                <div className="space-y-2">
                  <Select value={inputType}
                    onValueChange={setInputType}
                    disabled={Boolean(generatedContentId)}
                  >
                    <SelectTrigger className="text-left">
                      <SelectValue placeholder="Selecione a fonte do tema" />
                    </SelectTrigger>
                    <SelectContent>
                      {INPUT_TYPE_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    {
                      inputType === "feed" && <>
                        <Newspaper className="h-4 w-4" />
                        <div ref={newsDropdownTriggerRef} className="flex-1">
                          <DropdownMenu
                            onOpenChange={(open) => {
                              if (open && newsDropdownTriggerRef.current) {
                                setDropdownWidth(newsDropdownTriggerRef.current.offsetWidth);
                              }
                              if (!open) {
                                setNewsSearchTerm("");
                              }
                            }}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between min-w-0 overflow-hidden whitespace-normal [&>span]:truncate [&>span]:block"
                              >
                                <span className="text-left flex-1 min-w-0 mr-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                  {newsId ? (newsItems.find((n) => n.id === newsId)?.title || "Notícia selecionada") : "Selecionar notícia do feed"}
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="max-h-[360px] overflow-hidden flex flex-col"
                              style={{ width: dropdownWidth ? `${dropdownWidth}px` : undefined }}
                              align="start"
                            >
                              <div className="p-2 border-b">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Buscar notícias..."
                                    value={newsSearchTerm}
                                    onChange={(e) => setNewsSearchTerm(e.target.value)}
                                    className="pl-8 h-9"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                              <div className="overflow-y-auto flex-1">
                                <DropdownMenuLabel className="px-2">Últimas notícias</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {newsLoading && <div className="px-3 py-2 text-sm text-muted-foreground">Carregando...</div>}
                                {!newsLoading && filteredNewsItems.length === 0 && (
                                  <div className="px-3 py-2 text-sm text-muted-foreground">
                                    {newsSearchTerm ? "Nenhuma notícia encontrada" : "Nenhum item recente"}
                                  </div>
                                )}
                                {!newsLoading && filteredNewsItems.map((n) => (
                                  <DropdownMenuCheckboxItem
                                    key={n.id}
                                    checked={newsId === n.id}
                                    onCheckedChange={() => setNewsId(n.id)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium line-clamp-1">{n.title}</span>
                                      <span className="text-xs text-muted-foreground line-clamp-1">{n?.news_sources?.name}</span>
                                    </div>
                                  </DropdownMenuCheckboxItem>
                                ))}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div></>
                    }
                  </div>
                  {
                    inputType === "url" && <>
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        <Input placeholder="Ou cole a URL da notícia" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} disabled={Boolean(generatedContentId)} />
                      </div>
                    </>
                  }
                </div>
                <p className="text-xs text-muted-foreground">Se não escolher uma fonte, descreva o tema abaixo.</p>
              </div>

              <div className="space-y-2">
                <Label>Contexto/Tema</Label>
                <Textarea
                  placeholder="Descreva o tema do conteúdo (obrigatório se não houver notícia)"
                  rows={5}
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  disabled={Boolean(generatedContentId)}
                />
              </div>

              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Input
                  placeholder="Ex: gerar leads para a landing X; roteiro para reels explicando Y; post de anúncio Z"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  disabled={Boolean(generatedContentId)}
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={(v) => { setCategory(v as Category); }} disabled={Boolean(generatedContentId)}>
                  <SelectTrigger className="text-left">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Postagens (Instagram, Facebook, X, Linkedin, Pinterest)</SelectItem>
                    <SelectItem value="carousel">Carrossel (Instagram, Facebook, X, Linkedin, Pinterest, YouTube)</SelectItem>
                    <SelectItem value="scriptShort">Roteiro curto (Reels, TikTok, Shorts)</SelectItem>
                    <SelectItem value="scriptYoutube">Roteiro YouTube (Vlog, Tutorial)</SelectItem>
                    <SelectItem value="blog">Artigo Blog</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subtipo removido: as categorias atendem todas as plataformas */}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Consultar base de conhecimento</Label>
                  <p className="text-xs text-muted-foreground">Usar informações cadastradas da empresa na geração.</p>
                </div>
                <Switch checked={useKnowledge} onCheckedChange={setUseKnowledge} disabled={Boolean(generatedContentId)} />
              </div>

              <div className="flex gap-2 justify-end">
                {
                  !generatedContentId ? (
                    <Button onClick={handleGenerate} disabled={!canGenerate || isGenerating || isContentLoading} className="flex-1">
                      <Sparkles className="mr-2 h-4 w-4" /> {isGenerating ? 'Gerando...' : 'Gerar agora'}
                    </Button>
                  ) : (
                    <Button onClick={clearAll} className="flex-1">
                      <ListRestart className="mr-2 h-4 w-4" /> Começar novo
                    </Button>

                  )
                }
                <Button variant="outline" onClick={() => navigate("/library")}>Ver biblioteca</Button>
              </div>
            </CardContent>
          </Card>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60} minSize={45} maxSize={75}>
          <Card className="h-full rounded-none border-0">
            <CardContent className="p-0 h-full">
              <div className="h-full overflow-y-auto">
                <ContentEditor
                  isLoading={isGenerating || isContentLoading}
                  contentId={generatedContentId}
                />
              </div>
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}