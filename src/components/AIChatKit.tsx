import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, Send } from "lucide-react";

interface AIChatKitProps {
  options: any;
  onSendFallback?: (text: string) => void;
}

export function AIChatKit({ options, onSendFallback }: AIChatKitProps) {
  const [ChatComponent, setChatComponent] = useState<any>(null);
  const [fallbackText, setFallbackText] = useState("");

  useEffect(() => {
    // Temporariamente desabilitado: import do pacote provoca erro de resolução no Vite.
    setChatComponent(null);
  }, []);

  if (ChatComponent) {
    // Renderiza o componente oficial quando disponível
    return <ChatComponent options={options} />;
  }

  // Fallback simples mantendo visual atual
  return (
    <div className="flex items-center gap-2 rounded-lg border px-2 py-2 overflow-x-auto">
      <Button variant="ghost" size="icon">
        <Paperclip className="h-4 w-4" />
      </Button>

      <Textarea
        className="min-h-[40px] max-h-32 text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none resize-none"
        placeholder={
          (options as any)?.composer?.placeholder || "Peça para nossa IA..."
        }
        rows={1}
        value={fallbackText}
        onChange={(e) => setFallbackText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!fallbackText.trim()) return;
            onSendFallback?.(fallbackText);
            setFallbackText("");
          }
        }}
      />

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          className="h-9 w-9"
          onClick={() => {
            if (!fallbackText.trim()) return;
            onSendFallback?.(fallbackText);
            setFallbackText("");
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


