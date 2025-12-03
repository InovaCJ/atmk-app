import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClientContext } from '@/contexts/ClientContext';
import { toast } from '@/hooks/use-toast';

export interface ContentItem {
  id: string;
  user_id: string;
  client_id?: string | null;
  title: string;
  content: string;
  category: "post" | "carousel" | "scriptShort" | "scriptYoutube" | "blog" | "email";
  type: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  // ai_model?: string;
  created_at: string;
  updated_at: string;
  media_urls?: string[];
  // platform?: string[];
  // scheduled_for?: string;
}

export function useContentLibrary() {
  const { selectedClientId } = useClientContext();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = useCallback(async () => {
    if (!selectedClientId) {
      setContents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar conteúdos diretamente filtrados por client_id
      // Isso garante isolamento completo entre clientes
      const { data: contents, error: contentsError } = await supabase
        .from('generated_content')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('created_at', { ascending: false });

      if (contentsError) throw contentsError;

      setContents((contents || []) as ContentItem[]);
    } catch (err) {
      console.error('Error fetching content library:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar biblioteca');
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContents(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting content:', err);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o conteúdo.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Recarregar quando o cliente mudar
  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  return {
    contents,
    loading,
    error,
    deleteContent,
    refresh: fetchContents
  };
}