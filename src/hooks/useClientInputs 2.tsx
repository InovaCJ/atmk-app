import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ClientInput, CreateClientInputRequest } from '@/types/clients';

export function useClientInputs(clientId: string) {
  const [inputs, setInputs] = useState<ClientInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchInputs = async () => {
    if (!user || !clientId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('client_inputs')
        .select(`
          *,
          user:profiles!client_inputs_created_by_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInputs(data || []);
    } catch (err) {
      console.error('Error fetching client inputs:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar inputs');
    } finally {
      setLoading(false);
    }
  };

  const createInput = async (inputData: CreateClientInputRequest) => {
    if (!user || !clientId) throw new Error('Dados insuficientes');

    try {
      const { data, error } = await supabase
        .from('client_inputs')
        .insert({
          ...inputData,
          client_id: clientId,
          created_by: user.id,
        })
        .select(`
          *,
          user:profiles!client_inputs_created_by_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setInputs(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating input:', err);
      throw err;
    }
  };

  const updateInput = async (inputId: string, updates: Partial<CreateClientInputRequest>) => {
    try {
      const { data, error } = await supabase
        .from('client_inputs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inputId)
        .select(`
          *,
          user:profiles!client_inputs_created_by_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setInputs(prev => 
        prev.map(input => 
          input.id === inputId ? { ...input, ...data } : input
        )
      );

      return data;
    } catch (err) {
      console.error('Error updating input:', err);
      throw err;
    }
  };

  const deleteInput = async (inputId: string) => {
    try {
      const { error } = await supabase
        .from('client_inputs')
        .delete()
        .eq('id', inputId);

      if (error) throw error;

      setInputs(prev => prev.filter(input => input.id !== inputId));
    } catch (err) {
      console.error('Error deleting input:', err);
      throw err;
    }
  };

  const ingestInput = async (inputId: string) => {
    try {
      // This would trigger the ingestion pipeline
      // For now, we'll just mark it as processing
      const { data, error } = await supabase
        .from('client_inputs')
        .update({
          metadata: { status: 'processing', ingested_at: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        })
        .eq('id', inputId)
        .select(`
          *,
          user:profiles!client_inputs_created_by_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setInputs(prev => 
        prev.map(input => 
          input.id === inputId ? { ...input, ...data } : input
        )
      );

      // TODO: Trigger actual ingestion pipeline
      console.log('Input ingestion triggered for:', inputId);

      return data;
    } catch (err) {
      console.error('Error ingesting input:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchInputs();
  }, [user, clientId]);

  return {
    inputs,
    loading,
    error,
    createInput,
    updateInput,
    deleteInput,
    ingestInput,
    refetch: fetchInputs,
  };
}
