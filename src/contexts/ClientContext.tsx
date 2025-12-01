import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClientContext deve ser usado dentro de um ClientProvider');
  return ctx;
};

interface ClientProviderProps {
  children: React.ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  // --- STATE ---
  const [selectedClientId, setSelectedClientId] = useState<string | null>(() =>
    localStorage.getItem('selectedClientId')
  );

  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);

  const { user } = useAuth();
  const { clients, loading, error } = useClients();

  // --- PERSIST SELECTED CLIENT ---
  useEffect(() => {
    if (selectedClientId) {
      localStorage.setItem('selectedClientId', selectedClientId);
    }
  }, [selectedClientId]);

  // --- AUTO SELECT CLIENT ---
  useEffect(() => {
    if (clients.length === 0) return;

    // Caso ID salvo não exista mais
    if (selectedClientId && !clients.some(c => c.id === selectedClientId)) {
      setSelectedClientId(clients[0].id);
      return;
    }

    // Caso não tenha ID nenhum
    if (!selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  // --- LOAD USER PERMISSIONS ---
  useEffect(() => {
    const loadPermissions = async () => {
      if (!user) {
        setUserPermissions(null);
        return;
      }

      try {
        const { data: ownedClients } = await supabase
          .from('clients')
          .select('id')
        // .eq('created_by', user.id);

        if (!ownedClients?.length) {
          console.log('Skipping permission load, no owned clients found');
        }

        const { data: members } = await supabase
          .from('client_members')
          .select('client_id, role')
          .eq('user_id', user.id);


        const clientRoles: Record<string, 'client_admin' | 'editor' | 'viewer'> = {};
        members?.forEach(m => {
          clientRoles[m.client_id] = m.role;
        });

        const isOwner = ownedClients && ownedClients.length > 0;

        setUserPermissions({
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
        });
      } catch (err) {
        console.error('Error loading user permissions:', err);
      }
    };

    loadPermissions();
  }, [user]);

  // --- SELECTED CLIENT MEMO ---
  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // --- PERMISSION CHECK FUNCTIONS (MEMOIZED) ---

  const canManageClients = !!user;

  const canManageClient = useCallback(
    (clientId: string) => {
      if (!userPermissions) return false;
      if (userPermissions.isOwner) return true;
      return userPermissions.clientRoles[clientId] === 'client_admin';
    },
    [userPermissions]
  );

  const canEditClient = useCallback(
    (clientId: string) => {
      if (!userPermissions) return false;
      if (userPermissions.isOwner) return true;
      const role = userPermissions.clientRoles[clientId];
      return role === 'client_admin' || role === 'editor';
    },
    [userPermissions]
  );

  const canViewClient = useCallback(
    (clientId: string) => {
      if (!userPermissions) return false;
      if (userPermissions.isOwner) return true;
      return clientId in userPermissions.clientRoles;
    },
    [userPermissions]
  );

  // --- MEMO CONTEXT VALUE ---
  const value = useMemo(
    () => ({
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
    }),
    [
      selectedClientId,
      selectedClient,
      clients,
      loading,
      error,
      userPermissions,
      canManageClients,
      canManageClient,
      canEditClient,
      canViewClient,
    ]
  );

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};
