import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SearchTerm, SearchFrequency } from '@/types/clients';

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

// Interfaces moved to types/clients.ts

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

      // Buscar configurações de busca do cliente
      let savedSearchTerms = [
        { id: '1', term: '', enabled: false },
        { id: '2', term: '', enabled: false },
        { id: '3', term: '', enabled: false },
        { id: '4', term: '', enabled: false },
        { id: '5', term: '', enabled: false }
      ];

      let savedSearchFrequencies = [
        { id: '1', frequency: 'daily', enabled: true },
        { id: '2', frequency: 'weekly', enabled: false },
        { id: '3', frequency: 'monthly', enabled: false }
      ];

      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('client_settings')
          .select('search_terms, search_frequencies')
          .eq('client_id', clientId)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          console.warn('Error fetching search settings:', settingsError);
        } else if (settingsData) {
          // Carregar configurações salvas se existirem
          if (Array.isArray(settingsData.search_terms) && settingsData.search_terms.length > 0) {
            savedSearchTerms = settingsData.search_terms;
          }
          // Se vier [], manter os defaults (5 slots) para não esconder os campos
          if (Array.isArray(settingsData.search_frequencies) && settingsData.search_frequencies.length > 0) {
            savedSearchFrequencies = settingsData.search_frequencies;
          }
        }
      } catch (err) {
        console.warn('Search settings fields may not exist yet:', err);
        // Continuar com valores padrão se os campos não existirem
      }

      setSearchTerms(savedSearchTerms);
      setSearchFrequencies(savedSearchFrequencies);

      console.log('✅ Configurações de busca carregadas:', {
        searchTerms: savedSearchTerms,
        searchFrequencies: savedSearchFrequencies
      });

    } catch (err) {
      console.error('Error fetching search integrations:', err);
      toast.error('Erro ao carregar integrações de busca.');
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
      console.log('🔐 addIntegration RLS context:', { clientId, userId: user.id, integration: { provider: integration.provider, hasKey: !!integration.api_key_ref } });
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
      toast.error('Erro ao adicionar integração de busca. Verifique a API Key e permissões.');
      throw err;
    }
  };

  const updateIntegration = async (id: string, updates: Partial<SearchIntegration>) => {
    if (!clientId || !user) {
      throw new Error('Cliente ou usuário não encontrado');
    }

    try {
      console.log('🔐 updateIntegration RLS context:', { clientId, userId: user.id, id, updates: Object.keys(updates) });
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
      toast.error('Erro ao atualizar integração de busca.');
      throw err;
    }
  };

  const deleteIntegration = async (id: string) => {
    if (!clientId || !user) {
      throw new Error('Cliente ou usuário não encontrado');
    }

    try {
      console.log('🔐 deleteIntegration RLS context:', { clientId, userId: user.id, id });
      const { error } = await supabase
        .from('search_integrations')
        .delete()
        .eq('id', id)
        .eq('client_id', clientId);

      if (error) throw error;

      setIntegrations(prev => prev.filter(integration => integration.id !== id));
    } catch (err) {
      console.error('Error deleting search integration:', err);
      toast.error('Erro ao remover integração de busca.');
      throw err;
    }
  };

  const updateSearchTerms = async (terms: SearchTerm[]) => {
    setSearchTerms(terms);
    
    if (!clientId || !user) return;
    
    try {
      console.log('🔐 updateSearchTerms RLS context:', { clientId, userId: user.id, termsCount: terms.length });
      // Primeiro, verificar se os campos existem na tabela
      const { data: existingSettings } = await supabase
        .from('client_settings')
        .select('id')
        .eq('client_id', clientId)
        .single();

      if (!existingSettings) {
        // Criar registro se não existir
        const { error: createError } = await supabase
          .from('client_settings')
          .insert({
            client_id: clientId,
            tone_of_voice: 'Claro e objetivo',
            style_guidelines: 'Evite jargões desnecessários',
            locale: 'pt-BR',
            search_terms: terms,
            updated_at: new Date().toISOString()
          });

        if (createError) throw createError;
      } else {
        // Atualizar registro existente
        const { error } = await supabase
          .from('client_settings')
          .update({
            search_terms: terms,
            updated_at: new Date().toISOString()
          })
          .eq('client_id', clientId);

        if (error) throw error;
      }
      
      console.log('✅ Termos de busca salvos:', terms);
    } catch (err) {
      console.error('❌ Erro ao salvar termos de busca:', err);
      toast.error('Erro ao salvar termos de busca. Verifique permissões e migrações.');
      // Não re-throw para evitar quebrar a UI se os campos não existirem
      console.warn('Continuando sem persistência - campos podem não existir na tabela');
    }
  };

  const updateSearchFrequencies = async (frequencies: SearchFrequency[]) => {
    setSearchFrequencies(frequencies);
    
    if (!clientId || !user) return;
    
    try {
      console.log('🔐 updateSearchFrequencies RLS context:', { clientId, userId: user.id, enabled: frequencies.filter(f => f.enabled).map(f => f.frequency) });
      // Primeiro, verificar se os campos existem na tabela
      const { data: existingSettings } = await supabase
        .from('client_settings')
        .select('id')
        .eq('client_id', clientId)
        .single();

      if (!existingSettings) {
        // Criar registro se não existir
        const { error: createError } = await supabase
          .from('client_settings')
          .insert({
            client_id: clientId,
            tone_of_voice: 'Claro e objetivo',
            style_guidelines: 'Evite jargões desnecessários',
            locale: 'pt-BR',
            search_frequencies: frequencies,
            updated_at: new Date().toISOString()
          });

        if (createError) throw createError;
      } else {
        // Atualizar registro existente
        const { error } = await supabase
          .from('client_settings')
          .update({
            search_frequencies: frequencies,
            updated_at: new Date().toISOString()
          })
          .eq('client_id', clientId);

        if (error) throw error;
      }
      
      console.log('✅ Frequências de busca salvas:', frequencies);
    } catch (err) {
      console.error('❌ Erro ao salvar frequências de busca:', err);
      toast.error('Erro ao salvar frequências de busca. Verifique permissões e migrações.');
      // Não re-throw para evitar quebrar a UI se os campos não existirem
      console.warn('Continuando sem persistência - campos podem não existir na tabela');
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
