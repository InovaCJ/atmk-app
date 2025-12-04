import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface ContentFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId?: string;
  onFeedbackSubmit?: (feedback: {
    helpsObjective: "yes" | "partial" | "no";
    isClearAndReady: "yes" | "partial" | "no";
    usefulness: number;
  }) => void;
}

export function ContentFeedbackModal({
  isOpen,
  onClose,
  contentId,
  onFeedbackSubmit,
}: ContentFeedbackModalProps) {
  const [helpsObjective, setHelpsObjective] = useState<"yes" | "partial" | "no" | "">("");
  const [isClearAndReady, setIsClearAndReady] = useState<"yes" | "partial" | "no" | "">("");
  const [usefulness, setUsefulness] = useState<number>(0);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!helpsObjective || !isClearAndReady || usefulness === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, responda todas as perguntas antes de enviar o feedback.",
        variant: "destructive",
      });
      return;
    }

    onFeedbackSubmit?.({
      helpsObjective: helpsObjective as "yes" | "partial" | "no",
      isClearAndReady: isClearAndReady as "yes" | "partial" | "no",
      usefulness,
    });

    // Reset form (o toast de sucesso será mostrado no componente pai)
    setHelpsObjective("");
    setIsClearAndReady("");
    setUsefulness(0);
  };

  const handleClose = () => {
    // Reset form on close
    setHelpsObjective("");
    setIsClearAndReady("");
    setUsefulness(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Avaliar Conteúdo</DialogTitle>
          <DialogDescription>
            Sua opinião é importante para melhorarmos a qualidade do conteúdo gerado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pergunta 1 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              O conteúdo ajuda a atingir o objetivo definido?
            </Label>
            <RadioGroup
              value={helpsObjective}
              onValueChange={(value) => setHelpsObjective(value as "yes" | "partial" | "no")}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="objective-yes" />
                <Label htmlFor="objective-yes" className="font-normal cursor-pointer">
                  Sim
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="objective-partial" />
                <Label htmlFor="objective-partial" className="font-normal cursor-pointer">
                  Parcialmente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="objective-no" />
                <Label htmlFor="objective-no" className="font-normal cursor-pointer">
                  Não
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Pergunta 2 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              O conteúdo está claro, contextualizado e pronto para uso?
            </Label>
            <RadioGroup
              value={isClearAndReady}
              onValueChange={(value) => setIsClearAndReady(value as "yes" | "partial" | "no")}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="clear-yes" />
                <Label htmlFor="clear-yes" className="font-normal cursor-pointer">
                  Sim
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="clear-partial" />
                <Label htmlFor="clear-partial" className="font-normal cursor-pointer">
                  Parcialmente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="clear-no" />
                <Label htmlFor="clear-no" className="font-normal cursor-pointer">
                  Não
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Pergunta 3 - Estrelas */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              De 1 a 5, quão útil você considera esse conteúdo?
            </Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setUsefulness(star)}
                  className="p-1 hover:opacity-80 transition-opacity"
                  aria-label={`Avaliar ${star} estrela${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= usefulness
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {usefulness > 0 && (
              <p className="text-sm text-muted-foreground">
                {usefulness >= 4
                  ? "Útil / Muito útil"
                  : usefulness === 3
                  ? "Neutro"
                  : "Pouco útil / Inútil"}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Enviar Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

