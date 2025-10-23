import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Globe, Newspaper, Play, Save, Sparkles, StopCircle, Workflow } from "lucide-react";
import { useClientContext } from "@/contexts/ClientContext";
import { useNewsSources } from "@/hooks/useNewsSources";
import { useFeaturedTopics } from "@/hooks/useFeaturedTopics";

type TriggerType = "news_sources" | "web_search";
type Frequency = "daily" | "weekly" | "biweekly" | "monthly";
type Category = "post" | "carousel" | "scriptShort" | "scriptYoutube" | "blog" | "email";

export default function AutomationBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const runNow = new URLSearchParams(location.search).get("run") === "now";
  const { selectedClientId } = useClientContext();

  const { newsSources } = useNewsSources(selectedClientId || "");
  const { topics } = useFeaturedTopics(selectedClientId || "", 14, 12);

  const [name, setName] = useState("Nova automação");
  const [trigger, setTrigger] = useState<TriggerType>("news_sources");
  const [objective, setObjective] = useState("");
  const [category, setCategory] = useState<Category>("post");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [endAfterRuns, setEndAfterRuns] = useState<string>("12");
  const [neverEnds, setNeverEnds] = useState<boolean>(false);
  const [status, setStatus] = useState<"draft" | "active" | "paused">("draft");

  useEffect(() => {
    if (id === "new") {
      setStatus("draft");
    }
  }, [id]);

  useEffect(() => {
    if (runNow) {
      // Placeholder: apenas valida inputs por enquanto
      // Integração real virá na task específica
    }
  }, [runNow]);

  const canSave = useMemo(() => !!name.trim() && !!objective.trim() && !!selectedClientId, [name, objective, selectedClientId]);

  const persistAutomation = (payload: any) => {
    try {
      const key = "atmk_automations";
      const raw = localStorage.getItem(key);
      const current = raw ? JSON.parse(raw) : [];
      const idx = current.findIndex((a: any) => a.id === payload.id);
      if (idx >= 0) current[idx] = payload; else current.unshift(payload);
      localStorage.setItem(key, JSON.stringify(current));
    } catch {}
  };

  const handleSave = (newStatus?: "draft" | "active" | "paused") => {
    if (!canSave) return;
    const isNew = id === "new";
    const payload = {
      id: isNew ? `auto_${Date.now()}` : id,
      name,
      trigger,
      objective,
      category,
      frequency,
      neverEnds,
      endAfterRuns: neverEnds ? null : Number(endAfterRuns || 0) || 0,
      status: newStatus || status,
      runs: 0,
      lastRun: undefined,
    };
    persistAutomation(payload);
    navigate("/automations");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Construtor de Automação</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/automations")}>Voltar</Button>
          <Button disabled={!canSave} onClick={() => handleSave("draft")}>
            <Save className="h-4 w-4 mr-2" />Salvar rascunho
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lado esquerdo: inputs */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gatilho</CardTitle>
              <CardDescription>Defina como a automação encontra material para gerar conteúdo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de gatilho</Label>
                <Select value={trigger} onValueChange={(v) => setTrigger(v as TriggerType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news_sources"><Newspaper className="h-4 w-4 mr-2 inline" />Fontes de notícia cadastradas</SelectItem>
                    <SelectItem value="web_search"><Globe className="h-4 w-4 mr-2 inline" />Busca na web por temas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {trigger === "news_sources" ? (
                <div className="space-y-2">
                  <Label>Fontes disponíveis ({newsSources.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {newsSources.map((s) => (
                      <Badge key={s.id} variant="secondary">{s.title || s.url}</Badge>
                    ))}
                    {newsSources.length === 0 && (
                      <span className="text-sm text-muted-foreground">Cadastre fontes em Configurações</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Temas recentes</Label>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((t) => (
                      <Badge key={t.term} variant="secondary">{t.term}</Badge>
                    ))}
                    {topics.length === 0 && (
                      <span className="text-sm text-muted-foreground">Adicione termos em Configurações</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Objetivo</CardTitle>
              <CardDescription>Descreva a meta desta automação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label>Objetivo</Label>
              <Input placeholder="Ex: gerar leads com carrossel semanal" value={objective} onChange={(e) => setObjective(e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categoria e frequência</CardTitle>
              <CardDescription>Escolha o tipo de conteúdo e com que frequência gerar</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post social</SelectItem>
                    <SelectItem value="carousel">Carrossel</SelectItem>
                    <SelectItem value="scriptShort">Roteiro curto</SelectItem>
                    <SelectItem value="scriptYoutube">Roteiro YouTube</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diária</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="biweekly">Quinzenal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Encerramento</Label>
                <div className="flex items-center gap-2">
                  <input id="neverEnds" type="checkbox" checked={neverEnds} onChange={(e) => setNeverEnds(e.target.checked)} />
                  <Label htmlFor="neverEnds">Nunca encerrar</Label>
                </div>
                {!neverEnds && (
                  <>
                    <Input type="number" min={1} value={endAfterRuns} onChange={(e) => setEndAfterRuns(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Encerrar após N execuções</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lado direito: pré-visualização simples do fluxo */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo</CardTitle>
              <CardDescription>Visualização simplificada do workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Start</Badge>
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Gatilho</div>
                  <div className="flex items-center gap-2">
                    {trigger === "news_sources" ? <Newspaper className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    <span>{trigger === "news_sources" ? "Fontes de notícia" : "Busca por temas"}</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Objetivo</div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>{objective || "(não definido)"}</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Categoria</div>
                  <div className="flex items-center gap-2">
                    <Badge>{category}</Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Frequência</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {frequency === "daily" ? "Diária" : frequency === "weekly" ? "Semanal" : frequency === "biweekly" ? "Quinzenal" : "Mensal"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Controle de execução</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              {status === "active" ? (
                <Button variant="outline" onClick={() => { setStatus("paused"); handleSave("paused"); }}><StopCircle className="h-4 w-4 mr-2" />Pausar</Button>
              ) : (
                <Button onClick={() => { setStatus("active"); handleSave("active"); }}><Play className="h-4 w-4 mr-2" />Ativar</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


