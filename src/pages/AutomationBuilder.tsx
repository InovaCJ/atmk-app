import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Globe, Newspaper, Play, Save, Sparkles, StopCircle, Workflow, Loader2, Trash2, Copy, CheckSquare } from "lucide-react";
import { useClientContext } from "@/contexts/ClientContext";
import { useNewsSources } from "@/hooks/useNewsSources";
import { useFeaturedTopics } from "@/hooks/useFeaturedTopics";
import { useAutomations } from "@/hooks/useAutomations";
import { AutomationCategory, AutomationFrequency, AutomationTriggerType, AutomationStatus } from "@/types/automation";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useSearchIntegrations } from "@/hooks/useSearchIntegrations";

export default function AutomationBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedClientId } = useClientContext();

  const { newsSources } = useNewsSources(selectedClientId || "");
  const { searchTerms } = useSearchIntegrations(selectedClientId || "");

  const { getAutomation, createAutomation, updateAutomation, deleteAutomation } = useAutomations(selectedClientId);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState("Nova automação");
  const [trigger, setTrigger] = useState<AutomationTriggerType>("news_sources");
  const [objective, setObjective] = useState("");
  const [category, setCategory] = useState<AutomationCategory>("post");
  const [frequency, setFrequency] = useState<AutomationFrequency>("weekly");

  // Encerramento / Limites
  const [endAfterRuns, setEndAfterRuns] = useState<string>("12");
  const [neverEnds, setNeverEnds] = useState<boolean>(true);

  // Quantidade por execução
  const [generationsPerRun, setGenerationsPerRun] = useState<string>("1");

  const [status, setStatus] = useState<AutomationStatus>("draft");

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      if (id && id !== "new") {
        setIsLoading(true);
        const automation = await getAutomation(id);
        if (automation) {
          setName(automation.name);
          setTrigger(automation.trigger_type);
          setObjective(automation.objective || "");
          setCategory(automation.category);
          setFrequency(automation.frequency);
          setStatus(automation.status);

          if (automation.end_after_runs) {
            setEndAfterRuns(automation.end_after_runs.toString());
            setNeverEnds(false);
          } else {
            setNeverEnds(true);
          }

          if (automation.generations_per_run) {
            setGenerationsPerRun(automation.generations_per_run.toString());
          }
        } else {
          toast({ title: "Automação não encontrada", variant: "destructive" });
          navigate("/automations");
        }
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, selectedClientId]);

  const canSave = useMemo(() => !!name.trim() && !!objective.trim() && !!selectedClientId, [name, objective, selectedClientId]);

  const handleSave = async (newStatus?: AutomationStatus) => {
    if (!canSave) return;
    setIsSaving(true);

    const payload = {
      name,
      trigger_type: trigger,
      objective,
      category,
      frequency,
      status: newStatus || status,
      end_after_runs: neverEnds ? null : (parseInt(endAfterRuns) || null),
      generations_per_run: parseInt(generationsPerRun) || 1
    };

    try {
      if (id === "new") {
        await createAutomation(payload);
      } else if (id) {
        await updateAutomation(id, payload);
      }
      navigate("/automations");
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (id && id !== "new" && confirm("Tem certeza que deseja excluir esta automação?")) {
      await deleteAutomation(id);
      navigate("/automations");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">
            {id === "new" ? "Nova Automação" : "Editar Automação"}
          </h1>
        </div>
        <div className="flex gap-2">
          {id !== "new" && (
            <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate("/automations")}>Voltar</Button>
          <Button disabled={!canSave || isSaving} onClick={() => handleSave()}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lado esquerdo: inputs */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da automação</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Posts semanais sobre IA" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gatilho</CardTitle>
              <CardDescription>Defina como a automação encontra material para gerar conteúdo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de gatilho</Label>
                <Select value={trigger} onValueChange={(v) => setTrigger(v as AutomationTriggerType)}>
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
                      <Badge key={s.id} variant="secondary">{s.name || s.url}</Badge>
                    ))}
                    {newsSources.length === 0 && (
                      <span className="text-sm text-muted-foreground">Cadastre fontes em Configurações</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Termos de busca</Label>
                  <div className="flex flex-wrap gap-2">
                    {searchTerms.filter(t => t.term.trim() !== "").map((t) => (
                      <Badge key={t.term} variant="secondary">{t.term}</Badge>
                    ))}
                    {searchTerms.filter(t => t.term.trim() !== "").length === 0 && (
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
              <CardTitle>Categoria e Frequência</CardTitle>
              <CardDescription>Defina o que será gerado e quando</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Categoria de Conteúdo - Full Width */}
              <div className="space-y-2">
                <Label>Categoria de Conteúdo</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as AutomationCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post social</SelectItem>
                    <SelectItem value="carousel">Carrossel</SelectItem>
                    <SelectItem value="scriptShort">Roteiro curto (Reels/TikTok)</SelectItem>
                    <SelectItem value="scriptYoutube">Roteiro YouTube</SelectItem>
                    <SelectItem value="blog">Artigo de Blog</SelectItem>
                    <SelectItem value="email">E-mail Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grid: Frequência + Execução Contínua */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frequência */}
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as AutomationFrequency)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quinzenal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Execução Contínua */}
                <div className="space-y-2">
                  <Label>Execução</Label>
                  <div className="space-y-3 rounded-lg border p-3 bg-muted/10 h-[calc(100%-1.5rem)]">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="neverEnds" className="cursor-pointer text-sm font-normal">
                        Execução contínua
                      </Label>
                      <Switch
                        id="neverEnds"
                        checked={neverEnds}
                        onCheckedChange={setNeverEnds}
                      />
                    </div>
                    {!neverEnds && (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Encerrar após</span>
                        <Input
                          type="number"
                          min={1}
                          className="h-8 text-sm"
                          value={endAfterRuns}
                          onChange={(e) => setEndAfterRuns(e.target.value)}
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">exec.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Conteúdos por Execução - Full Width */}
              <div className="space-y-3 rounded-lg border p-4 bg-muted/5">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Conteúdos por execução</Label>
                  <Badge variant="outline" className="font-normal">Máx: 5</Badge>
                </div>
                <div className="flex items-start gap-4">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={generationsPerRun}
                    onChange={(e) => setGenerationsPerRun(e.target.value)}
                    className="max-w-[100px]"
                  />
                  <p className="text-sm text-muted-foreground flex-1">
                    Quantos itens serão gerados a cada vez que a automação rodar.
                  </p>
                </div>
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
                    <span className="line-clamp-1">{objective || "(não definido)"}</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Ação</div>
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    <span>
                      Gerar <strong>{generationsPerRun}</strong> {category === "scriptShort" ? "roteiro(s)" : category + "(s)"}
                    </span>
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
                  {!neverEnds && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <CheckSquare className="h-3 w-3" />
                      <span>Até {endAfterRuns} execuções</span>
                    </div>
                  )}
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
                <Button
                  variant="outline"
                  onClick={() => { setStatus("paused"); handleSave("paused"); }}
                  disabled={isSaving}
                  className="w-full"
                >
                  <StopCircle className="h-4 w-4 mr-2" />Pausar
                </Button>
              ) : (
                <Button
                  onClick={() => { setStatus("active"); handleSave("active"); }}
                  disabled={isSaving || !canSave}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {status === "paused" ? "Retomar" : "Ativar"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}