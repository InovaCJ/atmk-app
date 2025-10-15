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

      const { data, error } = await supabase
        .from('client_invites')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
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
      const { data, error } = await supabase
        .from('client_invites')
        .insert({
          client_id: clientId,
          email: inviteData.email,
          role: inviteData.role,
          invited_by: user.id,
          status: 'pending'
        })
        .select('*')
        .single();

      if (error) throw error;
      setInvites(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error sending invite:', err);
      throw err;
    }
  };

  const cancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('client_invites')
        .delete()
        .eq('id', inviteId)
        .eq('client_id', clientId);

      if (error) throw error;
      setInvites(prev => prev.filter(invite => invite.id !== inviteId));
    } catch (err) {
      console.error('Error canceling invite:', err);
      throw err;
    }
  };

  const resendInvite = async (inviteId: string) => {
    try {
      // Atualiza expires_at e status para pending
      const { data, error } = await supabase
        .from('client_invites')
        .update({
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', inviteId)
        .eq('client_id', clientId)
        .select('*')
        .single();

      if (error) throw error;
      setInvites(prev => prev.map(i => i.id === inviteId ? data : i));
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