import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SearchIntegration {
  id: string;
  client_id: string;
  provider: 'serpapi' | 'tavily' | 'bing' | 'custom';
  api_key_ref: string;
  daily_quota: number;
  enabled: boolean;
  created_at: string;
  updated_at?: string;
}

interface SearchTerm {
  id: string;
  term: string;
  enabled: boolean;
}

interface SearchFrequency {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  cost: number;
}

export function useSearchIntegrations(clientId: string) {
  const [integrations, setIntegrations] = useState<SearchIntegration[]>([]);
  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([]);
  const [searchFrequencies, setSearchFrequencies] = useState<SearchFrequency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchIntegrations = async () => {
    if (!clientId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar integrações de busca
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('search_integrations')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (integrationsError) throw integrationsError;

      setIntegrations(integrationsData || []);

      // Por enquanto, usar dados padrão para termos e frequências
      // TODO: Implementar tabelas específicas para esses dados
      setSearchTerms([
        { id: '1', term: '', enabled: false },
        { id: '2', term: '', enabled: false },
        { id: '3', term: '', enabled: false },
        { id: '4', term: '', enabled: false },
        { id: '5', term: '', enabled: false }
      ]);

      setSearchFrequencies([
        { id: '1', frequency: 'daily', enabled: true, cost: 1000 }, // R$ 10 por mês
        { id: '2', frequency: 'weekly', enabled: false, cost: 500 }, // R$ 5 por mês
        { id: '3', frequency: 'monthly', enabled: false, cost: 0 }   // R$ 0 - Grátis
      ]);

    } catch (err) {
      console.error('Error fetching search integrations:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar integrações');
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  };

  const addIntegration = async (integration: Omit<SearchIntegration, 'id' | 'client_id' | 'created_at' | 'updated_at'>) => {
    if (!clientId || !user) {
      throw new Error('Cliente ou usuário não encontrado');
    }

    try {
      const { data, error } = await supabase
        .from('search_integrations')
        .insert({
          client_id: clientId,
          ...integration
        })
        .select()
        .single();

      if (error) throw error;

      setIntegrations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding search integration:', err);
      throw err;
    }
  };

  const updateIntegration = async (id: string, updates: Partial<SearchIntegration>) => {
    if (!clientId || !user) {
      throw new Error('Cliente ou usuário não encontrado');
    }

    try {
      const { data, error } = await supabase
        .from('search_integrations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('client_id', clientId)
        .select()
        .single();

      if (error) throw error;

      setIntegrations(prev => 
        prev.map(integration => integration.id === id ? data : integration)
      );
      return data;
    } catch (err) {
      console.error('Error updating search integration:', err);
      throw err;
    }
  };

  const deleteIntegration = async (id: string) => {
    if (!clientId || !user) {
      throw new Error('Cliente ou usuário não encontrado');
    }

    try {
      const { error } = await supabase
        .from('search_integrations')
        .delete()
        .eq('id', id)
        .eq('client_id', clientId);

      if (error) throw error;

      setIntegrations(prev => prev.filter(integration => integration.id !== id));
    } catch (err) {
      console.error('Error deleting search integration:', err);
      throw err;
    }
  };

  const updateSearchTerms = async (terms: SearchTerm[]) => {
    setSearchTerms(terms);
    
    if (!clientId || !user) return;
    
    try {
      // Salvar termos de busca no banco
      const { error } = await supabase
        .from('client_settings')
        .upsert({
          client_id: clientId,
          search_terms: terms,
          updated_at: new Date().toISOString()
        }, { onConflict: 'client_id' });

      if (error) throw error;
      console.log('✅ Termos de busca salvos:', terms);
    } catch (err) {
      console.error('❌ Erro ao salvar termos de busca:', err);
    }
  };

  const updateSearchFrequencies = async (frequencies: SearchFrequency[]) => {
    setSearchFrequencies(frequencies);
    
    if (!clientId || !user) return;
    
    try {
      // Salvar frequências no banco
      const { error } = await supabase
        .from('client_settings')
        .upsert({
          client_id: clientId,
          search_frequencies: frequencies,
          updated_at: new Date().toISOString()
        }, { onConflict: 'client_id' });

      if (error) throw error;
      console.log('✅ Frequências de busca salvas:', frequencies);
    } catch (err) {
      console.error('❌ Erro ao salvar frequências de busca:', err);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [clientId, user]);

  return { 
    integrations, 
    searchTerms, 
    searchFrequencies, 
    setSearchTerms,
    setSearchFrequencies,
    loading, 
    error, 
    addIntegration, 
    updateIntegration, 
    deleteIntegration,
    updateSearchTerms,
    updateSearchFrequencies,
    refetch: fetchIntegrations
  };
}
