import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { useClientContext } from "@/contexts/ClientContext";
import { useNewsFeed } from "@/hooks/useNewsFeed";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Download, Scissors, Sparkles, Link as LinkIcon, Newspaper, Globe, CheckCircle2, Settings2, Wand2, Heading1, Heading2, Bold, Italic, Underline, List, ListOrdered, Undo2, Redo2, Palette, Strikethrough, Quote, Paperclip, Send } from "lucide-react";
import type { ChatKitOptions } from "@openai/chatkit";
import { AIChatKit } from "@/components/AIChatKit";
import { chatKitOptions as defaultChatKitOptions } from "@/lib/chatkit-options";
import { localDemoAdapter } from "@/lib/chat-adapter";

// Categorias únicas (sem subtipos)
type Category = "post" | "carousel" | "scriptShort" | "scriptYoutube" | "blog" | "email";

function mapCategoryToBackend(category: Category): "social" | "video" | "blog" | "email" {
  switch (category) {
    case "post":
    case "carousel":
      return "social";
    case "scriptShort":
    case "scriptYoutube":
      return "video";
    case "blog":
      return "blog";
    case "email":
    default:
      return "email";
  }
}

function buildDocFromResponse(contentType: string, data: any): string {
  // Converte a resposta da função em HTML simples para o editor
  try {
    if (contentType === "blog" && data?.content) {
      return `<h1>${data.title || "Artigo"}</h1>\n<div>${(data.content as string).replace(/\n/g, "<br/>")}</div>`;
    }
    if (contentType === "email" && data?.content) {
      return `<h1>${data.title || data.subject || "E-mail"}</h1>\n<div>${data.content}</div>`;
    }
    if (contentType === "social") {
      const body = [data?.content, (data?.hashtags || [])?.join(" "), data?.cta]
        .filter(Boolean)
        .join("<br/><br/>");
      return `<h2>${data?.title || "Post para redes sociais"}</h2><div>${body}</div>`;
    }
    if (contentType === "video") {
      return `<h2>${data?.title || "Roteiro de Vídeo"}</h2><div>${(data?.content || "").toString().replace(/\n/g, "<br/>")}</div>`;
    }
  } catch {}
  return typeof data === "string" ? `<div>${data}</div>` : `<div>Conteúdo gerado.</div>`;
}

