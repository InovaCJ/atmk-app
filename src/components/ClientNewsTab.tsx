import React, { useState } from 'react';
import { Plus, Rss, Play, Pause, MoreHorizontal, Trash2, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useNewsSources } from '@/hooks/useNewsSources';
import { toast } from 'sonner';

interface ClientNewsTabProps {
  clientId: string;
}

interface NewsSource {
  id: string;
  name: string;
  type: string;
  url: string;
  schedule: string;
  enabled: boolean;
  last_run: string;
  created_at: string;
  description?: string;
}

export function ClientNewsTab({ clientId }: ClientNewsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    description: ''
  });
  const { canEditClient } = useClientContext();
  const { newsSources, loading, addNewsSource, updateNewsSource, deleteNewsSource, triggerIngestion } = useNewsSources(clientId);

  const filteredSources = newsSources.filter(source =>
    source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rss':
        return 'RSS';
      case 'api':
        return 'API';
      case 'scraper':
        return 'Scraper';
      default:
        return type;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'rss':
        return 'default';
      case 'api':
        return 'secondary';
      case 'scraper':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleAddSource = async () => {
    setIsSaving(true);
    try {
      await addNewsSource({
        name: newSource.name,
        type: 'scraper',
        url: newSource.url,
        schedule: '0 */6 * * *',
        enabled: true
      });
      
      toast.success('Fonte de notícias adicionada com sucesso!');
      setNewSource({ name: '', url: '', description: '' });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar fonte:', error);
      toast.error('Erro ao adicionar fonte de notícias. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAdd = () => {
    setNewSource({
      name: '',
      url: '',
      description: ''
    });
    setIsAddModalOpen(false);
  };

  const handleRemoveSource = async (sourceId: string) => {
    try {
      await deleteNewsSource(sourceId);
      toast.success('Fonte removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover fonte:', error);
      toast.error('Erro ao remover fonte. Tente novamente.');
    }
  };

  const handleToggleSource = async (sourceId: string) => {
    const source = newsSources.find(s => s.id === sourceId);
    if (!source) return;
    try {
      await updateNewsSource(sourceId, { enabled: !source.enabled });
      toast.success(source.enabled ? 'Fonte desativada' : 'Fonte ativada');
    } catch (error) {
      console.error('Erro ao alternar fonte:', error);
      toast.error('Erro ao atualizar status da fonte.');
    }
  };

  const handleEditSource = (sourceId: string) => {
    const source = newsSources.find(s => s.id === sourceId);
    if (source) {
      setNewSource({
        name: source.name,
        url: source.url,
        description: source.description || ''
      });
      setEditingSourceId(sourceId);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSourceId) return;
    setIsSaving(true);
    try {
      await updateNewsSource(editingSourceId, {
        name: newSource.name,
        url: newSource.url,
        description: newSource.description
      } as any);
      toast.success('Fonte atualizada com sucesso!');
      setNewSource({ name: '', url: '', description: '' });
      setEditingSourceId(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao editar fonte:', error);
      toast.error('Erro ao salvar alterações da fonte.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNewSource({
      name: '',
      url: '',
      description: ''
    });
    setEditingSourceId(null);
    setIsEditModalOpen(false);
  };

  const handleTriggerIngestion = async () => {
    setIsIngesting(true);
    toast.info("Iniciando coleta de notícias...");
    try {
      await triggerIngestion();
      toast.success("Coleta iniciada em segundo plano. Os resultados aparecerão em breve.");
    } catch (error) {
      console.error("Error triggering ingestion:", error);
      toast.error("Erro ao iniciar a coleta.");
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Fontes de Notícias</h2>
          <p className="text-muted-foreground">
            Configure fontes de notícias para coleta automática
          </p>
        </div>
        {canEditClient(clientId) && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleTriggerIngestion} disabled={isIngesting}>
              <Play className="h-4 w-4 mr-2" />
              {isIngesting ? 'Coletando...' : 'Coletar Agora'}
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Fonte
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar fontes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* News Sources List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando fontes de notícias...</p>
        </div>
      ) : filteredSources.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rss className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? 'Nenhuma fonte encontrada' : 'Configure suas fontes de notícias'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchTerm 
              ? 'Tente ajustar os termos de busca para encontrar a fonte desejada.'
              : 'Adicione fontes de notícias confiáveis e relevantes para sugerir temas de conteúdos personalizados para sua empresa.'
            }
          </p>
          {!searchTerm && canEditClient(clientId) && (
            <div className="space-y-3">
              <Button onClick={() => setIsAddModalOpen(true)} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Primeira Fonte
              </Button>
              <p className="text-sm text-muted-foreground">
                Recomendamos: RSS feeds de sites confiáveis do seu setor
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSources.map((source) => (
            <Card key={source.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Rss className="h-4 w-4" />
                      {source.name}
                    </CardTitle>
                    <CardDescription>
                      <span className="text-xs">
                        Última execução: {source.last_run ? new Date(source.last_run).toLocaleDateString('pt-BR') : 'N/A'}
                      </span>
                    </CardDescription>
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeBadge(source.type)}>
                        {getTypeLabel(source.type)}
                      </Badge>
                      <Badge variant={source.enabled ? 'default' : 'secondary'}>
                        {source.enabled ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  {canEditClient(clientId) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleSource(source.id)}>
                          {source.enabled ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditSource(source.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleRemoveSource(source.id)}
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
                  <p className="text-sm text-muted-foreground">
                    <strong>URL:</strong> {source.url}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Fontes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsSources.length}</div>
            <p className="text-xs text-muted-foreground">Fontes configuradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fontes Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {newsSources.filter(s => s.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">Coletando notícias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Última Coleta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {newsSources.length > 0 && newsSources.some(s => s.last_run)
                ? new Date(Math.max(...newsSources.filter(s => s.last_run).map(s => new Date(s.last_run).getTime())))
                    .toLocaleDateString('pt-BR')
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">Data da última execução</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Adicionar Fonte */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Fonte de Notícias</DialogTitle>
            <DialogDescription>
              Configure uma nova fonte para coleta automática de notícias
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="source-name">Nome da Fonte</Label>
              <Input
                id="source-name"
                value={newSource.name}
                onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: TechCrunch Brasil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-url">URL</Label>
              <Input
                id="source-url"
                value={newSource.url}
                onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://exemplo.com/feed.xml"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-description">Descrição (Opcional)</Label>
              <Textarea
                id="source-description"
                value={newSource.description}
                onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da fonte..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelAdd} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleAddSource} disabled={isSaving || !newSource.name || !newSource.url}>
              {isSaving ? 'Salvando...' : 'Adicionar Fonte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Fonte */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Fonte de Notícias</DialogTitle>
            <DialogDescription>
              Altere as informações da fonte de notícias
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-source-name">Nome da Fonte</Label>
              <Input
                id="edit-source-name"
                value={newSource.name}
                onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: TechCrunch Brasil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-source-url">URL</Label>
              <Input
                id="edit-source-url"
                value={newSource.url}
                onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://exemplo.com/feed.xml"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-source-description">Descrição (Opcional)</Label>
              <Textarea
                id="edit-source-description"
                value={newSource.description}
                onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da fonte..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving || !newSource.name || !newSource.url}>
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}