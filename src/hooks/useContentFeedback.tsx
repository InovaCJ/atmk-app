import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface FeedbackData {
  helpsObjective: "yes" | "partial" | "no";
  isClearAndReady: "yes" | "partial" | "no";
  usefulness: number;
}

export function useContentFeedback() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const saveFeedback = async (
    generatedContentId: string,
    messageId: string | null,
    feedback: FeedbackData
  ) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para enviar feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Buscar informações do conteúdo gerado
      console.log("[FEEDBACK] Buscando informações do conteúdo:", generatedContentId);
      const { data: contentData, error: contentError } = await supabase
        .from("generated_content")
        .select("client_id, objective, type")
        .eq("id", generatedContentId)
        .single();

      if (contentError) {
        console.error("[FEEDBACK] Erro ao buscar conteúdo:", contentError);
        throw new Error("Erro ao buscar informações do conteúdo");
      }

      console.log("[FEEDBACK] Dados do conteúdo encontrados:", contentData);

      // 2. Verificar se há news_item_id relacionado
      // Por enquanto, vamos deixar null, mas pode ser implementado se houver uma relação direta
      const newsItemId = null;

      // 3. Preparar dados para inserção
      const feedbackData = {
        user_id: user.id,
        generated_content_id: generatedContentId,
        message_id: messageId,
        client_id: contentData?.client_id || null,
        news_item_id: newsItemId,
        objective: contentData?.objective || null,
        content_type: contentData?.type || null,
        helps_objective: feedback.helpsObjective,
        is_clear_and_ready: feedback.isClearAndReady,
        usefulness: feedback.usefulness,
      };

      console.log("[FEEDBACK] Dados a serem inseridos:", feedbackData);

      // 4. Salvar o feedback
      const { data, error } = await supabase
        .from("content_feedback")
        .insert(feedbackData)
        .select()
        .single();

      if (error) {
        console.error("[FEEDBACK] Erro ao salvar feedback:", error);
        console.error("[FEEDBACK] Detalhes do erro:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log("[FEEDBACK] Feedback salvo com sucesso:", data);
      return data;
    } catch (error: any) {
      console.error("Erro ao salvar feedback:", error);
      toast({
        title: "Erro ao salvar feedback",
        description: error?.message || "Ocorreu um erro ao salvar seu feedback. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveFeedback,
    isLoading,
  };
}

