import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { AutomationRun } from "@/types/automation";

interface RunDetailsSheetProps {
  runId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface QueueItem {
  id: string;
  status: string;
  title?: string;
  url?: string;
  error_message?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
  generated_content_id?: string;
  generated_content?: {
    id: string;
    title: string;
  };
}

export function RunDetailsSheet({ runId, isOpen, onClose }: RunDetailsSheetProps) {
  const navigate = useNavigate();
  const [runData, setRunData] = useState<AutomationRun | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!runId) return;

    // Only show loading spinner on initial load, not on background refreshes
    if (!runData) setLoading(true);
    setError(null);

    try {
      // 1. Fetch Run Details
      const { data: run, error: runError } = await supabase
        .from('automation_runs')
        .select(`
          *,
          automation:automations (
            name,
            category
          )
        `)
        .eq('id', runId)
        .single();

      if (runError) throw runError;

      // @ts-expect-error - automation join type safety
      setRunData(run);

      // 2. Fetch Queue Items
      // Tentativa segura: se a tabela não existir, não quebra a UI
      try {
        // @ts-expect-error - Tabela pode não estar tipada ainda no frontend
        const { data: queue, error: queueError } = await supabase
          .from('automation_queue')
          .select(`
            *,
            generated_content:generated_content_id (
              id,
              title
            )
          `)
          .eq('automation_run_id', runId)
          .order('created_at', { ascending: true });

        if (queueError) {
          // Ignora erro 404/42P01 (tabela não existe) silenciosamente
          if (queueError.code !== '42P01' && queueError.code !== '404') {
            console.warn("Queue fetch error:", queueError);
          }
          setQueueItems([]);
        } else {
          setQueueItems(queue || []);
        }
      } catch (e) {
        // Fallback para evitar crash
        setQueueItems([]);
      }

    } catch (err: unknown) {
      console.error("Error fetching run details:", err);
      setError(err.message || "Erro ao carregar detalhes");
    } finally {
      setLoading(false);
    }
  }, [runId, runData]);

  // Initial fetch when opening
  useEffect(() => {
    if (isOpen && runId) {
      // Não limpamos runData imediatamente para evitar "flicker" se for o mesmo ID
      // mas como aqui o runId mudou ou o sheet abriu, limpamos para garantir estado limpo
      setRunData(null);
      setQueueItems([]);
      fetchDetails();
    }
  }, [isOpen, runId]);

  // Polling logic: fetch every 30s if running
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen && runData?.status === 'running') {
      interval = setInterval(() => {
        fetchDetails();
      }, 30000); // 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, runData?.status, fetchDetails]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Sucesso</Badge>;
      case 'failed':
      case 'error':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Falha</Badge>;
      case 'running':
      case 'processing':
        return <Badge variant="secondary" className="animate-pulse">Executando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[800px] sm:max-w-[100vw] sm:w-[1024px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="space-y-1">
              <SheetTitle className="flex items-center gap-2">
                Detalhes da Execução
                {runData && getStatusBadge(runData.status)}
              </SheetTitle>
              <SheetDescription>
                ID: {runId} • {runData ? `Iniciado em ${format(new Date(runData.started_at), "dd/MM/yyyy HH:mm")}` : 'Carregando...'}
              </SheetDescription>
            </div>
            {runData?.status === 'running' && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/20 px-2 py-1 rounded-md">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Atualizando a cada 30s
              </div>
            )}
          </div>
        </SheetHeader>

        {loading && !runData ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-500">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>{error}</p>
          </div>
        ) : runData ? (
          <Tabs defaultValue="queue" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="queue">
                Itens Processados ({queueItems.length})
              </TabsTrigger>
              <TabsTrigger value="config">Configuração</TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between items-center">
                    Fila de Processamento
                    <Button variant="ghost" size="sm" onClick={fetchDetails}>
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Atualizar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {queueItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Nenhum item registrado na fila ou dados ainda não disponíveis.
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item / Conteúdo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {queueItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                <div className="flex flex-col gap-1">
                                  {/* Mostrar Título do Conteúdo Gerado se existir */}
                                  {item.generated_content?.title ? (
                                    <span className="text-primary font-semibold">
                                      {item.generated_content.title}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground italic text-xs">
                                      {item.status === 'processing' ? 'Gerando...' : 'Sem conteúdo'}
                                    </span>
                                  )}

                                  {/* Mostrar Fonte Original */}
                                  <div className="text-xs text-muted-foreground flex flex-col">
                                    <span className="font-semibold">Fonte:</span>
                                    <span title={item.title || item.metadata?.title}>
                                      {item.title || item.metadata?.title || "Item sem título"}
                                    </span>
                                    {item.url && (
                                      <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate max-w-[200px] flex items-center gap-1 mt-0.5">
                                        {item.url} <ExternalLink className="h-2 w-2" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  {getStatusBadge(item.status)}
                                  <span className="text-[10px] text-muted-foreground">
                                    {format(new Date(item.created_at), "HH:mm:ss")}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right align-top">
                                {item.generated_content_id ? (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-7 text-xs"
                                    onClick={() => navigate(`/content/create?id=${item.generated_content_id}`)}
                                  >
                                    Abrir
                                  </Button>
                                ) : item.error_message ? (
                                  <span className="text-xs text-red-500 max-w-[120px] truncate block ml-auto" title={item.error_message}>
                                    {item.error_message}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {runData.automation?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Categoria</span>
                      <Badge variant="outline" className="capitalize">{runData.automation?.category}</Badge>
                    </div>

                    {runData.items_generated !== undefined && (
                      <div>
                        <span className="text-muted-foreground block mb-1">Itens Gerados</span>
                        <span className="font-medium">{runData.items_generated}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {runData.error_message && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <h4 className="text-sm font-semibold text-red-800 mb-1">Erro na Execução</h4>
                      <p className="text-xs text-red-700">{runData.error_message}</p>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p>Esta aba exibe a configuração da automação no momento da execução.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Dados da execução não encontrados.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}