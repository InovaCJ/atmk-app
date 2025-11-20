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
    if (!companyId) {
      console.log('No companyId provided to fetchKnowledgeItems');
      return;
    }

    console.log('Fetching knowledge items for company:', companyId);

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('knowledge_bases')
        .select('*')
        .eq('client_id', companyId)
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

      console.log('Fetched knowledge items:', data);
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
    console.log('Searching for knowledge item with type:', contentType);
    console.log('Available items:', items.map(item => ({ id: item.id, type: item.content_type, title: item.title })));
    const found = items.find(item => item.content_type === contentType);
    console.log('Found item:', found ? { id: found.id, type: found.content_type, hasMetadata: !!found.metadata } : 'Not found');
    return found;
  };

  const saveOnboardingData = async (data: any, companyName: string) => {
    return await createOrUpdateKnowledgeItem(
      `Onboarding - ${companyName}`,
      data,
      'onboarding_data',
      ['onboarding', 'brand', 'business', 'audience']
    );
  };

  const saveOnboardingDataForCompany = async (data: any, companyName: string, targetCompanyId: string) => {
    if (!user || !targetCompanyId) {
      console.error('User or company ID not available');
      return null;
    }

    try {
      const title = `Onboarding - ${companyName}`;
      const tags = ['onboarding', 'brand', 'business', 'audience'];

      // Check if item already exists
      const { data: existing } = await supabase
        .from('knowledge_base')
        .select('id')
        .eq('company_id', targetCompanyId)
        .eq('content_type', 'onboarding_data')
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing
        const { data: updated, error } = await supabase
          .from('knowledge_base')
          .update({
            title,
            content: JSON.stringify(data),
            metadata: data,
            tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = updated;
      } else {
        // Create new
        const { data: created, error } = await supabase
          .from('knowledge_base')
          .insert({
            company_id: targetCompanyId,
            title,
            content: JSON.stringify(data),
            content_type: 'onboarding_data',
            metadata: data,
            tags
          })
          .select()
          .single();

        if (error) throw error;
        result = created;
      }

      toast({
        title: "Sucesso",
        description: "Dados do onboarding salvos com sucesso!"
      });

      return result;
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados do onboarding.",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    items,
    loading,
    createOrUpdateKnowledgeItem,
    deleteKnowledgeItem,
    getKnowledgeItemByType,
    saveOnboardingData,
    saveOnboardingDataForCompany,
    refreshKnowledgeItems: fetchKnowledgeItems
  };
};