export default function ContentCreate() {
  const navigate = useNavigate();
  const { selectedClientId } = useClientContext();
  const [params] = useSearchParams();

  // Fonte
  const [newsId, setNewsId] = useState<string>("");
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [contextText, setContextText] = useState<string>("");
  const [objective, setObjective] = useState<string>("");
  const [useKnowledge, setUseKnowledge] = useState<boolean>(true);
  const [category, setCategory] = useState<Category | "">("");
  // Sem subtipo: todas as postagens são híbridas

  // Carregar itens de notícia recentes
  const { items: newsItems, loading: newsLoading } = useNewsFeed({ clientId: selectedClientId || "", days: 7, pageSize: 50 });

  // Editor
  const [html, setHtml] = useState<string>("");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);
  const [customColor, setCustomColor] = useState("");
  const [promptText, setPromptText] = useState("");

  const canGenerate = useMemo(() => {
    const hasSource = Boolean(newsId || sourceUrl.trim());
    const hasContext = contextText.trim().length > 0;
    const hasCategory = Boolean(category);
    return (hasSource || hasContext) && hasCategory && Boolean(selectedClientId);
  }, [newsId, sourceUrl, contextText, category, selectedClientId]);

  useEffect(() => {
    const contentId = params.get("id");
    if (contentId) {
      // Placeholder: no backend ainda. Futuro: buscar rascunho e carregar.
    }
  }, [params]);

  // Sem multiformato; subopção será usada futuramente para prompt específico

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (selection && savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
  };

  const exec = (cmd: string, val?: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    restoreSelection();
    document.execCommand(cmd, false, val);
    setHtml(el.innerHTML);
    saveSelection();
  };

  const applyLink = () => {
    const url = prompt("URL do link:") || "";
    if (!url) return;
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    restoreSelection();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      document.execCommand("createLink", false, url);
    } else {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.textContent = url;
      anchor.target = "_blank";
      const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      if (range) range.insertNode(anchor);
      else el.appendChild(anchor);
    }
    setHtml(el.innerHTML);
    saveSelection();
  };

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({ title: "Preencha os campos", description: "Selecione ao menos um formato e informe fonte ou contexto.", variant: "destructive" });
      return;
    }

    try {
      setIsGenerating(true);
      const backendType = mapCategoryToBackend(category as Category);
      const { generateContentWithAI } = await import("@/utils/contentGeneration");
      const result = await generateContentWithAI({
        opportunityId: "onboarding-generated",
        contentType: backendType,
        companyId: selectedClientId as string,
      } as any);

      const htmlDoc = buildDocFromResponse(backendType, result);
      setHtml(htmlDoc);
      // escreve dentro do editor
      if (editorRef.current) editorRef.current.innerHTML = htmlDoc;
      toast({ title: "Conteúdo gerado!", description: "Ajuste o texto ao lado direito e exporte quando quiser." });
    } catch (e: any) {
      toast({ title: "Erro ao gerar", description: e?.message || "Falha inesperada", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const text = editorRef.current?.innerText || "";
      await navigator.clipboard.writeText(text);
      toast({ title: "Copiado", description: "Conteúdo copiado para a área de transferência." });
    } catch {}
  };

  const downloadTxt = () => {
    const blob = new Blob([editorRef.current?.innerText || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conteudo.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDoc = () => {
    const htmlContent = `<!DOCTYPE html><html><head><meta charset='utf-8'></head><body>${editorRef.current?.innerHTML || ""}</body></html>`;
    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conteudo.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Anima substituição do conteúdo com efeito de blur por caractere
  const animateReplaceHtml = (newHtml: string) => {
    const el = editorRef.current;
    if (!el) return;
    // Parse novo HTML em container temporário
    const container = document.createElement("div");
    container.innerHTML = newHtml;
    let index = 0;
    const baseDelayMs = 14; // atraso por caractere
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    while (walker.nextNode()) {
      const n = walker.currentNode as Text;
      if (n.nodeValue && n.nodeValue.trim().length > 0) textNodes.push(n);
    }
    for (const tn of textNodes) {
      const text = tn.nodeValue || "";
      const frag = document.createDocumentFragment();
      for (let i = 0; i < text.length; i++) {
        const span = document.createElement("span");
        span.className = "ai-reveal";
        span.style.animationDelay = `${Math.min(index * baseDelayMs, 4000)}ms`;
        span.textContent = text[i];
        frag.appendChild(span);
        index++;
      }
      tn.replaceWith(frag);
    }
    // Injeta DOM animado
    el.innerHTML = container.innerHTML;
    // Após animação, limpa spans para manter markup simples
    const totalDelay = Math.min(index * baseDelayMs + 700, 5000);
    window.setTimeout(() => {
      el.innerHTML = newHtml;
      setHtml(newHtml);
    }, totalDelay);
  };

  const transformContentByPrompt = (currentHtml: string, prompt: string): string => {
    // Implementação mínima local para demonstrar a edição com efeito
    const text = currentHtml.replace(/<[^>]*>/g, " ");
    if (/resum|resumo|resuma/i.test(prompt)) {
      const trimmed = text.trim().split(/\s+/).slice(0, 120).join(" ");
      return `<p>${trimmed}...</p>`;
    }
    if (/titulo|título/i.test(prompt)) {
      const firstSentence = text.split(/\.|\n/)[0] || "Título";
      return `<h1>${firstSentence}</h1>` + currentHtml;
    }
    // Sem transformação: apenas reaplica para exibir o efeito
    return currentHtml;
  };

  const handlePromptSend = () => {
    if (!promptText.trim()) return;
    const current = editorRef.current?.innerHTML || "";
    toast({ title: "Aplicando edição..." });
    // Streaming local demo (substituir por adapter real do backend)
    localDemoAdapter.streamEdit({ html: current, prompt: promptText }, (chunk) => {
      if (chunk.type === "html") animateReplaceHtml(chunk.content);
    });
    setPromptText("");
  };

  const chatKitOptions: ChatKitOptions = defaultChatKitOptions;

  return (
    <div className="p-4 md:p-6 space-y-4 overflow-x-hidden">
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        <ResizablePanel defaultSize={40} minSize={25} maxSize={55}>
          <Card className="h-full rounded-none border-0">
            <CardContent className="space-y-6 p-4 md:p-6">
              <div className="space-y-2">
                <Label>Fonte do tema</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {newsId ? (newsItems.find((n) => n.id === newsId)?.title || "Notícia selecionada") : "Selecionar notícia do feed"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[360px] max-w-[90vw] max-h-[360px] overflow-auto">
                        <DropdownMenuLabel>Últimas notícias</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {newsLoading && <div className="px-3 py-2 text-sm text-muted-foreground">Carregando...</div>}
                        {!newsLoading && newsItems.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum item recente</div>
                        )}
                        {!newsLoading && newsItems.map((n) => (
                          <DropdownMenuCheckboxItem
                            key={n.id}
                            checked={newsId === n.id}
                            onCheckedChange={() => setNewsId(n.id)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium line-clamp-1">{n.title}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1">{n.url}</span>
                            </div>
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    <Input placeholder="Ou cole a URL da notícia" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Se não escolher uma notícia, descreva o tema abaixo.</p>
              </div>

              <div className="space-y-2">
                <Label>Contexto/Tema</Label>
                <Textarea
                  placeholder="Descreva o tema do conteúdo (obrigatório se não houver notícia)"
                  rows={5}
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Input
                  placeholder="Ex: gerar leads para a landing X; roteiro para reels explicando Y; post de anúncio Z"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={(v) => { setCategory(v as Category); }}>
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
                <Switch checked={useKnowledge} onCheckedChange={setUseKnowledge} />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerate} disabled={!canGenerate || isGenerating} className="flex-1">
                  <Sparkles className="mr-2 h-4 w-4" /> Gerar agora
                </Button>
                <Button variant="outline" onClick={() => navigate("/library")}>Ver biblioteca</Button>
              </div>
            </CardContent>
          </Card>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60} minSize={45} maxSize={75}>
          <Card className="h-full rounded-none border-0">
            <CardContent className="p-4 md:p-6">
              {isGenerating ? (
                <div className="py-16"><LoadingScreen /></div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border overflow-hidden">
                    <div className="flex items-center gap-1 border-b bg-muted/30 px-2 py-2">
                      <Button variant="ghost" size="icon" onClick={() => exec("bold")}><Bold className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => exec("italic")}><Italic className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => exec("underline")}><Underline className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => exec("strikeThrough")}><Strikethrough className="h-4 w-4"/></Button>
                      <Separator orientation="vertical" className="mx-1 h-5"/>
                      <Button variant="ghost" size="icon" onClick={applyLink}><LinkIcon className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => exec("insertUnorderedList")}><List className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => exec("insertOrderedList")}><ListOrdered className="h-4 w-4"/></Button>
                      <Separator orientation="vertical" className="mx-1 h-5"/>
                      <Button variant="ghost" size="icon" onClick={() => exec("formatBlock", "h1")}><Heading1 className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => exec("formatBlock", "h2")}><Heading2 className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => exec("formatBlock", "blockquote")}><Quote className="h-4 w-4"/></Button>
                      {/* Removido botão de bloco de código por enquanto */}
                      <Separator orientation="vertical" className="mx-1 h-5"/>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><Palette className="h-4 w-4"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <div className="px-2 py-1.5">
                            <div className="text-xs text-muted-foreground mb-1">Cor personalizada (HEX)</div>
                            <div className="flex items-center gap-2">
                              <Input value={customColor} onChange={(e) => setCustomColor(e.target.value)} placeholder="#000000" className="h-8" />
                              <Button size="sm" variant="outline" onClick={() => { const v = customColor.trim(); if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) exec("foreColor", v); }}>
                                OK
                              </Button>
                            </div>
                          </div>
                          <DropdownMenuSeparator />
                          {(["#111827", "#1f2937", "#dc2626", "#16a34a", "#2563eb", "#6b21a8", "#ca8a04"]).map((c) => (
                            <DropdownMenuCheckboxItem key={c} checked={false} onCheckedChange={() => exec("foreColor", c)}>
                              <span className="inline-block h-3 w-3 rounded-full mr-2" style={{ backgroundColor: c }} /> {c}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div
                      ref={editorRef}
                      className="min-h-[300px] md:min-h-[420px] w-full p-2 md:p-3 focus:outline-none prose prose-stone max-w-full text-[15px]"
                      contentEditable
                      suppressContentEditableWarning
                      data-placeholder="Edite aqui. Você também pode gerar conteúdo à esquerda e ajustar neste editor."
                      onInput={(e) => { setHtml((e.target as HTMLDivElement).innerHTML); saveSelection(); }}
                      onMouseUp={saveSelection}
                      onKeyUp={saveSelection}
                    />

                    <div className="flex items-center justify-between border-t px-2 py-2 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => exec("undo")}><Undo2 className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => exec("redo")}><Redo2 className="h-4 w-4"/></Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={copyToClipboard}><Scissors className="h-4 w-4 mr-2"/>Copiar</Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost"><Download className="h-4 w-4 mr-2"/>Baixar</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Formatos</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked={false} onCheckedChange={downloadTxt}>TXT</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={false} onCheckedChange={downloadDoc}>DOC</DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  <AIChatKit options={chatKitOptions} onSendFallback={(t) => { setPromptText(t); handlePromptSend(); }} />
                </div>
              )}
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}


