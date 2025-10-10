import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ClientMember, CreateClientMemberRequest } from '@/types/clients';

export function useClientMembers(clientId: string) {
  const [members, setMembers] = useState<ClientMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMembers = async () => {
    if (!user || !clientId) return;

    try {
      setLoading(true);
      setError(null);

      // Primeiro, tentar buscar sem join para verificar se a tabela existe
      const { data: membersData, error: membersError } = await supabase
        .from('client_members')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (membersError) {
        console.error('Error fetching client members:', membersError);
        // Se a tabela não existe, retornar array vazio
        if (membersError.code === 'PGRST116' || membersError.message?.includes('relation') || membersError.message?.includes('does not exist')) {
          setMembers([]);
          return;
        }
        throw membersError;
      }

      // Se temos membros, tentar buscar os dados dos usuários
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(member => member.user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, email, avatar_url')
          .in('user_id', userIds);

        if (profilesError) {
          console.warn('Error fetching profiles:', profilesError);
          // Se não conseguir buscar profiles, usar dados básicos
          const membersWithBasicUser = membersData.map(member => ({
            ...member,
            user: {
              id: member.user_id,
              email: 'Usuário não encontrado',
              full_name: 'Nome não disponível',
              avatar_url: null
            }
          }));
          setMembers(membersWithBasicUser);
          return;
        }

        // Combinar dados dos membros com profiles
        const membersWithProfiles = membersData.map(member => {
          const profile = profilesData?.find(p => p.user_id === member.user_id);
          return {
            ...member,
            user: profile ? {
              id: profile.id,
              email: profile.email || 'Email não disponível',
              full_name: profile.full_name,
              avatar_url: profile.avatar_url
            } : {
              id: member.user_id,
              email: 'Usuário não encontrado',
              full_name: 'Nome não disponível',
              avatar_url: null
            }
          };
        });

        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error('Error fetching client members:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar membros');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (memberData: CreateClientMemberRequest) => {
    if (!user || !clientId) throw new Error('Dados insuficientes');

    try {
      // First, find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', memberData.email)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          throw new Error('Usuário não encontrado com este e-mail');
        }
        throw profileError;
      }

      // Add member
      const { data, error } = await supabase
        .from('client_members')
        .insert({
          client_id: clientId,
          user_id: profile.user_id,
          role: memberData.role,
        })
        .select(`
          *,
          user:profiles!client_members_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setMembers(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding member:', err);
      throw err;
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'client_admin' | 'editor' | 'viewer') => {
    try {
      const { data, error } = await supabase
        .from('client_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .select(`
          *,
          user:profiles!client_members_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setMembers(prev => 
        prev.map(member => 
          member.id === memberId ? { ...member, ...data } : member
        )
      );

      return data;
    } catch (err) {
      console.error('Error updating member role:', err);
      throw err;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('client_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (err) {
      console.error('Error removing member:', err);
      throw err;
    }
  };

  const transferOwnership = async (memberId: string) => {
    if (!user || !clientId) throw new Error('Dados insuficientes');

    try {
      // First, verify current user is admin
      const currentMember = members.find(m => m.user_id === user.id);
      if (!currentMember || currentMember.role !== 'client_admin') {
        throw new Error('Apenas administradores podem transferir propriedade');
      }

      // Update the target member to admin
      const { data: updatedMember, error: updateError } = await supabase
        .from('client_members')
        .update({ role: 'client_admin' })
        .eq('id', memberId)
        .select(`
          *,
          user:profiles!client_members_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (updateError) throw updateError;

      // Update current user to editor (no longer admin)
      const { error: demoteError } = await supabase
        .from('client_members')
        .update({ role: 'editor' })
        .eq('client_id', clientId)
        .eq('user_id', user.id);

      if (demoteError) throw demoteError;

      // Update local state
      setMembers(prev => 
        prev.map(member => {
          if (member.id === memberId) {
            return { ...member, ...updatedMember };
          }
          if (member.user_id === user.id) {
            return { ...member, role: 'editor' };
          }
          return member;
        })
      );

      return updatedMember;
    } catch (err) {
      console.error('Error transferring ownership:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user, clientId]);

  return {
    members,
    loading,
    error,
    addMember,
    updateMemberRole,
    removeMember,
    transferOwnership,
    refetch: fetchMembers,
  };
}
