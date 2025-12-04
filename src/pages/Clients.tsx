import React, { useState } from 'react';
import { Plus, Building2, Calendar, MoreHorizontal, Copy, Trash2, CheckCircle, AlertCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useClientContext } from '@/contexts/ClientContext';
import { useClients } from '@/hooks/useClients';
import { useClientStatus } from '@/hooks/useClientStatus';
import { Client } from '@/types/clients';
import { CreateClientModal } from '@/components/CreateClientModal';
import { DuplicateClientModal } from '@/components/DuplicateClientModal';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Clients() {
  const { clients, loading, error, deleteClient, duplicateClient, refetch } = useClients();
  const { canManageClients, canManageClient, selectedClientId } = useClientContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${client.name}"?`)) {
      return;
    }

    try {
      await deleteClient(client.id);
      toast.success('Cliente excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir cliente');
      console.error('Error deleting client:', error);
    }
  };

  const handleDuplicateClient = (client: Client) => {
    setSelectedClient(client);
    setShowDuplicateModal(true);
  };

  const handleDuplicateSubmit = async (clientId: string, newName: string, newSlug: string): Promise<Client> => {
    const result = await duplicateClient(clientId, newName, newSlug);
    return result as unknown as Client;
  };

  const handleOpenClient = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  const handleCreateNewClient = () => {
    setShowCreateModal(true);
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    // Refresh the clients list to ensure new client appears
    refetch();
  };

  const getKnowledgeStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return {
          icon: CheckCircle,
          text: 'Completo',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'pending':
        return {
          icon: AlertCircle,
          text: 'Pendente',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'empty':
        return {
          icon: Circle,
          text: 'Vazio',
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
      default:
        return {
          icon: Circle,
          text: 'Desconhecido',
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
    }
  };

  const getSelectedBadge = () => {
    return {
      icon: CheckCircle,
      text: 'Selecionado',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    };
  };

  // Componente para o card do cliente
  const ClientCard = ({ client }: { client: Client }) => {
    const isSelected = selectedClientId === client.id;
    const { status: clientStatus, loading: statusLoading } = useClientStatus(client.id, isSelected);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{client.name}</CardTitle>
              <CardDescription>@{client.slug}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleDuplicateClient(client)}
                  disabled={!canManageClient(client.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteClient(client)}
                  disabled={!canManageClient(client.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
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

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Criado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
            </div>
            {client.description && (
              <p className="line-clamp-2">{client.description}</p>
            )}
            {!statusLoading && clientStatus.missingItems.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Faltam: {clientStatus.missingItems.slice(0, 2).join(', ')}
                {clientStatus.missingItems.length > 2 && '...'}
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleOpenClient(client)}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar clientes</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
      {/* Search and Create Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {canManageClients && (
          <Button onClick={handleCreateNewClient}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        )}
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? 'Tente ajustar os termos de busca'
              : 'Comece criando seu primeiro cliente'
            }
          </p>
          {!searchTerm && canManageClients && (
            <Button onClick={handleCreateNewClient}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Cliente
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateClientModal
        isOpen={showCreateModal}
        onClose={handleCreateModalClose}
      />

      <DuplicateClientModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        client={selectedClient}
        onDuplicate={handleDuplicateSubmit}
      />
      </div>
    </div>
  );
}
