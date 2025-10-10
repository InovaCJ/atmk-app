import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, ChevronUp, ChevronDown, BookOpen, Target, Users, Search, FileText, Palette } from "lucide-react";
import { useClientKnowledgeValidation } from "@/hooks/useClientKnowledgeValidation";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useNavigate } from "react-router-dom";

export function FloatingKnowledgeButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedCompany: currentCompany } = useCompanyContext();
  const { completionPercentage, missingFields, canGenerateContent } = useClientKnowledgeValidation(currentCompany?.id);
  const navigate = useNavigate();

  // Se já pode gerar conteúdo, não mostrar o botão
  if (canGenerateContent) {
    return null;
  }

  const getFieldIcon = (field: string) => {
    const icons: Record<string, any> = {
      'mission': Target,
      'vision': Target,
      'values': Target,
      'differentials': Palette,
      'products': FileText,
      'services': FileText,
      'targetAudience': Users,
      'personas': Users,
      'keywords': Search,
      'competitors': Users,
      'contentTypes': FileText,
      'toneOfVoice': Palette
    };
    
    const IconComponent = icons[field] || BookOpen;
    return <IconComponent className="h-4 w-4" />;
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      'mission': 'Missão',
      'vision': 'Visão', 
      'values': 'Valores',
      'differentials': 'Diferenciais',
      'products': 'Produtos',
      'services': 'Serviços',
      'targetAudience': 'Público-alvo',
      'personas': 'Personas',
      'keywords': 'Palavras-chave',
      'competitors': 'Concorrentes',
      'contentTypes': 'Tipos de conteúdo',
      'toneOfVoice': 'Tom de voz'
    };
    
    return labels[field] || field;
  };

  const handleComplete = () => {
    navigate('/knowledge');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Card expandido */}
      {isExpanded && (
        <Card className="mb-4 w-80 bg-card/95 backdrop-blur-sm border shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Complete sua base de conhecimento</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progresso</span>
                  <span>{Math.round(completionPercentage)}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
              
              {missingFields.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Campos pendentes:
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {missingFields.slice(0, 4).map((field) => (
                      <div key={field} className="flex items-center gap-2 text-xs">
                        {getFieldIcon(field)}
                        <span>{getFieldLabel(field)}</span>
                      </div>
                    ))}
                    {missingFields.length > 4 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{missingFields.length - 4} outros campos
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleComplete}
                size="sm" 
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Completar agora
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Botão flutuante */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="rounded-full h-14 w-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        <div className="flex flex-col items-center">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <>
              <BookOpen className="h-5 w-5" />
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-orange-500 hover:bg-orange-500 text-white border-0"
              >
                {Math.round(completionPercentage)}%
              </Badge>
            </>
          )}
        </div>
      </Button>
    </div>
  );
}