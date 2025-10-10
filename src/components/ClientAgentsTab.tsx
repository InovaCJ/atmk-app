import React, { useState } from 'react';
import { Plus, Bot, MoreHorizontal, Trash2, Edit, Play } from 'lucide-react';
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

interface ClientAgentsTabProps {
  clientId: string;
}

export function ClientAgentsTab({ clientId }: ClientAgentsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { canEditClient } = useClientContext();

  // Mock data - replace with actual data from hooks
  const agents = [
    {
      id: '1',
      name: 'Assistente de Conteúdo',
      system_prompt: 'Você é um assistente especializado em criação de conteúdo para redes sociais...',
      tools: ['kb.search', 'web.search', 'content.generate'],
      created_at: '2024-01-10T10:00:00Z'
    },
    {
      id: '2',
      name: 'Analista de Tendências',
      system_prompt: 'Você é um analista especializado em identificar tendências de mercado...',
      tools: ['news.fetch', 'trends.analyze', 'data.visualize'],
      created_at: '2024-01-12T10:00:00Z'
    }
  ];

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.system_prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Agentes de IA</h2>
          <p className="text-muted-foreground">
            Configure agentes personalizados para este cliente
          </p>
        </div>
        {canEditClient(clientId) && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agente
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar agentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Agents List */}
      {filteredAgents.length === 0 ? (
        <div className="text-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'Nenhum agente encontrado' : 'Nenhum agente configurado'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Configure agentes personalizados para este cliente'
            }
          </p>
          {!searchTerm && canEditClient(clientId) && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Agente
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAgents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      {agent.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className="text-xs">
                        Criado em {new Date(agent.created_at).toLocaleDateString('pt-BR')}
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
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Testar Agente
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">System Prompt:</p>
                    <p className="text-sm line-clamp-3">{agent.system_prompt}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Ferramentas:</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.tools.map((tool, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
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
            <CardTitle className="text-sm font-medium">Total de Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">Agentes configurados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ferramentas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(agents.flatMap(a => a.tools))].length}
            </div>
            <p className="text-xs text-muted-foreground">Ferramentas únicas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativo</div>
            <p className="text-xs text-muted-foreground">Sistema funcionando</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
