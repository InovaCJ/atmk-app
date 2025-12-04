import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClientSettings } from './useClientSettings';

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
  
  // Buscar dados da base de conhecimento para calcular completude real
  const { knowledgeData, loading: knowledgeLoading } = useClientSettings(clientId);

  useEffect(() => {
    if (clientId) {
      fetchClientStatus();
    }
  }, [clientId, isSelected, knowledgeData, knowledgeLoading]);

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

      // Buscar configurações do cliente (inclui termos/frequências do buscador e base de conhecimento)
      const { data: clientSettings, error: settingsError } = await supabase
        .from('client_settings')
        .select('id, search_terms, search_frequencies, prompt_directives')
        .eq('client_id', clientId)
        .single();

      console.log('🔍 [STATUS] Buscando configurações do cliente:', {
        clientId,
        hasSettings: !!clientSettings,
        hasPromptDirectives: !!clientSettings?.prompt_directives,
        promptDirectivesLength: clientSettings?.prompt_directives?.length,
        settingsError: settingsError?.message
      });

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

      // Verificar completude real da base de conhecimento (prompt_directives)
      let knowledgeBaseCompletion = 0;
      let knowledgeBaseFields = 0;
      const knowledgeBaseMissing: string[] = [];

      if (knowledgeData && !knowledgeLoading) {
        // 1. Posicionamento e Personalidade (5 campos)
        knowledgeBaseFields += 5;
        if (knowledgeData.positioning?.valueProposition?.trim()) knowledgeBaseCompletion++;
        else knowledgeBaseMissing.push('Proposta de valor');

        if (knowledgeData.positioning?.differentiators?.length > 0 && 
            knowledgeData.positioning.differentiators.some(d => d.trim())) {
          knowledgeBaseCompletion++;
        } else {
          knowledgeBaseMissing.push('Diferenciais');
        }

        if (knowledgeData.positioning?.wordsWeUse?.length > 0 && 
            knowledgeData.positioning.wordsWeUse.some(w => w.trim())) {
          knowledgeBaseCompletion++;
        } else {
          knowledgeBaseMissing.push('Palavras que usamos');
        }

        if (knowledgeData.positioning?.bannedWords?.length > 0 && 
            knowledgeData.positioning.bannedWords.some(w => w.trim())) {
          knowledgeBaseCompletion++;
        } else {
          knowledgeBaseMissing.push('Palavras banidas');
        }

        const personality = knowledgeData.positioning?.personality;
        if (personality && 
            (personality.formalVsInformal !== 50 || 
             personality.technicalVsAccessible !== 50 || 
             personality.seriousVsHumorous !== 50)) {
          knowledgeBaseCompletion++;
        } else {
          knowledgeBaseMissing.push('Personalidade da marca');
        }

        // 2. Negócio e Oferta (5 campos)
        knowledgeBaseFields += 5;
        if (knowledgeData.business?.sector?.trim()) knowledgeBaseCompletion++;
        else knowledgeBaseMissing.push('Setor');

        if (knowledgeData.business?.market?.trim()) knowledgeBaseCompletion++;
        else knowledgeBaseMissing.push('Mercado');

        if (knowledgeData.business?.categoryMaturity?.trim()) knowledgeBaseCompletion++;
        else knowledgeBaseMissing.push('Maturidade da categoria');

        if (knowledgeData.business?.products?.length > 0 && 
            knowledgeData.business.products.some(p => p.name?.trim())) {
          knowledgeBaseCompletion++;
        } else {
          knowledgeBaseMissing.push('Produtos');
        }

        // Verificar serviços - pode ter name ou description
        if (knowledgeData.business?.services?.length > 0 && 
            knowledgeData.business.services.some(s => (s.name?.trim() || (s as any).description?.trim()))) {
          knowledgeBaseCompletion++;
        } else {
          knowledgeBaseMissing.push('Serviços');
        }

        // 3. Público-Alvo (3 campos)
        knowledgeBaseFields += 3;
        const demographicProfile = knowledgeData.audience?.demographicProfile;
        if (demographicProfile && 
            (demographicProfile.ageRange?.trim() || 
             demographicProfile.gender?.trim() || 
             demographicProfile.income?.trim() || 
             demographicProfile.education?.trim() || 
             demographicProfile.location?.trim())) {
          knowledgeBaseCompletion++;
        } else {
          knowledgeBaseMissing.push('Perfil demográfico');
        }

        if (knowledgeData.audience?.personas?.length > 0 && 
            knowledgeData.audience.personas.some(p => p.name?.trim())) {
          knowledgeBaseCompletion++;
        } else {
          knowledgeBaseMissing.push('Personas');
        }

        if (knowledgeData.audience?.faqs?.length > 0 && 
            knowledgeData.audience.faqs.some(f => f.question?.trim())) {
          knowledgeBaseCompletion++;
        } else {
          knowledgeBaseMissing.push('Perguntas frequentes');
        }

        // 4. SEO (2 campos)
        knowledgeBaseFields += 2;
        if (knowledgeData.seo?.mainKeywords?.length > 0 && 
            knowledgeData.seo.mainKeywords.some(k => k.trim())) {
          knowledgeBaseCompletion++;
        } else {
          knowledgeBaseMissing.push('Palavras-chave principais');
        }

        if (knowledgeData.seo?.searchIntents?.length > 0 && 
            knowledgeData.seo.searchIntents.some(s => s.trim())) {
          knowledgeBaseCompletion++;
        } else {
          knowledgeBaseMissing.push('Intenções de busca');
        }
      }

      // Calcular porcentagem baseada na completude real da base de conhecimento
      const knowledgeBasePercentage = knowledgeBaseFields > 0 
        ? Math.round((knowledgeBaseCompletion / knowledgeBaseFields) * 100) 
        : 0;

      console.log('📊 [STATUS] Cálculo de completude da base de conhecimento:', {
        clientId,
        knowledgeBaseCompletion,
        knowledgeBaseFields,
        knowledgeBasePercentage: `${knowledgeBasePercentage}%`,
        missingFields: knowledgeBaseMissing,
        hasKnowledgeData: !!knowledgeData,
        knowledgeLoading
      });

      // Se não há dados da base de conhecimento, usar cálculo antigo baseado em estruturas
      if (!knowledgeData || knowledgeLoading) {
        if (!hasKnowledgeBase && !hasKbItems && !hasClientInputs && !hasSettings) {
          knowledgeStatus = 'empty';
          knowledgePercentage = 0;
          missingItems = ['Base de conhecimento', 'Fontes de notícias', 'Configurações', 'Buscador de temas'];
        } else {
          // Calcular porcentagem baseada nos itens disponíveis (método antigo)
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
        }
      } else {
        // Usar a porcentagem real da base de conhecimento
        knowledgePercentage = knowledgeBasePercentage;
        missingItems = knowledgeBaseMissing;
      }

      // Determinar status baseado na porcentagem
      if (knowledgePercentage >= 80) {
        knowledgeStatus = 'complete';
      } else if (knowledgePercentage >= 30) {
        knowledgeStatus = 'pending';
      } else {
        knowledgeStatus = 'empty';
      }

      console.log('📊 [STATUS] Status final calculado:', {
        clientId,
        knowledgePercentage: `${knowledgePercentage}%`,
        knowledgeStatus,
        missingItems,
        hasKnowledgeBase,
        hasNewsSources,
        hasClientInputs,
        hasSearchAutomation
      });

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
