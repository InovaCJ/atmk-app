import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
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
      <Input
        className="h-9 text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
        placeholder={
          (options as any)?.composer?.placeholder || "Peça para nossa IA..."
        }
        value={fallbackText}
        onChange={(e) => setFallbackText(e.target.value)}
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


