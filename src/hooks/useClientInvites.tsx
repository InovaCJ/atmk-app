import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ClientInvite, CreateClientInviteRequest } from '@/types/clients';

export function useClientInvites(clientId: string) {
  const [invites, setInvites] = useState<ClientInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchInvites = useCallback(async () => {
    if (!user || !clientId) return;

    try {
      setLoading(true);
      setError(null);

      // Por enquanto, usar estado local até a migração ser aplicada
      console.log('Fetching invites - using local state for now');
      setInvites([]);
    } catch (err) {
      console.error('Error fetching client invites:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar convites');
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }, [user, clientId]);

  const sendInvite = async (inviteData: CreateClientInviteRequest) => {
    if (!user || !clientId) throw new Error('Dados insuficientes');

    try {
      // Criar convite temporário no estado local
      const tempInvite: ClientInvite = {
        id: `temp_${Date.now()}`,
        client_id: clientId,
        email: inviteData.email,
        role: inviteData.role,
        invited_by: user.id,
        status: 'pending',
        token: '',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        inviter: {
          id: user.id,
          email: user.email || 'usuario@exemplo.com',
          full_name: user.user_metadata?.full_name || 'Usuário',
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        client: {
          id: clientId,
          name: 'Empresa',
          slug: 'empresa',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'active',
          plan: 'pro'
        }
      };

      // Adicionar ao estado local
      setInvites(prev => {
        const newInvites = [tempInvite, ...prev];
        console.log('useClientInvites - Adding invite:', tempInvite);
        console.log('useClientInvites - New invites list:', newInvites);
        return newInvites;
      });
      
      return tempInvite;
    } catch (err) {
      console.error('Error sending invite:', err);
      throw err;
    }
  };

  const cancelInvite = async (inviteId: string) => {
    try {
      // Remover do estado local
      setInvites(prev => prev.filter(invite => invite.id !== inviteId));
    } catch (err) {
      console.error('Error canceling invite:', err);
      throw err;
    }
  };

  const resendInvite = async (inviteId: string) => {
    try {
      // Por enquanto, apenas log
      console.log('Resending invite:', inviteId);
    } catch (err) {
      console.error('Error resending invite:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [clientId, user, fetchInvites]);

  return {
    invites,
    loading,
    error,
    sendInvite,
    cancelInvite,
    resendInvite,
    fetchInvites
  };
}