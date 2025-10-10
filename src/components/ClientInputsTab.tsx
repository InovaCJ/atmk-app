import React, { useState } from 'react';
import { Plus, FileText, Upload, Link, MoreHorizontal, Play, Trash2, Edit } from 'lucide-react';
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
import { useClientInputs } from '@/hooks/useClientInputs';
import { useClientContext } from '@/contexts/ClientContext';
import { ClientInput } from '@/types/clients';
import { CreateInputModal } from './CreateInputModal';
import { toast } from 'sonner';

interface ClientInputsTabProps {
  clientId: string;
}

export function ClientInputsTab({ clientId }: ClientInputsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'text' | 'file' | 'url' | 'structured' | null>(null);
  
  const { inputs, loading, error, deleteInput, ingestInput } = useClientInputs(clientId);
  const { canEditClient } = useClientContext();

  const filteredInputs = inputs.filter(input =>
    input.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    input.content_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInputIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'file':
        return <Upload className="h-4 w-4" />;
      case 'url':
        return <Link className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getInputTypeLabel = (type: string) => {
    switch (type) {
      case 'text':
        return 'Texto';
      case 'file':
        return 'Arquivo';
      case 'url':
        return 'URL';
      case 'structured':
        return 'Estruturado';
      default:
        return type;
    }
  };

  const getStatusBadge = (metadata: any) => {
    const status = metadata?.status;
    if (!status) return <Badge variant="outline">Pendente</Badge>;
    
    switch (status) {
      case 'processing':
        return <Badge variant="secondary">Processando</Badge>;
      case 'indexed':
        return <Badge variant="default">Indexado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const handleDeleteInput = async (input: ClientInput) => {
    if (!confirm(`Tem certeza que deseja excluir este input?`)) {
      return;
    }

    try {
      await deleteInput(input.id);
      toast.success('Input excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir input');
      console.error('Error deleting input:', error);
    }
  };

  const handleIngestInput = async (input: ClientInput) => {
    try {
      await ingestInput(input.id);
      toast.success('Ingestão iniciada');
    } catch (error) {
      toast.error('Erro ao iniciar ingestão');
      console.error('Error ingesting input:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando inputs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar inputs</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Inputs</h2>
          <p className="text-muted-foreground">
            Gerencie textos, arquivos e URLs para sua base de conhecimento
          </p>
        </div>
        {canEditClient(clientId) && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                setSelectedType('text');
                setShowCreateModal(true);
              }}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Adicionar Texto
            </Button>
            <Button
              onClick={() => {
                setSelectedType('file');
                setShowCreateModal(true);
              }}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Arquivo
            </Button>
            <Button
              onClick={() => {
                setSelectedType('url');
                setShowCreateModal(true);
              }}
              variant="outline"
            >
              <Link className="h-4 w-4 mr-2" />
              Adicionar URL
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar inputs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Inputs List */}
      {filteredInputs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'Nenhum input encontrado' : 'Nenhum input cadastrado'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Comece adicionando seu primeiro input'
            }
          </p>
          {!searchTerm && canEditClient(clientId) && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Input
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInputs.map((input) => (
            <Card key={input.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getInputIcon(input.type)}
                      {input.title || 'Sem título'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{getInputTypeLabel(input.type)}</Badge>
                      {getStatusBadge(input.metadata)}
                      <span className="text-xs">
                        Criado em {new Date(input.created_at).toLocaleDateString('pt-BR')}
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
                        <DropdownMenuItem
                          onClick={() => handleIngestInput(input)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Ingerir
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteInput(input)}
                          className="text-destructive"
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
                  {input.content_text && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {input.content_text}
                    </p>
                  )}
                  {input.url && (
                    <p className="text-sm text-blue-600 hover:underline">
                      <Link className="h-3 w-3 inline mr-1" />
                      {input.url}
                    </p>
                  )}
                  {input.file_ref && (
                    <p className="text-sm text-muted-foreground">
                      <Upload className="h-3 w-3 inline mr-1" />
                      Arquivo: {input.file_ref}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Input Modal */}
      <CreateInputModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedType(null);
        }}
        clientId={clientId}
        type={selectedType}
      />
    </div>
  );
}
