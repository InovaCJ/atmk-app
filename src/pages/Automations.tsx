import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Play, Plus, Sparkles, Workflow } from "lucide-react";

interface AutomationItem {
  id: string;
  name: string;
  trigger: "news_sources" | "web_search";
  objective: string;
  category: "post" | "carousel" | "scriptShort" | "scriptYoutube" | "blog" | "email";
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  status: "draft" | "active" | "paused";
  runs: number;
  lastRun?: string;
  neverEnds?: boolean;
  endAfterRuns?: number | null;
}

export default function Automations() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  // Mock inicial para dar contexto a novos usuários
  const initialAutomations: AutomationItem[] = useMemo(() => [
    {
      id: "example-weekly-carousel",
      name: "Carrossel semanal de tendências",
      trigger: "web_search",
      objective: "Gerar carrossel com 5 slides sobre temas em alta",
      category: "carousel",
      frequency: "weekly",
      status: "active",
      runs: 3,
      lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ], []);

  const [items, setItems] = useState<AutomationItem[]>(initialAutomations);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("atmk_automations");
      if (raw) {
        const list = JSON.parse(raw) as AutomationItem[];
        setItems((prev) => {
          // mescla exemplo com itens do storage sem duplicar por id
          const map = new Map<string, AutomationItem>(prev.map((i) => [i.id, i]));
          for (const it of list) map.set(it.id, it);
          return Array.from(map.values());
        });
      }
    } catch {}
  }, []);

  const filtered = items.filter((a) => {
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return (
      a.name.toLowerCase().includes(t) ||
      a.objective.toLowerCase().includes(t)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automações</h1>
          <p className="text-muted-foreground">Crie fluxos para gerar conteúdos automaticamente</p>
        </div>
        <Button onClick={() => navigate("/automations/new")}> 
          <Plus className="h-4 w-4 mr-2" />
          Nova Automação
        </Button>
      </div>

      <div className="relative">
        <Input placeholder="Buscar automações..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <Card key={a.id} className="group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{a.name}</CardTitle>
                </div>
                {a.status === "active" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 animate-pulse">Ativa</span>
                ) : (
                  <Badge variant={a.status === "paused" ? "secondary" : "outline"}>
                    {a.status === "paused" ? "Pausada" : "Rascunho"}
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">{a.objective}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Categoria: <strong className="text-foreground ml-1">{a.category}</strong></span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Frequência: {a.frequency === "weekly" ? "Semanal" : a.frequency === "daily" ? "Diária" : a.frequency === "biweekly" ? "Quinzenal" : "Mensal"}</span>
                </div>
                {a.lastRun && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Última execução: {new Date(a.lastRun).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(`/automations/${a.id}`)}>Editar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma automação encontrada</CardTitle>
            <CardDescription>Crie sua primeira automação para começar a gerar conteúdos automaticamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/automations/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Criar automação
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


