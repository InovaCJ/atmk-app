import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';
import { 
  TrendingUp, 
  Sheet, 
  Download, 
  RefreshCw, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export const GoogleTrendsIntegration = () => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { companies } = useCompanies();

  const selectedCompany = companies[0]; // For now, use first company

  const handleSyncTrends = async () => {
    if (!sheetUrl) {
      toast({
        title: "URL obrigatória",
        description: "Por favor, insira a URL do Google Sheets.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCompany) {
      toast({
        title: "Empresa necessária",
        description: "Você precisa ter pelo menos uma empresa cadastrada.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('sync-google-trends', {
        body: {
          sheetUrl: sheetUrl.trim(),
          companyId: selectedCompany.id
        }
      });

      if (error) {
        throw error;
      }

      setLastSync(new Date().toLocaleString('pt-BR'));
      toast({
        title: "Sincronização concluída!",
        description: data.message || "Dados do Google Trends importados com sucesso.",
      });
    } catch (error: any) {
      console.error('Error syncing trends:', error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Erro ao importar dados do Google Trends.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const googleAppsScript = `/**
 * Google Apps Script para coletar dados do Google Trends
 * Cole este código no Google Apps Script (script.google.com)
 */

function collectTrendsData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Limpar dados antigos
  sheet.clear();
  
  // Cabeçalhos
  const headers = [
    'Keyword',
    'Search Volume',
    'Trend Score',
    'Region',
    'Timeframe',
    'Related Keywords',
    'Opportunity Score'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Dados de exemplo - substitua pela sua lógica de coleta
  const trendsData = [
    ['marketing digital', 85000, 92.5, 'BR', '7d', 'seo;sem;marketing online', 88.0],
    ['inteligência artificial', 125000, 95.8, 'BR', '7d', 'ia;machine learning;chatbot', 94.2],
    ['automação marketing', 45000, 78.3, 'BR', '7d', 'email marketing;crm;leads', 82.1],
    ['conteúdo viral', 32000, 85.7, 'BR', '7d', 'viral marketing;redes sociais;engajamento', 79.5],
    ['tendências 2024', 67000, 88.9, 'BR', '7d', 'previsões;futuro;inovação', 86.3]
  ];
  
  // Inserir dados
  if (trendsData.length > 0) {
    sheet.getRange(2, 1, trendsData.length, headers.length).setValues(trendsData);
  }
  
  // Formatar planilha
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#4285f4')
    .setFontColor('white')
    .setFontWeight('bold');
    
  sheet.autoResizeColumns(1, headers.length);
  
  Logger.log('Dados do Google Trends coletados com sucesso!');
}

// Configurar trigger para executar automaticamente
function createTrigger() {
  ScriptApp.newTrigger('collectTrendsData')
    .timeBased()
    .everyHours(6) // Executa a cada 6 horas
    .create();
}`;

  const downloadScript = () => {
    const blob = new Blob([googleAppsScript], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'google-trends-script.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Integração Google Trends</h2>
          <p className="text-muted-foreground">
            Conecte dados de tendências para alimentar sua estratégia de conteúdo
          </p>
        </div>
      </div>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Status da Integração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {lastSync ? 'Conectado' : 'Não configurado'}
              </p>
              <p className="text-sm text-muted-foreground">
                {lastSync 
                  ? `Última sincronização: ${lastSync}`
                  : 'Configure o Google Sheets para começar'
                }
              </p>
            </div>
            <Badge variant={lastSync ? "default" : "secondary"}>
              {lastSync ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sheet className="h-5 w-5" />
            Configurar Google Sheets
          </CardTitle>
          <CardDescription>
            Conecte uma planilha do Google Sheets com dados do Google Trends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheetUrl">URL do Google Sheets</Label>
            <Input
              id="sheetUrl"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              A planilha deve estar pública (compartilhada com "qualquer pessoa com o link")
            </p>
          </div>

          <Button 
            onClick={handleSyncTrends}
            disabled={isLoading || !sheetUrl}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Sincronizar Dados
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Script do Google Apps Script */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Google Apps Script
          </CardTitle>
          <CardDescription>
            Use este script para automatizar a coleta de dados do Google Trends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Script de Coleta Automática</h4>
              <Button variant="outline" size="sm" onClick={downloadScript}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Script
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              1. Crie uma nova planilha no Google Sheets<br/>
              2. Vá em Extensões → Apps Script<br/>
              3. Cole o código baixado<br/>
              4. Execute a função collectTrendsData()<br/>
              5. Torne a planilha pública e copie a URL acima
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Formato dos Dados Esperado</h4>
            <div className="text-sm bg-muted/30 p-3 rounded font-mono">
              <div className="grid grid-cols-4 gap-2 text-xs">
                <span className="font-bold">Keyword</span>
                <span className="font-bold">Search Volume</span>
                <span className="font-bold">Trend Score</span>
                <span className="font-bold">Region</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs mt-1 text-muted-foreground">
                <span>marketing digital</span>
                <span>85000</span>
                <span>92.5</span>
                <span>BR</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links Úteis */}
      <Card>
        <CardHeader>
          <CardTitle>Links Úteis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" asChild className="justify-start w-full">
            <a href="https://script.google.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Google Apps Script
            </a>
          </Button>
          <Button variant="outline" asChild className="justify-start w-full">
            <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Google Sheets
            </a>
          </Button>
          <Button variant="outline" asChild className="justify-start w-full">
            <a href="https://lookerstudio.google.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Looker Studio
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};