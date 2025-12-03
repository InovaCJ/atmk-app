import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface CopyButtonProps {
    content: string;
    className?: string;
}

export function CopyButton({ content, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleCopy}
                        className={cn(
                            "p-1 rounded-md hover:bg-muted transition",
                            className
                        )}
                        aria-label="Copiar conteúdo"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>
                </TooltipTrigger>

                <TooltipContent side="top" align="center">
                    <p>{copied ? "Copiado!" : "Copiar conteúdo"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
