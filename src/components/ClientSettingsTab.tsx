import React, { useState } from 'react';
import { Save, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientContext } from '@/contexts/ClientContext';
import { toast } from 'sonner';

interface ClientSettingsTabProps {
  clientId: string;
}

export function ClientSettingsTab({ clientId }: ClientSettingsTabProps) {
  const { canEditClient } = useClientContext();
  const [isSaving, setIsSaving] = useState(false);
  
  // Mock data - replace with actual data from hooks
  const [settings, setSettings] = useState({
    tone_of_voice: 'Claro e objetivo',
    style_guidelines: 'Evite jargões desnecessários, use linguagem acessível',
    prompt_directives: 'Sempre priorize a base de conhecimento do cliente',
    locale: 'pt-BR'
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO: Implement save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast.success('Configurações salvas com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!canEditClient(clientId)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Acesso negado</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para editar as configurações deste cliente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Configurações</h2>
          <p className="text-muted-foreground">
            Personalize as configurações de IA para este cliente
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {/* Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Configurações de IA
            </CardTitle>
            <CardDescription>
              Personalize como os agentes de IA devem se comportar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tone_of_voice">Tom de Voz</Label>
              <Textarea
                id="tone_of_voice"
                value={settings.tone_of_voice}
                onChange={(e) => setSettings(prev => ({ ...prev, tone_of_voice: e.target.value }))}
                placeholder="Ex: Claro, objetivo e profissional"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="style_guidelines">Diretrizes de Estilo</Label>
              <Textarea
                id="style_guidelines"
                value={settings.style_guidelines}
                onChange={(e) => setSettings(prev => ({ ...prev, style_guidelines: e.target.value }))}
                placeholder="Ex: Evite jargões desnecessários, use linguagem acessível"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt_directives">Instruções Gerais</Label>
              <Textarea
                id="prompt_directives"
                value={settings.prompt_directives}
                onChange={(e) => setSettings(prev => ({ ...prev, prompt_directives: e.target.value }))}
                placeholder="Instruções específicas para os agentes de IA"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locale">Idioma</Label>
              <Select 
                value={settings.locale} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, locale: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Políticas de Privacidade</CardTitle>
            <CardDescription>
              Configure como os dados são tratados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data_retention">Retenção de Dados</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="365">1 ano</SelectItem>
                  <SelectItem value="indefinite">Indefinido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_encryption">Criptografia</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Padrão</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="maximum">Máximo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_sharing">Compartilhamento de Dados</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a política" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum compartilhamento</SelectItem>
                  <SelectItem value="anonymized">Apenas dados anonimizados</SelectItem>
                  <SelectItem value="aggregated">Apenas dados agregados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam este cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
            <div>
              <h4 className="font-medium">Arquivar Cliente</h4>
              <p className="text-sm text-muted-foreground">
                O cliente será arquivado e não aparecerá nas listagens ativas
              </p>
            </div>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              Arquivar
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
            <div>
              <h4 className="font-medium">Excluir Cliente</h4>
              <p className="text-sm text-muted-foreground">
                Todos os dados serão permanentemente removidos
              </p>
            </div>
            <Button variant="destructive">
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
