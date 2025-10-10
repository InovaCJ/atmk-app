import React, { createContext, useContext, useEffect, useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { Client, UserPermissions } from '@/types/clients';

interface ClientContextType {
  selectedClientId: string | null;
  setSelectedClientId: (id: string) => void;
  selectedClient: Client | null;
  clients: Client[];
  loading: boolean;
  error: string | null;
  userPermissions: UserPermissions | null;
  canManageClients: boolean;
  canManageClient: (clientId: string) => boolean;
  canEditClient: (clientId: string) => boolean;
  canViewClient: (clientId: string) => boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClientContext deve ser usado dentro de um ClientProvider');
  }
  return context;
};

interface ClientProviderProps {
  children: React.ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const { user } = useAuth();
  const { clients, loading, error } = useClients();

  // Auto-selecionar primeiro cliente quando carregar
  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  // Carregar permissões do usuário
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!user) {
        setUserPermissions(null);
        return;
      }

      try {
        // Buscar membros do usuário
        const { data: members } = await supabase
          .from('client_members')
          .select('client_id, role')
          .eq('user_id', user.id);

        // Buscar clientes criados pelo usuário
        const { data: ownedClients } = await supabase
          .from('clients')
          .select('id')
          .eq('created_by', user.id);

        const clientRoles: Record<string, 'client_admin' | 'editor' | 'viewer'> = {};
        
        // Mapear roles dos membros
        members?.forEach(member => {
          clientRoles[member.client_id] = member.role;
        });

        // Owner tem permissões especiais
        const isOwner = ownedClients && ownedClients.length > 0;

        const permissions: UserPermissions = {
          userId: user.id,
          permissions: [
            'clients:create',
            'clients:read',
            ...(isOwner ? ['clients:update', 'clients:delete', 'clients:duplicate'] : []),
            'client.kb:read',
            'client.kb:write',
            'client.kb:ingest',
            'client.integrations:manage',
          ],
          clientRoles,
          isOwner,
        };

        setUserPermissions(permissions);
      } catch (err) {
        console.error('Error loading user permissions:', err);
      }
    };

    loadUserPermissions();
  }, [user, clients]);

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const canManageClients = !!user; // Qualquer usuário autenticado pode criar clientes

  const canManageClient = (clientId: string): boolean => {
    if (!userPermissions) return false;
    
    // Owner pode gerenciar todos os clientes
    if (userPermissions.isOwner) return true;
    
    // Client admin pode gerenciar seu cliente
    const role = userPermissions.clientRoles[clientId];
    return role === 'client_admin';
  };

  const canEditClient = (clientId: string): boolean => {
    if (!userPermissions) return false;
    
    // Owner pode editar todos os clientes
    if (userPermissions.isOwner) return true;
    
    // Client admin e editor podem editar
    const role = userPermissions.clientRoles[clientId];
    return role === 'client_admin' || role === 'editor';
  };

  const canViewClient = (clientId: string): boolean => {
    if (!userPermissions) return false;
    
    // Owner pode ver todos os clientes
    if (userPermissions.isOwner) return true;
    
    // Qualquer membro pode ver
    return clientId in userPermissions.clientRoles;
  };

  const value = {
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    clients,
    loading,
    error,
    userPermissions,
    canManageClients,
    canManageClient,
    canEditClient,
    canViewClient,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

// Import supabase for the permissions check
import { supabase } from '@/integrations/supabase/client';
