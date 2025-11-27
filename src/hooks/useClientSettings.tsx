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
      }

      // Buscar dados da base de conhecimento (armazenados em prompt_directives como JSON)
      if (settingsData?.prompt_directives) {
        try {
          const parsedData = JSON.parse(settingsData.prompt_directives);
          setKnowledgeData(parsedData);
        } catch (parseError) {
          console.warn('Erro ao fazer parse dos dados da base de conhecimento:', parseError);
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

  const saveKnowledgeData = async (knowledgeData: KnowledgeBaseData) => {
    if (!clientId || !user) {
      throw new Error('Cliente ou usuário não encontrado');
    }

    try {
      console.log('💾 Salvando base de conhecimento:', { clientId, knowledgeData });

      // Converter dados da base de conhecimento para JSON
      const promptDirectives = JSON.stringify(knowledgeData);
      console.log('📝 JSON gerado:', promptDirectives);

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
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Base de conhecimento salva com sucesso:', data);
      setSettings(data);
      setKnowledgeData(knowledgeData);
      return data;
    } catch (err) {
      console.error('❌ Error saving knowledge data:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [clientId, user]);

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
