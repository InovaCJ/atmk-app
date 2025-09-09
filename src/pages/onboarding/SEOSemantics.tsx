import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Search, TrendingUp } from "lucide-react";
import { SEOData } from "@/types/onboarding";

interface SEOSemanticsProps {
  onNext: (data: SEOData) => void;
  onBack: () => void;
  onSkip: () => void;
  initialData?: Partial<SEOData>;
}

export function SEOSemantics({ onNext, onBack, onSkip, initialData = {} }: SEOSemanticsProps) {
  const [formData, setFormData] = useState<SEOData>({
    keywords: initialData.keywords || [],
    searchIntents: initialData.searchIntents || []
  });

  const [newKeyword, setNewKeyword] = useState({
    keyword: "",
    searchVolume: 0,
    difficulty: 1,
    intent: 'informational' as 'informational' | 'commercial' | 'transactional' | 'navigational'
  });
  const [newSearchIntent, setNewSearchIntent] = useState("");

  const addKeyword = () => {
    if (newKeyword.keyword.trim()) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, {
          keyword: newKeyword.keyword.trim(),
          searchVolume: newKeyword.searchVolume,
          difficulty: newKeyword.difficulty,
          intent: newKeyword.intent
        }]
      }));
      setNewKeyword({
        keyword: "",
        searchVolume: 0,
        difficulty: 1,
        intent: 'informational'
      });
    }
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const addSearchIntent = () => {
    if (newSearchIntent.trim()) {
      setFormData(prev => ({
        ...prev,
        searchIntents: [...prev.searchIntents, newSearchIntent.trim()]
      }));
      setNewSearchIntent("");
    }
  };

  const removeSearchIntent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      searchIntents: prev.searchIntents.filter((_, i) => i !== index)
    }));
  };

  const getIntentColor = (intent: string) => {
    const colors = {
      informational: "bg-blue-100 text-blue-800 border-blue-200",
      commercial: "bg-yellow-100 text-yellow-800 border-yellow-200",
      transactional: "bg-green-100 text-green-800 border-green-200",
      navigational: "bg-purple-100 text-purple-800 border-purple-200"
    };
    return colors[intent as keyof typeof colors] || colors.informational;
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "text-green-600";
    if (difficulty <= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const handleNext = () => {
    onNext(formData);
  };

  const isFormValid = formData.keywords.length > 0 || formData.searchIntents.length > 0;

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={6}
      title="SEO & Semântica"
      description="Defina palavras-chave e intenções de busca para otimizar seu conteúdo"
      onNext={handleNext}
      onBack={onBack}
      onSkip={onSkip}
      isNextEnabled={isFormValid}
    >
      <div className="space-y-8">
        {/* Palavras-chave */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Palavras-chave Principais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Ex: marketing digital, gestão de vendas..."
                value={newKeyword.keyword}
                onChange={(e) => setNewKeyword(prev => ({ ...prev, keyword: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                className="flex-1"
              />
              <Button type="button" onClick={addKeyword}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="pr-1">
                  {keyword.keyword}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 ml-1"
                    onClick={() => removeKeyword(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Intenções de Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Intenções de Busca</CardTitle>
            <p className="text-sm text-muted-foreground">
              Frases que seu público digitaria no Google para encontrar seu produto ou serviço
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ex: como aumentar vendas online com marketing digital"
                value={newSearchIntent}
                onChange={(e) => setNewSearchIntent(e.target.value)}
                className="min-h-[80px]"
              />
              <Button type="button" onClick={addSearchIntent}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {formData.searchIntents.map((intent, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-accent/5 rounded-lg">
                  <p className="text-sm italic">"{intent}"</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSearchIntent(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {formData.searchIntents.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Adicione frases que seu público digitaria para encontrar você</p>
                <p className="text-xs mt-2">
                  Exemplos: "melhor ferramenta de marketing", "como fazer gestão financeira"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dicas SEO */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-2">💡 Dicas para SEO efetivo</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Foque em palavras-chave de cauda longa (3+ palavras) para menos concorrência</li>
                  <li>• Misture intenções informacionais (educar) e comerciais (vender)</li>
                  <li>• Considere variações regionais das suas palavras-chave</li>
                  <li>• Use ferramentas como Google Keyword Planner para volumes mais precisos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}