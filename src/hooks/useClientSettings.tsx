import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useClients } from './useClients';

interface ClientSettings {
  id?: string;
  client_id: string;
  tone_of_voice?: string;
  style_guidelines?: string;
  prompt_directives?: string;
  locale?: string;
  created_at?: string;
  updated_at?: string;
}

interface KnowledgeBaseData {
  // 1. Posicionamento e Personalidade
  positioning: {
    valueProposition: string;
    differentiators: string[];
    personality: {
      formalVsInformal: number;
      technicalVsAccessible: number;
      seriousVsHumorous: number;
    };
    wordsWeUse: string[];
    bannedWords: string[];
  };

  // 2. Negócio e Oferta
  business: {
    sector: string;
    market: string;
    categoryMaturity: string;
    regulatoryStatus: string;
    products: Array<{
      name: string;
      features: string[];
      benefits: string[];
      pricing: string;
    }>;
  };

  // 3. Público-Alvo
  audience: {
    primary: {
      demographics: string;
      psychographics: string;
      painPoints: string[];
      goals: string[];
    };
    secondary: {
      demographics: string;
      psychographics: string;
      painPoints: string[];
      goals: string[];
    };
  };

  // 4. Conteúdo e Tom
  content: {
    toneOfVoice: string;
    styleGuidelines: string;
    contentTypes: string[];
    keyMessages: string[];
    examples: string[];
  };
}

