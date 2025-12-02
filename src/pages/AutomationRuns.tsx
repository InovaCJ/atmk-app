import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, CheckCircle2, History, Loader2, RefreshCw, XCircle, Eye } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClientContext } from "@/contexts/ClientContext";
import { useAutomationRuns } from "@/hooks/useAutomationRuns";
import { RunDetailsSheet } from "@/components/RunDetailsSheet";
import { AutomationRun } from "@/types/automation";

export default function AutomationRuns() {
  const navigate = useNavigate();
  const { selectedClientId } = useClientContext();
  const { runs, loading, refresh } = useAutomationRuns(selectedClientId, 100);

  const [searchParams, setSearchParams] = useSearchParams();
  const runId = searchParams.get("runId");
  const isSheetOpen = !!runId;

  const handleViewDetails = (runId: string) => {
    console.log("Viewing details for runaa:", runId);
    setSearchParams({ runId });
  };

  const handleCloseSheet = () => {
    setSearchParams({});
  };

  if (!selectedClientId) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold">Selecione um cliente</h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/automations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <History className="h-6 w-6 text-muted-foreground" />
              Histórico de Execuções
            </h1>
            <p className="text-muted-foreground">Log completo de atividades das automações</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refresh()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execuções Recentes</CardTitle>
          <CardDescription>Mostrando as últimas 100 execuções</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && runs.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : runs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma execução encontrada.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Automação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead className="text-right">Duração</TableHead>
                    <TableHead className="text-right">Itens</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((run) => {
                    const startDate = new Date(run.started_at);
                    const endDate = run.finished_at ? new Date(run.finished_at) : null;
                    const duration = endDate
                      ? Math.round((endDate.getTime() - startDate.getTime()) / 1000)
                      : null;

                    return (
                      <TableRow key={run.id}>
                        <TableCell>
                          <div className="font-medium">{run.automation?.name || "Desconhecida"}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {run.automation?.category || "-"}
                          </div>
                          {run.error_message && (
                            <div className="text-xs text-red-600 mt-1 max-w-[300px] truncate" title={run.error_message}>
                              Erro: {run.error_message}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {run.status === 'success' && (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Sucesso
                            </Badge>
                          )}
                          {run.status === 'failed' && (
                            <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" /> Falha
                            </Badge>
                          )}
                          {run.status === 'running' && (
                            <Badge variant="secondary" className="animate-pulse">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Executando
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">{format(startDate, "dd/MM/yyyy HH:mm")}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarClock className="h-3 w-3" />
                              {formatDistanceToNow(startDate, { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {endDate ? format(endDate, "HH:mm:ss") : "-"}
                        </TableCell>
                        <TableCell className="text-right text-sm font-mono">
                          {duration ? `${duration}s` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {run.items_generated !== null ? (
                            <Badge variant="outline">{run.items_generated}</Badge>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(run.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <RunDetailsSheet
        runId={runId}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
      />
    </div>
  );
}