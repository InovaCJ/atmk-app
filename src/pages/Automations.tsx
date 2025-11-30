import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Plus, Sparkles, Workflow, Loader2 } from "lucide-react";
import { useClientContext } from "@/contexts/ClientContext";
import { useAutomations } from "@/hooks/useAutomations";
import { AutomationHistoryTable } from "@/components/AutomationHistoryTable";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Automations() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { selectedClientId } = useClientContext();
  const { automations, loading } = useAutomations(selectedClientId);

  const filtered = automations.filter((a) => {
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return (
      a.name.toLowerCase().includes(t) ||
      (a.objective || "").toLowerCase().includes(t)
    );
  });

  if (!selectedClientId) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Workflow className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold">Selecione um cliente</h2>
          <p className="text-muted-foreground">
            Selecione um cliente no menu lateral para gerenciar suas automações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
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
        <Input placeholder="Buscar automações..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Automations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <Card key={a.id} className="group hover:border-primary/50 transition-colors flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Workflow className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base truncate max-w-[180px]" title={a.name}>{a.name}</CardTitle>
                    </div>
                    {a.status === "active" ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                        Ativa
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {a.status === "paused" ? "Pausada" : "Rascunho"}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 min-h-[40px]">{a.objective || "Sem objetivo definido"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>Categoria: <strong className="text-foreground ml-1">{a.category}</strong></span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <div className="flex flex-col">
                      <span className="text-xs opacity-70">Frequência</span>
                      <div className="flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        <span>
                          {a.frequency === "weekly" ? "Semanal" : 
                           a.frequency === "daily" ? "Diária" : 
                           a.frequency === "biweekly" ? "Quinzenal" : "Mensal"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col border-l pl-2">
                      <span className="text-xs opacity-70">Próxima execução</span>
                      <div className="flex items-center gap-1 font-medium text-primary">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {a.next_run_at 
                            ? formatDistanceToNow(new Date(a.next_run_at), { addSuffix: true, locale: ptBR })
                            : 'Agendando...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="w-full" onClick={() => navigate(`/automations/${a.id}`)}>
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!loading && filtered.length === 0 && (
            <Card>
              <CardHeader className="text-center py-12">
                <div className="mx-auto bg-muted/50 p-4 rounded-full w-fit mb-4">
                  <Workflow className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>Nenhuma automação encontrada</CardTitle>
                <CardDescription>Crie sua primeira automação para começar a gerar conteúdos automaticamente.</CardDescription>
                <div className="pt-4">
                  <Button onClick={() => navigate("/automations/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar automação
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* History Table Section */}
          <AutomationHistoryTable clientId={selectedClientId} />
        </div>
      )}
    </div>
  );
}