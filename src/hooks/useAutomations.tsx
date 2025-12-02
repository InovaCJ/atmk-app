import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Automation, CreateAutomationDTO } from '@/types/automation';
import { useToast } from '@/hooks/use-toast';

export function useAutomations(clientId: string | null) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAutomations = useCallback(async () => {
    if (!user || !clientId) {
      setAutomations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        // .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomations(data as Automation[]);
    } catch (error: any) {
      // Ignora erro se a tabela ainda não existir (comum em dev antes de rodar a migration)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        setAutomations([]);
      } else {
        console.error('Error fetching automations:', error);
        toast({
          title: "Erro ao carregar automações",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, clientId, toast]);

  const getAutomation = async (id: string): Promise<Automation | null> => {
    if (!user || !clientId) return null;

    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Automation;
    } catch (error: any) {
      console.error('Error fetching automation:', error);
      return null;
    }
  };

  const createAutomation = async (data: CreateAutomationDTO) => {
    if (!user || !clientId) throw new Error('No client selected');

    try {
      const { data: newAutomation, error } = await supabase
        .from('automations')
        .insert({
          client_id: clientId,
          created_by: user.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;

      setAutomations(prev => [newAutomation as Automation, ...prev]);
      toast({ title: "Automação criada com sucesso!" });
      return newAutomation as Automation;
    } catch (error: any) {
      console.error('Error creating automation:', error);
      toast({
        title: "Erro ao criar automação",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateAutomation = async (id: string, updates: Partial<CreateAutomationDTO>) => {
    try {
      const { data, error } = await supabase
        .from('automations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAutomations(prev => prev.map(a => a.id === id ? (data as Automation) : a));
      toast({ title: "Automação atualizada!" });
      return data as Automation;
    } catch (error: any) {
      console.error('Error updating automation:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteAutomation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAutomations(prev => prev.filter(a => a.id !== id));
      toast({ title: "Automação removida" });
    } catch (error: any) {
      console.error('Error deleting automation:', error);
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  return {
    automations,
    loading,
    getAutomation,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    refresh: fetchAutomations
  };
}