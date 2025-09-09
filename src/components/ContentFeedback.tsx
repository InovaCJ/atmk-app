import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Edit2, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ContentFeedbackProps {
  content: any;
  currentRating: number;
  currentFeedback: string;
  onRating: (contentId: number, rating: number) => void;
  onFeedback: (contentId: number, feedback: string) => void;
}

export function ContentFeedback({ 
  content, 
  currentRating, 
  currentFeedback, 
  onRating, 
  onFeedback 
}: ContentFeedbackProps) {
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState(currentFeedback);

  const handleSaveFeedback = () => {
    onFeedback(content.id, feedbackText);
    setIsEditingFeedback(false);
    toast({
      title: "Feedback atualizado",
      description: "Suas alterações foram salvas com sucesso",
    });
  };

  const handleCancelEdit = () => {
    setFeedbackText(currentFeedback);
    setIsEditingFeedback(false);
  };

  return (
    <div className="border-t pt-6 space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Avalie este conteúdo (0 = inútil, 5 = muito útil)
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              variant="ghost"
              size="icon"
              onClick={() => onRating(content.id, star)}
              className="p-1"
            >
              <Star 
                className={`h-5 w-5 ${
                  star <= currentRating 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-gray-300"
                }`} 
              />
            </Button>
          ))}
        </div>
        {currentRating > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Avaliação atual: {currentRating}/5
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">
            Feedback para melhorias
          </label>
          {currentFeedback && !isEditingFeedback && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingFeedback(true)}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Editar
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {isEditingFeedback || !currentFeedback ? (
            <>
              <Textarea
                placeholder="Descreva melhorias que poderiam ser aplicadas neste conteúdo..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveFeedback}
                  disabled={!feedbackText.trim()}
                  size="sm"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {currentFeedback ? "Atualizar" : "Salvar"} Feedback
                </Button>
                {isEditingFeedback && (
                  <Button 
                    variant="outline"
                    onClick={handleCancelEdit}
                    size="sm"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">{currentFeedback}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Seu feedback anterior • Clique em "Editar" para alterar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}