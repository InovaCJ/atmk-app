import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeItem {
  id: string;
  company_id: string;
  title: string;
  content: string;
  content_type: string | null;
  source_url: string | null;
  tags: string[] | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useKnowledgeBase = (companyId?: string) => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && companyId) {
      fetchKnowledgeItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user, companyId]);

  const fetchKnowledgeItems = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('company_id', companyId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching knowledge items:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar base de conhecimento.",
          variant: "destructive"
        });
        return;
      }

      setItems(data || []);
    } catch (error) {
      console.error('Error fetching knowledge items:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar base de conhecimento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateKnowledgeItem = async (
    title: string,
    content: any,
    contentType: string,
    tags: string[] = [],
    existingId?: string
  ) => {
    if (!companyId) return null;

    try {
      const itemData = {
        company_id: companyId,
        title,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        content_type: contentType,
        tags,
        metadata: typeof content === 'object' ? content : {},
      };

      let data, error;

      if (existingId) {
        // Update existing item
        ({ data, error } = await supabase
          .from('knowledge_base')
          .update(itemData)
          .eq('id', existingId)
          .select()
          .single());
      } else {
        // Create new item
        ({ data, error } = await supabase
          .from('knowledge_base')
          .insert(itemData)
          .select()
          .single());
      }

      if (error) {
        console.error('Error creating/updating knowledge item:', error);
        toast({
          title: "Erro",
          description: `Erro ao ${existingId ? 'atualizar' : 'criar'} item da base de conhecimento.`,
          variant: "destructive"
        });
        return null;
      }

      // Update local state
      if (existingId) {
        setItems(prev => prev.map(item => 
          item.id === existingId ? data : item
        ));
        toast({
          title: "Sucesso",
          description: "Base de conhecimento atualizada com sucesso!"
        });
      } else {
        setItems(prev => [data, ...prev]);
        toast({
          title: "Sucesso",
          description: "Item adicionado à base de conhecimento!"
        });
      }

      return data;
    } catch (error) {
      console.error('Error creating/updating knowledge item:', error);
      toast({
        title: "Erro",
        description: `Erro inesperado ao ${existingId ? 'atualizar' : 'criar'} item.`,
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteKnowledgeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting knowledge item:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir item da base de conhecimento.",
          variant: "destructive"
        });
        return;
      }

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sucesso",
        description: "Item excluído da base de conhecimento!"
      });
    } catch (error) {
      console.error('Error deleting knowledge item:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir item.",
        variant: "destructive"
      });
    }
  };

  const getKnowledgeItemByType = (contentType: string) => {
    return items.find(item => item.content_type === contentType);
  };

  const saveOnboardingData = async (data: any, companyName: string) => {
    return await createOrUpdateKnowledgeItem(
      `Onboarding - ${companyName}`,
      data,
      'onboarding_data',
      ['onboarding', 'brand', 'business', 'audience']
    );
  };

  return {
    items,
    loading,
    createOrUpdateKnowledgeItem,
    deleteKnowledgeItem,
    getKnowledgeItemByType,
    saveOnboardingData,
    refreshKnowledgeItems: fetchKnowledgeItems
  };
};