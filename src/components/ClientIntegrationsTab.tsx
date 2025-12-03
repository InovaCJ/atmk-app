import React, { useState } from 'react';
import { Plus, Search, Key, MoreHorizontal, Trash2, Edit, ExternalLink, Settings, Clock, DollarSign, CheckCircle, XCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useClientContext } from '@/contexts/ClientContext';
import { useSearchIntegrations } from '@/hooks/useSearchIntegrations';
import { toast } from 'sonner';

interface ClientIntegrationsTabProps {
  clientId: string;
}

interface SearchTerm {
  id: string;
  term: string;
  enabled: boolean;
}

interface SearchFrequency {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
}

interface ExternalService {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  apiKey?: string;
  dailyQuota: number;
  usageToday: number;
  createdAt: string;
}

export function ClientIntegrationsTab({ clientId }: ClientIntegrationsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isConfigServiceModalOpen, setIsConfigServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { canEditClient } = useClientContext();
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const {
    integrations,
    searchTerms,
    searchFrequencies,
    setSearchTerms,
    setSearchFrequencies,
    loading,
    addIntegration,
    updateIntegration,
    deleteIntegration,
    updateSearchTerms,
    updateSearchFrequencies
  } = useSearchIntegrations(clientId);

  // Converter integrações para o formato esperado pelo componente
  const externalServices: ExternalService[] = integrations.map(integration => ({
    id: integration.id,
    name: `${integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)} Search API`,
    provider: integration.provider,
    enabled: integration.enabled,
    dailyQuota: integration.daily_quota,
    usageToday: 0, // TODO: Implementar tracking de uso
    createdAt: integration.created_at
  }));

  const [newService, setNewService] = useState({
    name: '',
    provider: '',
    apiKey: '',
    dailyQuota: 100
  });

  const [serviceConfig, setServiceConfig] = useState({
    apiKey: '',
    searchPhrases: [''],
    frequency: 'monthly',
    enabled: true
  });

  // Mock do plano do cliente (deveria vir do contexto)
  const getClientPlan = (): 'free' | 'pro' | 'business' => 'pro';
  const clientPlan = getClientPlan();

  const getPlanLimits = () => {
    switch (clientPlan) {
      case 'free':
        return {
          maxSearchTerms: 2,
          allowedFrequencies: ['monthly'],
          dailySearches: 0,
          weeklySearches: 0,
          monthlySearches: 1
        };
      case 'pro':
        return {
          maxSearchTerms: 5,
          allowedFrequencies: ['daily', 'weekly', 'monthly'],
          dailySearches: 1,
          weeklySearches: 1,
          monthlySearches: 1
        };
      case 'business':
        return {
          maxSearchTerms: 10,
          allowedFrequencies: ['daily', 'weekly', 'monthly'],
          dailySearches: 5,
          weeklySearches: 5,
          monthlySearches: 5
        };
      default:
        return {
          maxSearchTerms: 2,
          allowedFrequencies: ['monthly'],
          dailySearches: 0,
          weeklySearches: 0,
          monthlySearches: 1
        };
    }
  };

  const planLimits = getPlanLimits();

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'serpapi':
        return 'SerpAPI';
      case 'tavily':
        return 'Tavily';
      case 'apify':
        return 'Apify';
      case 'perplexity':
        return 'Perplexity';
      case 'bing':
        return 'Bing Search';
      case 'custom':
        return 'Custom';
      default:
        return provider;
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'serpapi':
        return 'default';
      case 'tavily':
        return 'secondary';
      case 'apify':
        return 'outline';
      case 'perplexity':
        return 'outline';
      case 'bing':
        return 'outline';
      case 'custom':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Diariamente';
      case 'weekly':
        return 'Semanalmente';
      case 'monthly':
        return 'Mensalmente';
      default:
        return frequency;
    }
  };

  // Função removida - não há mais cobrança por frequência

  const handleAddService = async () => {
    setIsSaving(true);
    try {
      // Mapear provider para enum suportado pelo backend
      const allowedProviders = ['serpapi', 'tavily', 'bing', 'custom'];
      const provider = allowedProviders.includes(newService.provider)
        ? (newService.provider as 'serpapi' | 'tavily' | 'bing' | 'custom')
        : 'custom';

      await addIntegration({
        provider,
        api_key_ref: newService.apiKey,
        daily_quota: newService.dailyQuota,
        enabled: true,
      });
      toast.success('Serviço externo adicionado com sucesso!');

      // Reset form
      setNewService({
        name: '',
        provider: '',
        apiKey: '',
        dailyQuota: 100
      });
      setIsAddServiceModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
      toast.error('Erro ao adicionar serviço. Verifique o provedor selecionado.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSearchTerm = async (id: string, term: string) => {
    const updatedTerms = searchTerms.map(st =>
      st.id === id ? { ...st, term, enabled: term.trim() !== '' } : st
    );
    setSearchTerms(updatedTerms);
  };

  const handleToggleFrequency = async (id: string) => {
    const updatedFrequencies = searchFrequencies.map(sf => {
      if (sf.id === id) {
        // Se estiver desabilitando, apenas desabilita
        if (sf.enabled) {
          return { ...sf, enabled: false };
        } else {
          // Se estiver habilitando, desabilita todas as outras e habilita esta
          return { ...sf, enabled: true };
        }
      } else {
        // Desabilita todas as outras quando uma é habilitada
        return { ...sf, enabled: false };
      }
    });
    setSearchFrequencies(updatedFrequencies);
  };

  const handleRemoveService = async (serviceId: string) => {
    try {
      await deleteIntegration(serviceId);
      toast.success('Serviço removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
      toast.error('Erro ao remover serviço. Tente novamente.');
    }
  };

  const handleEditService = (serviceId: string) => {
    const service = externalServices.find(s => s.id === serviceId);
    if (service) {
      setServiceConfig({
        apiKey: service.apiKey || '',
        searchPhrases: [''],
        frequency: 'monthly',
        enabled: service.enabled
      });
      setEditingServiceId(serviceId);
      setIsConfigServiceModalOpen(true);
    }
  };

  const handleSaveServiceConfig = async () => {
    if (!editingServiceId) return;

    setIsSaving(true);
    try {
      await updateIntegration(editingServiceId, {
        api_key_ref: serviceConfig.apiKey,
        enabled: serviceConfig.enabled
      });

      toast.success('Configurações salvas com sucesso!');

      // Reset form
      setServiceConfig({
        apiKey: '',
        searchPhrases: [''],
        frequency: 'monthly',
        enabled: true
      });
      setEditingServiceId(null);
      setIsConfigServiceModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelServiceConfig = () => {
    setServiceConfig({
      apiKey: '',
      searchPhrases: [''],
      frequency: 'monthly',
      enabled: true
    });
    setEditingServiceId(null);
    setIsConfigServiceModalOpen(false);
  };

  const handleAddSearchPhrase = () => {
    setServiceConfig(prev => ({
      ...prev,
      searchPhrases: [...prev.searchPhrases, '']
    }));
  };

  const handleRemoveSearchPhrase = (index: number) => {
    setServiceConfig(prev => ({
      ...prev,
      searchPhrases: prev.searchPhrases.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateSearchPhrase = (index: number, value: string) => {
    setServiceConfig(prev => ({
      ...prev,
      searchPhrases: prev.searchPhrases.map((phrase, i) => i === index ? value : phrase)
    }));
  };

  const filteredServices = externalServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enabledSearchTerms = searchTerms.filter(st => st.enabled && st.term.trim() !== '');
  const enabledFrequencies = searchFrequencies.filter(sf => sf.enabled);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Buscador de Temas</h2>
          <p className="text-muted-foreground">
            Configure termos de busca para monitoramento automático de temas
          </p>
        </div>
      </div>

      {/* Plano e Limites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant={clientPlan === 'pro' ? 'default' : 'secondary'}>
              {clientPlan.toUpperCase()}
            </Badge>
            Limites do Plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Termos de Busca</p>
              <p className="text-lg font-semibold">{enabledSearchTerms.length}/{planLimits.maxSearchTerms}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Busca Diária</p>
              <p className="text-lg font-semibold">{planLimits.dailySearches}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Busca Semanal</p>
              <p className="text-lg font-semibold">{planLimits.weeklySearches}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Busca Mensal</p>
              <p className="text-lg font-semibold">{planLimits.monthlySearches}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuração do Buscador Próprio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscador Próprio (PRO)
          </CardTitle>
          <CardDescription>
            Configure termos de busca e frequência para automação do sistema de busca de notícias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Termos de Busca */}
          <div>
            <Label className="text-base font-medium">Termos de Busca ({enabledSearchTerms.length}/{planLimits.maxSearchTerms})</Label>
            <div className="space-y-2 mt-2">
              {searchTerms.slice(0, planLimits.maxSearchTerms).map((searchTerm, index) => (
                <div key={searchTerm.id} className="flex items-center gap-2">
                  <Input
                    value={searchTerm.term}
                    onChange={(e) => handleUpdateSearchTerm(searchTerm.id, e.target.value)}
                    placeholder={`Termo ${index + 1}...`}
                    disabled={!canEditClient(clientId)}
                  />
                  <Badge variant={searchTerm.enabled ? 'default' : 'secondary'}>
                    {searchTerm.enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Frequências de Busca */}
          <div>
            <Label className="text-base font-medium">Frequência de Buscas</Label>
            <div className="space-y-3 mt-2">
              {searchFrequencies.map((frequency) => (
                <div key={frequency.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{getFrequencyLabel(frequency.frequency)}</p>
                      <p className="text-sm text-muted-foreground">
                        {frequency.frequency === 'daily'
                          ? 'Busca automática diária em toda internet'
                          : frequency.frequency === 'weekly'
                            ? 'Busca automática semanal em toda internet'
                            : 'Busca automática mensal em toda internet'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-blue-600">
                        {frequency.frequency === 'daily'
                          ? '30x por mês'
                          : frequency.frequency === 'weekly'
                            ? '4x por mês'
                            : '1x por mês'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">busca automática</p>
                    </div>
                    <Button
                      variant={frequency.enabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleFrequency(frequency.id)}
                      disabled={!canEditClient(clientId) || !planLimits.allowedFrequencies.includes(frequency.frequency)}
                    >
                      {frequency.enabled ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Inativo
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Frequência Selecionada:</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">
                    {enabledFrequencies.length > 0
                      ? getFrequencyLabel(enabledFrequencies[0].frequency)
                      : 'Nenhuma selecionada'
                    }
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {enabledFrequencies.length > 0
                      ? 'Busca automática configurada'
                      : 'Configure uma frequência de busca'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Botão de Salvar */}
            {canEditClient(clientId) && (
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={async () => {
                    try {
                      setIsSaving(true);
                      await updateSearchTerms(searchTerms);
                      await updateSearchFrequencies(searchFrequencies);
                      toast.success('Configurações de busca salvas com sucesso!');
                    } catch (error) {
                      console.error('Erro ao salvar:', error);
                      toast.error('Erro ao salvar configurações. Tente novamente.');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Termos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledSearchTerms.length}</div>
            <p className="text-xs text-muted-foreground">Termos configurados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Frequências Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {enabledFrequencies.length}
            </div>
            <p className="text-xs text-muted-foreground">Automações ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Frequência Ativa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {enabledFrequencies.length > 0
                ? getFrequencyLabel(enabledFrequencies[0].frequency)
                : 'Nenhuma'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {enabledFrequencies.length > 0
                ? 'Busca automática ativa'
                : 'Configure uma frequência'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

