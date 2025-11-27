import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClientContext } from '@/contexts/ClientContext';
import { toast } from '@/hooks/use-toast';

export interface ContentItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: "post" | "carousel" | "scriptShort" | "scriptYoutube" | "blog" | "email"
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  // ai_model?: string;
  created_at: string;
  updated_at: string;
  // hashtags?: string[];
  // media_urls?: string[];
  // platform?: string[];
  // scheduled_for?: string;
}

export function useContentLibrary() {
  const { selectedClientId } = useClientContext();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = async () => {
    if (!selectedClientId) {
      setContents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        // .eq('company_id', selectedClientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContents(data as ContentItem[]);
    } catch (err) {
      console.error('Error fetching content library:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar biblioteca');
      // toast({
      //   title: "Erro ao carregar",
      //   description: "Não foi possível buscar os conteúdos.",
      //   variant: "destructive"
      // });
    } finally {
      setLoading(false);
    }
  };

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
  }, [selectedClientId]);

  return {
    contents,
    loading,
    error,
    deleteContent,
    refresh: fetchContents
  };
}