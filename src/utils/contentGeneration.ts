import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface GenerationConfig {
  opportunityId: string;
  contentType: string;
  companyId: string;
}

export async function generateContentWithAI(config: GenerationConfig) {
  try {
    console.log('Iniciando geração de conteúdo com IA...', config);

    toast({
      title: "Gerando conteúdo...",
      description: "Nossa IA está criando seu conteúdo personalizado. Isso pode levar alguns segundos.",
    });

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: config
    });

    if (error) {
      console.error('Error calling edge function:', error);
      throw new Error(error.message || 'Erro na geração de conteúdo');
    }

    if (!data.success) {
      throw new Error(data.error || 'Erro desconhecido na geração');
    }

    console.log('Conteúdo gerado com sucesso:', data.content);

    toast({
      title: "Conteúdo gerado!",
      description: "Seu conteúdo foi criado e salvo na biblioteca.",
    });

    return data.content;

  } catch (error) {
    console.error('Error generating content:', error);
    
    toast({
      title: "Erro na geração",
      description: error instanceof Error ? error.message : "Erro desconhecido ao gerar conteúdo",
      variant: "destructive"
    });
    
    throw error;
  }
}