import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, AlertCircle, Circle, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientContext } from '@/contexts/ClientContext';
import { useClients } from '@/hooks/useClients';
import { useClientStatus } from '@/hooks/useClientStatus';
import { ClientKnowledgeBaseTab } from '@/components/ClientKnowledgeBaseTab';
import { ClientNewsTab } from '@/components/ClientNewsTab';
import { ClientIntegrationsTab } from '@/components/ClientIntegrationsTab';
import { ClientMembersTab } from '@/components/ClientMembersTab';

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { clients, loading } = useClients();
  const { canEditClient, canViewClient, selectedClientId } = useClientContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const client = clients.find(c => c.id === clientId);
  const [editedClient, setEditedClient] = useState({
    name: client?.name || '',
    website: client?.website || '',
    description: client?.description || ''
  });
  const isSelected = selectedClientId === clientId;
  const { status: clientStatus, loading: statusLoading } = useClientStatus(clientId || '', isSelected);

  // Atualizar estado de edição quando o cliente mudar
  React.useEffect(() => {
    if (client) {
      setEditedClient({
        name: client.name || '',
        website: client.website || '',
        description: client.description || ''
      });
    }
  }, [client]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando cliente...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Cliente não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O cliente que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Clientes
          </Button>
        </div>
      </div>
    );
  }

  if (!canViewClient(client.id)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Acesso negado</h2>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para visualizar este cliente.
          </p>
          <Button onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Clientes
          </Button>
        </div>
      </div>
    );
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'default';
      case 'business':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getKnowledgeStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: 'Completo',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'pending':
        return {
          variant: 'secondary' as const,
          icon: AlertCircle,
          text: 'Pendente',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'empty':
        return {
          variant: 'outline' as const,
          icon: Circle,
          text: 'Vazio',
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: Circle,
          text: 'Desconhecido',
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
    }
  };

  const getSelectedBadge = () => {
    return {
      variant: 'default' as const,
      icon: CheckCircle,
      text: 'Selecionado',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    };
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancelar edição - restaurar valores originais
      setEditedClient({
        name: client?.name || '',
        website: client?.website || '',
        description: client?.description || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedClient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implementar lógica de salvamento das configurações
      console.log('Salvando configurações do cliente:', client?.id, editedClient);
      // Aqui será implementada a lógica para salvar no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação de delay
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clients')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <h1 className="text-2xl font-bold">{isEditing ? editedClient.name : client.name}</h1>
              <Badge variant={getPlanBadgeVariant(client.plan)}>
                {client.plan.toUpperCase()}
              </Badge>
              {clientStatus.isSelected && (() => {
                const selectedBadge = getSelectedBadge();
                const IconComponent = selectedBadge.icon;
                return (
                  <Badge className={selectedBadge.className}>
                    <IconComponent className="h-3 w-3 mr-1" />
                    {selectedBadge.text}
                  </Badge>
                );
              })()}
              {!statusLoading && (() => {
                const knowledgeBadge = getKnowledgeStatusBadge(clientStatus.knowledgeStatus);
                const IconComponent = knowledgeBadge.icon;
                return (
                  <Badge className={knowledgeBadge.className}>
                    <IconComponent className="h-3 w-3 mr-1" />
                    {knowledgeBadge.text}
                    {clientStatus.knowledgePercentage > 0 && (
                      <span className="ml-1">({clientStatus.knowledgePercentage}%)</span>
                    )}
                  </Badge>
                );
              })()}
            </div>
            <p className="text-muted-foreground">@{client.slug}</p>
            {!statusLoading && clientStatus.missingItems.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Faltam: {clientStatus.missingItems.join(', ')}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {canEditClient(client.id) && isEditing && (
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="knowledge">Base de Conhecimento</TabsTrigger>
          <TabsTrigger value="news">Fontes de Notícias</TabsTrigger>
          <TabsTrigger value="integrations">Buscador de Temas</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Status do Índice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statusLoading ? '...' : clientStatus.hasKnowledgeBase ? 'Ativo' : 'Inativo'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statusLoading ? 'Carregando...' : clientStatus.hasKnowledgeBase ? 'Base configurada' : 'Sem base de conhecimento'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Fontes Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statusLoading ? '...' : clientStatus.hasNewsSources ? 'Ativo' : 'Inativo'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statusLoading ? 'Carregando...' : clientStatus.hasNewsSources ? 'Fontes configuradas' : 'Sem fontes de notícias'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Completude</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statusLoading ? '...' : `${clientStatus.knowledgePercentage}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statusLoading ? 'Carregando...' : `Base de conhecimento ${getKnowledgeStatusBadge(clientStatus.knowledgeStatus).text.toLowerCase()}`}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informações do Cliente</CardTitle>
                  <CardDescription>
                    Detalhes básicos e configurações
                  </CardDescription>
                </div>
                {canEditClient(client.id) && (
                  <Button 
                    variant="outline"
                    onClick={handleEditToggle}
                    disabled={isSaving}
                    size="sm"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-name" className="text-sm font-medium text-muted-foreground">
                    Nome
                  </Label>
                  {isEditing ? (
                    <Input
                      id="client-name"
                      value={editedClient.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="mt-1"
                      placeholder="Nome da empresa"
                    />
                  ) : (
                    <p className="text-sm mt-1">{client.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="client-website" className="text-sm font-medium text-muted-foreground">
                    Site
                  </Label>
                  {isEditing ? (
                    <Input
                      id="client-website"
                      value={editedClient.website}
                      onChange={(e) => handleFieldChange('website', e.target.value)}
                      className="mt-1"
                      placeholder="https://exemplo.com"
                      type="url"
                    />
                  ) : (
                    <p className="text-sm mt-1">
                      {client.website ? (
                        <a 
                          href={client.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {client.website}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Não informado</span>
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Slug</label>
                  <p className="text-sm mt-1">@{client.slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status da Base</label>
                  <p className="text-sm mt-1">
                    {statusLoading ? 'Carregando...' : (
                      <>
                        {getKnowledgeStatusBadge(clientStatus.knowledgeStatus).text}
                        {clientStatus.knowledgePercentage > 0 && ` (${clientStatus.knowledgePercentage}%)`}
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                  <p className="text-sm mt-1">{new Date(client.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Última atualização</label>
                  <p className="text-sm mt-1">{new Date(client.updated_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="client-description" className="text-sm font-medium text-muted-foreground">
                  Descrição
                </Label>
                {isEditing ? (
                  <Input
                    id="client-description"
                    value={editedClient.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="mt-1"
                    placeholder="Descrição da empresa"
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {client.description || (
                      <span className="text-muted-foreground">Não informado</span>
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <ClientKnowledgeBaseTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="news">
          <ClientNewsTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="integrations">
          <ClientIntegrationsTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="members">
          <ClientMembersTab clientId={client.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
