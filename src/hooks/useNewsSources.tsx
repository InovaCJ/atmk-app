import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NewsSource {
  id: string;
  name: string;
  type: 'rss' | 'api' | 'scraper';
  url: string;
  api_config?: any;
  schedule: string;
  enabled: boolean;
  last_run?: string;
  created_at: string;
  updated_at?: string;
}

export function useNewsSources(clientId: string) {
  const [newsSources, setNewsSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();

  const fetchNewsSources = async () => {
    if (!clientId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('news_sources')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNewsSources(data || []);
    } catch (err) {
      console.error('Error fetching news sources:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar fontes de notícias');
      setNewsSources([]);
    } finally {
      setLoading(false);
    }
  };

  const addNewsSource = async (source: Omit<NewsSource, 'id' | 'created_at' | 'updated_at'>) => {
    if (!clientId || !user) {
      throw new Error('Cliente ou usuário não encontrado');
    }

    try {
      const { data, error } = await supabase
        .from('news_sources')
        .insert({
          client_id: clientId,
          ...source
        })
        .select()
        .single();

      if (error) throw error;

      setNewsSources(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding news source:', err);
      throw err;
    }
  };

  const updateNewsSource = async (id: string, updates: Partial<NewsSource>) => {
    if (!clientId || !user) {
      throw new Error('Cliente ou usuário não encontrado');
    }

    try {
      const { data, error } = await supabase
        .from('news_sources')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('client_id', clientId)
        .select()
        .single();

      if (error) throw error;

      setNewsSources(prev =>
        prev.map(source => source.id === id ? data : source)
      );
      return data;
    } catch (err) {
      console.error('Error updating news source:', err);
      throw err;
    }
  };

  const deleteNewsSource = async (id: string) => {
    if (!clientId || !user) {
      throw new Error('Cliente ou usuário não encontrado');
    }

    try {
      const { error } = await supabase
        .from('news_sources')
        .delete()
        .eq('id', id)
        .eq('client_id', clientId);

      if (error) throw error;

      setNewsSources(prev => prev.filter(source => source.id !== id));
    } catch (err) {
      console.error('Error deleting news source:', err);
      throw err;
    }
  };

  const triggerIngestion = async () => {
    if (!clientId || !user || !session?.access_token) {
      throw new Error('Cliente, usuário ou sessão não encontrados');
    }

    // Criar um cliente Supabase autenticado com o token atual da sessão
    // const supabaseAuthenticatedClient = createSupabaseClient(session.access_token);

    // const { error } = await supabaseAuthenticatedClient.functions.invoke('ingest-news', {
    //   body: { clientId },
    // });

    const response = await fetch("http://localhost:3333/v1/api/ingest-news");

    const { error, ...data } = await response.json()

    if (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchNewsSources();
  }, [clientId, user]);

  return {
    newsSources,
    loading,
    error,
    addNewsSource,
    updateNewsSource,
    deleteNewsSource,
    triggerIngestion,
    refetch: fetchNewsSources
  };
}