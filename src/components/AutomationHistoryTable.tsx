import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, CheckCircle2, XCircle, Loader2, CalendarClock, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAutomationRuns } from "@/hooks/useAutomationRuns";
import { Skeleton } from "@/components/ui/skeleton";
import { RunDetailsSheet } from "./RunDetailsSheet";

interface AutomationHistoryTableProps {
  clientId: string;
}

export function AutomationHistoryTable({ clientId }: AutomationHistoryTableProps) {
  const { runs, loading } = useAutomationRuns(clientId);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleViewDetails = (runId: string) => {
    setSelectedRunId(runId);
    setIsSheetOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Histórico de Execuções
          </CardTitle>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma execução registrada recentemente.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Automação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Executado</TableHead>
                  <TableHead className="text-right">Duração</TableHead>
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
                      <TableCell className="font-medium">
                        {run.automation?.name || "Desconhecida"}
                        <div className="text-xs text-muted-foreground capitalize">
                          {run.automation?.category}
                        </div>
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
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />
                          {formatDistanceToNow(startDate, { addSuffix: true, locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {duration ? `${duration}s` : '-'}
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
          )}
        </CardContent>
      </Card>

      <RunDetailsSheet 
        runId={selectedRunId} 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
      />
    </>
  );
}