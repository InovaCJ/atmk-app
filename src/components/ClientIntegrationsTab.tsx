import React, { useState } from 'react';
import { Plus, Search, Key, MoreHorizontal, Trash2, Edit, ExternalLink, Settings, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
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
  cost: number;
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

  // Estado para termos de busca (máximo 5)
  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([
    { id: '1', term: 'inteligência artificial', enabled: true },
    { id: '2', term: 'machine learning', enabled: true },
    { id: '3', term: '', enabled: false },
    { id: '4', term: '', enabled: false },
    { id: '5', term: '', enabled: false }
  ]);

  // Estado para frequências de busca
  const [searchFrequencies, setSearchFrequencies] = useState<SearchFrequency[]>([
    { id: '1', frequency: 'daily', enabled: true, cost: 1500 }, // R$ 50 x 30 dias
    { id: '2', frequency: 'weekly', enabled: false, cost: 100 }, // R$ 25 x 4 semanas
    { id: '3', frequency: 'monthly', enabled: false, cost: 10 }  // R$ 10 x 1 mês
  ]);

  // Estado para serviços externos
  const [externalServices, setExternalServices] = useState<ExternalService[]>([
    {
      id: '1',
      name: 'Google Search API',
      provider: 'serpapi',
      enabled: true,
      dailyQuota: 100,
      usageToday: 23,
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: '2',
      name: 'Tavily Search',
      provider: 'tavily',
      enabled: false,
      dailyQuota: 50,
      usageToday: 0,
      createdAt: '2024-01-12T10:00:00Z'
    },
    {
      id: '3',
      name: 'Apify',
      provider: 'apify',
      enabled: false,
      dailyQuota: 50,
      usageToday: 0,
      createdAt: '2024-01-12T10:00:00Z'
    }
  ]);

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

  const getFrequencyCost = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 1500; // R$ 50 x 30 dias = R$ 1.500/mês
      case 'weekly':
        return 100;  // R$ 25 x 4 semanas = R$ 100/mês
      case 'monthly':
        return 10;   // R$ 10 x 1 mês = R$ 10/mês
      default:
        return 0;
    }
  };

  const handleAddService = async () => {
    setIsSaving(true);
    try {
      const newServiceData: ExternalService = {
        id: Date.now().toString(),
        name: newService.name,
        provider: newService.provider,
        enabled: true,
        apiKey: newService.apiKey,
        dailyQuota: newService.dailyQuota,
        usageToday: 0,
        createdAt: new Date().toISOString()
      };

      setExternalServices(prev => [...prev, newServiceData]);
      console.log('✅ Serviço externo adicionado:', newServiceData);

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
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSearchTerm = (id: string, term: string) => {
    setSearchTerms(prev => prev.map(st => 
      st.id === id ? { ...st, term, enabled: term.trim() !== '' } : st
    ));
  };

  const handleToggleFrequency = (id: string) => {
    setSearchFrequencies(prev => prev.map(sf => 
      sf.id === id ? { ...sf, enabled: !sf.enabled } : sf
    ));
  };

  const handleRemoveService = (serviceId: string) => {
    setExternalServices(prev => prev.filter(service => service.id !== serviceId));
    console.log('🗑️ Serviço removido:', serviceId);
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
      setExternalServices(prev => prev.map(service => 
        service.id === editingServiceId 
          ? { 
              ...service, 
              apiKey: serviceConfig.apiKey,
              enabled: serviceConfig.enabled
            }
          : service
      ));

      console.log('✅ Configurações do serviço salvas:', editingServiceId);
      console.log('🔑 API Key:', serviceConfig.apiKey);
      console.log('🔍 Frases de busca:', serviceConfig.searchPhrases);
      console.log('⏰ Frequência:', serviceConfig.frequency);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação
      
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
  const totalCost = enabledFrequencies.reduce((sum, sf) => sum + sf.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Buscador de Temas</h2>
          <p className="text-muted-foreground">
            Configure termos de busca e integre serviços externos para monitoramento de temas
          </p>
        </div>
        <div className="flex gap-2">
          {canEditClient(clientId) && (
            <Button onClick={() => setIsAddServiceModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Integração
            </Button>
          )}
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
            Configure termos de busca e frequência para automação do sistema
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
                          ? 'Busca diária em toda internet (30x por mês)'
                          : frequency.frequency === 'weekly' 
                          ? 'Busca semanal em toda internet (4x por mês)'
                          : 'Busca mensal em toda internet (1x por mês)'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-green-600">R$ {frequency.cost}</p>
                      <p className="text-xs text-muted-foreground">por mês</p>
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
                <span className="font-medium">Custo Total Mensal:</span>
                <span className="text-lg font-bold text-green-600">R$ {totalCost}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serviços Externos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Serviços Externos
          </CardTitle>
          <CardDescription>
            Integre com SerpAPI, Tavily, Apify, Perplexity e outros buscadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Services List */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço configurado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Configure serviços externos para expandir suas capacidades de busca'
                }
              </p>
              {!searchTerm && canEditClient(clientId) && (
                <Button onClick={() => setIsAddServiceModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Configurar Primeiro Serviço
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          {service.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant={getProviderBadge(service.provider)}>
                            {getProviderLabel(service.provider)}
                          </Badge>
                          <Badge variant={service.enabled ? 'default' : 'secondary'}>
                            {service.enabled ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <span className="text-xs">
                            {service.usageToday}/{service.dailyQuota} usos hoje
                          </span>
                        </CardDescription>
                      </div>
                      {canEditClient(clientId) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditService(service.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver Documentação
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleRemoveService(service.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Cota diária:</span>
                        <span className="text-sm font-medium">{service.dailyQuota}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Uso hoje:</span>
                        <span className="text-sm font-medium">{service.usageToday}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ 
                            width: `${(service.usageToday / service.dailyQuota) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Serviços Externos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {externalServices.length}
            </div>
            <p className="text-xs text-muted-foreground">Integrações configuradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalCost}
            </div>
            <p className="text-xs text-muted-foreground">Estimativa mensal</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Adicionar Serviço */}
      <Dialog open={isAddServiceModalOpen} onOpenChange={setIsAddServiceModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Integração Externa</DialogTitle>
            <DialogDescription>
              Configure um novo serviço de busca externo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Nome do Serviço</Label>
              <Input
                id="service-name"
                value={newService.name}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: SerpAPI"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-provider">Provedor</Label>
              <Select value={newService.provider} onValueChange={(value) => setNewService(prev => ({ ...prev, provider: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o provedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serpapi">SerpAPI</SelectItem>
                  <SelectItem value="tavily">Tavily</SelectItem>
                  <SelectItem value="apify">Apify</SelectItem>
                  <SelectItem value="perplexity">Perplexity</SelectItem>
                  <SelectItem value="bing">Bing Search</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-apikey">API Key</Label>
              <Input
                id="service-apikey"
                value={newService.apiKey}
                onChange={(e) => setNewService(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Sua chave de API..."
                type="password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-quota">Cota Diária</Label>
              <Input
                id="service-quota"
                value={newService.dailyQuota}
                onChange={(e) => setNewService(prev => ({ ...prev, dailyQuota: parseInt(e.target.value) || 100 }))}
                type="number"
                placeholder="100"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddServiceModalOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleAddService} disabled={isSaving || !newService.name || !newService.provider || !newService.apiKey}>
              {isSaving ? 'Salvando...' : 'Adicionar Serviço'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações do Serviço */}
      <Dialog open={isConfigServiceModalOpen} onOpenChange={setIsConfigServiceModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Configurar Serviço de Busca</DialogTitle>
            <DialogDescription>
              Configure a chave da API, frases de busca e frequência para este serviço
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="config-api-key">Chave da API</Label>
              <Input
                id="config-api-key"
                value={serviceConfig.apiKey}
                onChange={(e) => setServiceConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Cole sua chave de API aqui..."
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                Sua chave será armazenada de forma segura e criptografada
              </p>
            </div>

            {/* Frases de Busca */}
            <div className="space-y-2">
              <Label>Frases de Busca</Label>
              <p className="text-sm text-muted-foreground">
                Configure as frases que serão utilizadas para buscar conteúdo
              </p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {serviceConfig.searchPhrases.map((phrase, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={phrase}
                      onChange={(e) => handleUpdateSearchPhrase(index, e.target.value)}
                      placeholder={`Frase de busca ${index + 1}...`}
                    />
                    {serviceConfig.searchPhrases.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSearchPhrase(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddSearchPhrase}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Frase de Busca
                </Button>
              </div>
            </div>

            {/* Frequência */}
            <div className="space-y-2">
              <Label htmlFor="config-frequency">Frequência de Busca</Label>
              <Select 
                value={serviceConfig.frequency} 
                onValueChange={(value) => setServiceConfig(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Com que frequência o sistema deve executar as buscas automaticamente
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={serviceConfig.enabled}
                  onChange={(e) => setServiceConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded"
                />
                Serviço Ativo
              </Label>
              <p className="text-xs text-muted-foreground">
                Quando ativo, o serviço executará buscas automaticamente conforme a frequência configurada
              </p>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={handleCancelServiceConfig} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveServiceConfig} disabled={isSaving || !serviceConfig.apiKey}>
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