export function useClientSettings(clientId: string) {
  const [settings, setSettings] = useState<ClientSettings | null>(null);
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeBaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { hasClients } = useClients();

  const fetchSettings = async () => {
    if (!clientId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!hasClients) {
        console.log('Skipping fetchSettings, clients not loaded yet');
        return;
      }

      // Buscar configurações do cliente
      const { data: settingsData, error: settingsError } = await supabase
        .from('client_settings')
        .select('*')
        .eq('client_id', clientId)
        .single();


      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      setSettings(settingsData);

      // Se não existir configurações, criar uma padrão
      if (!settingsData) {
        const { data: newSettings, error: createError } = await supabase
          .from('client_settings')
          .insert({
            client_id: clientId,
            tone_of_voice: 'Claro e objetivo',
            style_guidelines: 'Evite jargões desnecessários',
            locale: 'pt-BR'
          })
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
        // Se criou novo registro, não há dados de conhecimento ainda
        setKnowledgeData(null);
      } else {
        // Buscar dados da base de conhecimento (armazenados em prompt_directives como JSON)
        if (settingsData.prompt_directives && settingsData.prompt_directives.trim()) {
          try {
            console.log('📖 [LOAD] Carregando base de conhecimento:', {
              clientId,
              hasPromptDirectives: true,
              promptDirectivesLength: settingsData.prompt_directives.length,
              firstChars: settingsData.prompt_directives.substring(0, 200),
              lastChars: settingsData.prompt_directives.substring(Math.max(0, settingsData.prompt_directives.length - 200))
            });
            
            const parsedData = JSON.parse(settingsData.prompt_directives);
            
            // Validar estrutura básica
            if (!parsedData || typeof parsedData !== 'object') {
              throw new Error('Dados parseados não são um objeto válido');
            }
            
            console.log('✅ [LOAD] Base de conhecimento parseada com sucesso:', {
              clientId,
              keys: Object.keys(parsedData),
              hasPositioning: !!parsedData.positioning,
              hasBusiness: !!parsedData.business,
              hasAudience: !!parsedData.audience,
              hasSeo: !!parsedData.seo,
              valueProposition: parsedData.positioning?.valueProposition?.substring(0, 50) || 'vazio',
              sector: parsedData.business?.sector || 'vazio',
              differentiatorsCount: parsedData.positioning?.differentiators?.length || 0
            });
            
            setKnowledgeData(parsedData);
            setError(null); // Limpar erros anteriores
          } catch (parseError) {
            console.error('❌ [LOAD] Erro ao fazer parse dos dados da base de conhecimento:', {
              clientId,
              error: parseError,
              errorMessage: parseError instanceof Error ? parseError.message : String(parseError),
              promptDirectivesLength: settingsData.prompt_directives?.length,
              firstChars: settingsData.prompt_directives?.substring(0, 200),
              lastChars: settingsData.prompt_directives?.substring(Math.max(0, settingsData.prompt_directives.length - 200))
            });
            setError('Erro ao carregar base de conhecimento: dados corrompidos');
            setKnowledgeData(null);
          }
        } else {
          console.log('ℹ️ [LOAD] Nenhuma base de conhecimento encontrada:', {
            clientId,
            hasPromptDirectives: !!settingsData.prompt_directives,
            isEmpty: !settingsData.prompt_directives || settingsData.prompt_directives.trim() === ''
          });
          setKnowledgeData(null);
          setError(null); // Não é um erro, apenas não há dados ainda
        }
      }

    } catch (err) {
      console.error('Error fetching client settings:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<ClientSettings>) => {
    if (!clientId || !user) {
      throw new Error('Cliente ou usuário não encontrado');
    }

    try {
      const { data, error } = await supabase
        .from('client_settings')
        .upsert({
          client_id: clientId,
          ...newSettings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      return data;
    } catch (err) {
      console.error('Error saving client settings:', err);
      throw err;
    }
  };

  const saveKnowledgeData = async (knowledgeData: any) => {
    if (!clientId || !user) {
      const errorMsg = 'Cliente ou usuário não encontrado';
      console.error('❌', errorMsg, { clientId, hasUser: !!user });
      throw new Error(errorMsg);
    }

    try {
      console.log('💾 [SAVE] Iniciando salvamento da base de conhecimento:', { 
        clientId, 
        knowledgeDataKeys: Object.keys(knowledgeData),
        timestamp: new Date().toISOString()
      });

      // Converter dados da base de conhecimento para JSON
      const promptDirectives = JSON.stringify(knowledgeData);
      console.log('📝 [SAVE] JSON gerado (primeiros 500 chars):', promptDirectives.substring(0, 500));

      const { data, error } = await supabase
        .from('client_settings')
        .upsert({
          client_id: clientId,
          prompt_directives: promptDirectives,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'client_id'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [SAVE] Erro do Supabase:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ [SAVE] Base de conhecimento salva com sucesso:', {
        id: data?.id,
        client_id: data?.client_id,
        hasPromptDirectives: !!data?.prompt_directives,
        promptDirectivesLength: data?.prompt_directives?.length,
        updated_at: data?.updated_at
      });

      // Verificar se os dados foram realmente salvos
      if (!data?.prompt_directives) {
        console.warn('⚠️ [SAVE] Dados salvos mas prompt_directives não encontrado na resposta');
      }

      // Parse dos dados salvos para garantir que estão corretos
      let parsedSavedData = null;
      if (data?.prompt_directives) {
        try {
          parsedSavedData = JSON.parse(data.prompt_directives);
          console.log('✅ [SAVE] Dados parseados da resposta do servidor:', {
            clientId,
            keys: Object.keys(parsedSavedData),
            hasPositioning: !!parsedSavedData.positioning,
            hasBusiness: !!parsedSavedData.business,
            hasAudience: !!parsedSavedData.audience,
            hasSeo: !!parsedSavedData.seo,
            valueProposition: parsedSavedData.positioning?.valueProposition?.substring(0, 50) || 'vazio'
          });
          
          // Validar que os dados salvos correspondem aos enviados
          const savedJson = JSON.stringify(parsedSavedData);
          const sentJson = JSON.stringify(knowledgeData);
          if (savedJson !== sentJson) {
            console.warn('⚠️ [SAVE] Diferença detectada entre dados enviados e salvos:', {
              savedLength: savedJson.length,
              sentLength: sentJson.length
            });
          } else {
            console.log('✅ [SAVE] Dados salvos correspondem exatamente aos enviados');
          }
        } catch (parseError) {
          console.error('❌ [SAVE] Erro ao parsear dados salvos:', {
            clientId,
            error: parseError
          });
        }
      }

      // Atualizar estado local com os dados salvos (usar dados parseados se disponível, senão usar os enviados)
      setSettings(data);
      setKnowledgeData(parsedSavedData || knowledgeData);
      
      // Aguardar um pouco antes de recarregar para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Recarregar dados do servidor para garantir sincronização completa
      console.log('🔄 [SAVE] Recarregando dados do servidor após salvamento...');
      await fetchSettings();
      console.log('✅ [SAVE] Recarregamento concluído');
      
      return data;
    } catch (err) {
      console.error('❌ [SAVE] Error saving knowledge data:', {
        error: err,
        clientId,
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        errorMessage: err instanceof Error ? err.message : String(err)
      });
      throw err;
    }
  };

  useEffect(() => {
    if (clientId && user && hasClients) {
      fetchSettings();
    } else if (!hasClients) {
      // Se clients ainda não foram carregados, não fazer nada
      setLoading(true);
    }
  }, [clientId, user, hasClients]);

  return {
    settings,
    knowledgeData,
    loading,
    error,
    saveSettings,
    saveKnowledgeData,
    refetch: fetchSettings
  };
}
