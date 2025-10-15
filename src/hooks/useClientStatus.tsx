import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClientStatus {
  isSelected: boolean;
  knowledgeStatus: 'complete' | 'pending' | 'empty';
  knowledgePercentage: number;
  hasNewsSources: boolean;
  hasKnowledgeBase: boolean;
  hasClientInputs: boolean;
  hasSearchAutomation: boolean;
  missingItems: string[];
}

export const useClientStatus = (clientId: string, isSelected: boolean = false) => {
  const [status, setStatus] = useState<ClientStatus>({
    isSelected,
    knowledgeStatus: 'empty',
    knowledgePercentage: 0,
    hasNewsSources: false,
    hasKnowledgeBase: false,
    hasClientInputs: false,
    hasSearchAutomation: false,
    missingItems: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      fetchClientStatus();
    }
  }, [clientId, isSelected]);

  const fetchClientStatus = async () => {
    try {
      setLoading(true);

      // Buscar fontes de notícias
      const { data: newsSources } = await supabase
        .from('news_sources')
        .select('id')
        .eq('client_id', clientId)
        .eq('enabled', true);

      // Buscar base de conhecimento
      const { data: knowledgeBases } = await supabase
        .from('knowledge_bases')
        .select('id')
        .eq('client_id', clientId);

      // Buscar itens da base de conhecimento
      const { data: kbItems } = await supabase
        .from('kb_items')
        .select('id')
        .eq('client_id', clientId);

      // Buscar inputs do cliente
      const { data: clientInputs } = await supabase
        .from('client_inputs')
        .select('id')
        .eq('client_id', clientId);

      // Buscar configurações do cliente (inclui termos/frequências do buscador)
      const { data: clientSettings } = await supabase
        .from('client_settings')
        .select('id, search_terms, search_frequencies')
        .eq('client_id', clientId)
        .single();

      // Buscar integrações de busca
      const { data: searchIntegrations } = await supabase
        .from('search_integrations')
        .select('id, enabled')
        .eq('client_id', clientId);

      const hasNewsSources = (newsSources?.length || 0) > 0;
      const hasKnowledgeBase = (knowledgeBases?.length || 0) > 0;
      const hasKbItems = (kbItems?.length || 0) > 0;
      const hasClientInputs = (clientInputs?.length || 0) > 0;
      const hasSettings = !!clientSettings;
      const hasEnabledIntegration = (searchIntegrations?.filter(i => i.enabled).length || 0) > 0;
      const hasSearchTerms = Array.isArray((clientSettings as any)?.search_terms)
        ? ((clientSettings as any).search_terms as any[]).some((t: any) => !!t?.enabled && !!`${t?.term ?? ''}`.trim())
        : false;
      const hasEnabledFrequency = Array.isArray((clientSettings as any)?.search_frequencies)
        ? ((clientSettings as any).search_frequencies as any[]).some((f: any) => !!f?.enabled)
        : false;
      const hasSearchAutomation = hasEnabledIntegration || (hasSearchTerms && hasEnabledFrequency);

      // Calcular status da base de conhecimento
      let knowledgeStatus: 'complete' | 'pending' | 'empty' = 'empty';
      let knowledgePercentage = 0;
      let missingItems: string[] = [];

      if (!hasKnowledgeBase && !hasKbItems && !hasClientInputs && !hasSettings) {
        knowledgeStatus = 'empty';
        knowledgePercentage = 0;
        missingItems = ['Base de conhecimento', 'Fontes de notícias', 'Configurações', 'Buscador de temas'];
      } else {
        // Calcular porcentagem baseada nos itens disponíveis
        let totalItems = 0;
        let filledItems = 0;

        // Base de conhecimento (peso 3)
        if (hasKnowledgeBase) {
          totalItems += 3;
          if (hasKbItems) filledItems += 3;
          else missingItems.push('Documentos na base de conhecimento');
        } else {
          missingItems.push('Base de conhecimento');
        }

        // Fontes de notícias (peso 2)
        if (hasNewsSources) {
          totalItems += 2;
          filledItems += 2;
        } else {
          totalItems += 2;
          missingItems.push('Fontes de notícias');
        }

        // Inputs do cliente (peso 2)
        if (hasClientInputs) {
          totalItems += 2;
          filledItems += 2;
        } else {
          totalItems += 2;
          missingItems.push('Conteúdo do cliente');
        }

        // Configurações (peso 1)
        if (hasSettings) {
          totalItems += 1;
          filledItems += 1;
        } else {
          totalItems += 1;
          missingItems.push('Configurações do cliente');
        }

        // Buscador de Temas (peso 2)
        totalItems += 2;
        if (hasSearchAutomation) {
          filledItems += 2;
        } else {
          missingItems.push('Buscador de temas');
        }

        knowledgePercentage = totalItems > 0 ? Math.round((filledItems / totalItems) * 100) : 0;

        if (knowledgePercentage >= 80) {
          knowledgeStatus = 'complete';
        } else if (knowledgePercentage >= 30) {
          knowledgeStatus = 'pending';
        } else {
          knowledgeStatus = 'empty';
        }
      }

      setStatus({
        isSelected,
        knowledgeStatus,
        knowledgePercentage,
        hasNewsSources,
        hasKnowledgeBase,
        hasClientInputs,
        hasSearchAutomation,
        missingItems
      });

    } catch (error) {
      console.error('Error fetching client status:', error);
      setStatus({
        isSelected,
        knowledgeStatus: 'empty',
        knowledgePercentage: 0,
        hasNewsSources: false,
        hasKnowledgeBase: false,
        hasClientInputs: false,
        missingItems: ['Erro ao carregar status']
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    loading,
    refetch: fetchClientStatus
  };
};
