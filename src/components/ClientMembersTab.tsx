import React, { useState } from 'react';
import { Plus, Users, Mail, MoreHorizontal, Trash2, Edit, Crown, User, Eye, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useClientMembers } from '@/hooks/useClientMembers';
import { useClientInvites } from '@/hooks/useClientInvites';
import { useClientContext } from '@/contexts/ClientContext';
import { useAuth } from '@/contexts/AuthContext';
import { CreateMemberModal } from './CreateMemberModal';
import { TransferOwnershipModal } from './TransferOwnershipModal';
import { toast } from 'sonner';
import { ClientMember } from '@/types/clients';

interface ClientMembersTabProps {
  clientId: string;
}

export function ClientMembersTab({ clientId }: ClientMembersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedMemberForTransfer, setSelectedMemberForTransfer] = useState<ClientMember | null>(null);
  const [activeTab, setActiveTab] = useState('members');
  const [isMutating, setIsMutating] = useState(false);
  
  const { members, loading, error, removeMember, updateMemberRole, transferOwnership } = useClientMembers(clientId);
  const { invites, loading: invitesLoading, cancelInvite, resendInvite, sendInvite } = useClientInvites(clientId);
  const { canEditClient } = useClientContext();
  const { user } = useAuth();

  // Debug: Log dos convites para verificar se estão sendo carregados
  React.useEffect(() => {
    console.log('ClientMembersTab - Invites updated:', invites);
    console.log('ClientMembersTab - Invites length:', invites.length);
  }, [invites]);

  const filteredMembers = members.filter(member =>
    member.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client_admin':
        return <Crown className="h-4 w-4" />;
      case 'editor':
        return <Edit className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'client_admin':
        return 'Administrador';
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Visualizador';
      default:
        return role;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'client_admin':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getInviteStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'accepted':
        return <CheckCircle className="h-3 w-3" />;
      case 'declined':
        return <XCircle className="h-3 w-3" />;
      case 'expired':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getInviteStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'accepted':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'declined':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'expired':
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
    }
  };

  const getInviteStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Aceito';
      case 'declined':
        return 'Recusado';
      case 'expired':
        return 'Expirado';
      default:
        return status;
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Tem certeza que deseja remover ${memberName} deste cliente?`)) {
      return;
    }

    try {
      await removeMember(memberId);
      toast.success('Membro removido com sucesso');
    } catch (error) {
      toast.error('Erro ao remover membro');
      console.error('Error removing member:', error);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'client_admin' | 'editor' | 'viewer') => {
    try {
      await updateMemberRole(memberId, newRole);
      toast.success('Função atualizada com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar função');
      console.error('Error updating role:', error);
    }
  };

  const handleCancelInvite = async (inviteId: string, email: string) => {
    if (!confirm(`Tem certeza que deseja cancelar o convite para ${email}?`)) {
      return;
    }

    try {
      await cancelInvite(inviteId);
      toast.success('Convite cancelado com sucesso');
    } catch (error) {
      toast.error('Erro ao cancelar convite');
      console.error('Error canceling invite:', error);
    }
  };

  const handleResendInvite = async (inviteId: string, email: string) => {
    try {
      await resendInvite(inviteId);
      toast.success('Convite reenviado com sucesso');
    } catch (error) {
      toast.error('Erro ao reenviar convite');
      console.error('Error resending invite:', error);
    }
  };

  const handleTransferOwnership = (member: ClientMember) => {
    setSelectedMemberForTransfer(member);
    setShowTransferModal(true);
  };

  const isCurrentUserAdmin = () => {
    return members.some(member => 
      member.user_id === user?.id && member.role === 'client_admin'
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando membros...</p>
        </div>
      </div>
    );
  }

  // Se há erro mas não é crítico, mostrar interface com aviso
  if (error && !members.length && !invites.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Membros</h2>
            <p className="text-muted-foreground">
              Gerencie quem tem acesso a esta empresa
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Configuração Pendente
              </h3>
              <p className="text-yellow-700 mb-4">
                O sistema de membros ainda não foi configurado no banco de dados. 
                Execute o script de migração para ativar esta funcionalidade.
              </p>
              <div className="bg-yellow-100 rounded p-3 text-sm text-yellow-800">
                <strong>Para corrigir:</strong> Execute o arquivo <code>apply_invites_migration.sql</code> 
                no SQL Editor do Supabase Dashboard.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Membros</h2>
          <p className="text-muted-foreground">
            Gerencie quem tem acesso a esta empresa
          </p>
        </div>
        {canEditClient(clientId) && (
          <Button onClick={() => setShowCreateModal(true)} disabled={isMutating}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Membro
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">
            Membros Ativos ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invites">
            Convites ({invites.length})
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar membros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Members List */}
          {isMutating ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Enviando convite...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'Nenhum membro encontrado' : 'Nenhum membro adicionado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Adicione membros para colaborar nesta empresa'
                }
              </p>
              {!searchTerm && canEditClient(clientId) && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Membro
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <Card key={member.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.user?.avatar_url} />
                          <AvatarFallback>
                            {member.user?.full_name?.charAt(0) || member.user?.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {member.user?.full_name || 'Nome não informado'}
                            {member.user_id === user?.id && (
                              <span className="text-sm text-muted-foreground ml-2">(Você)</span>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {member.user?.email}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRoleBadge(member.role)} className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          {getRoleLabel(member.role)}
                        </Badge>
                        {canEditClient(clientId) && member.user_id !== user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {member.role !== 'client_admin' && (
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.id, 'client_admin')}
                                >
                                  <Crown className="h-4 w-4 mr-2" />
                                  Tornar Administrador
                                </DropdownMenuItem>
                              )}
                              {member.role !== 'editor' && (
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.id, 'editor')}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Tornar Editor
                                </DropdownMenuItem>
                              )}
                              {member.role !== 'viewer' && (
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.id, 'viewer')}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Tornar Visualizador
                                </DropdownMenuItem>
                              )}
                              {isCurrentUserAdmin() && member.role !== 'client_admin' && (
                                <DropdownMenuItem
                                  onClick={() => handleTransferOwnership(member)}
                                  className="text-yellow-600"
                                >
                                  <Crown className="h-4 w-4 mr-2" />
                                  Transferir Propriedade
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleRemoveMember(member.id, member.user?.full_name || member.user?.email || 'este membro')}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Membro desde {new Date(member.created_at).toLocaleDateString('pt-BR')}
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
                <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{members.length}</div>
                <p className="text-xs text-muted-foreground">Pessoas com acesso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {members.filter(m => m.role === 'client_admin').length}
                </div>
                <p className="text-xs text-muted-foreground">Podem gerenciar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Editores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {members.filter(m => m.role === 'editor').length}
                </div>
                <p className="text-xs text-muted-foreground">Podem editar</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites" className="space-y-6">
          {isMutating || invitesLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{isMutating ? 'Enviando convite...' : 'Carregando convites...'}</p>
              </div>
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum convite pendente</h3>
              <p className="text-muted-foreground mb-4">
                Todos os convites foram processados ou não há convites enviados
              </p>
              {canEditClient(clientId) && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Membro
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => {
                const statusBadge = getInviteStatusBadge(invite.status);
                const statusIcon = getInviteStatusIcon(invite.status);
                const statusLabel = getInviteStatusLabel(invite.status);
                
                return (
                  <Card key={invite.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {invite.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {invite.email}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              Convite enviado em {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${statusBadge.className} flex items-center gap-1`}>
                            {statusIcon}
                            {statusLabel}
                          </Badge>
                          <Badge variant={getRoleBadge(invite.role)} className="flex items-center gap-1">
                            {getRoleIcon(invite.role)}
                            {getRoleLabel(invite.role)}
                          </Badge>
                          {canEditClient(clientId) && invite.status === 'pending' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleResendInvite(invite.id, invite.email)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reenviar Convite
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleCancelInvite(invite.id, invite.email)}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancelar Convite
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {invite.status === 'pending' && (
                          <span>Expira em {new Date(invite.expires_at).toLocaleDateString('pt-BR')}</span>
                        )}
                        {invite.status === 'accepted' && invite.accepted_at && (
                          <span>Aceito em {new Date(invite.accepted_at).toLocaleDateString('pt-BR')}</span>
                        )}
                        {invite.status === 'expired' && (
                          <span>Convite expirado</span>
                        )}
                        {invite.status === 'declined' && (
                          <span>Convite recusado</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateMemberModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        clientId={clientId}
        onInviteSent={() => {
          console.log('CreateMemberModal - onInviteSent called, switching to invites tab');
          setActiveTab('invites');
        }}
        onMutatingChange={setIsMutating}
        sendInviteFn={sendInvite}
      />
      
      <TransferOwnershipModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        clientId={clientId}
        targetMember={selectedMemberForTransfer}
      />
    </div>
  );
}
