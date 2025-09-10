import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { BrandIdentityData } from "@/types/onboarding";

interface BrandIdentityProps {
  onNext: (data: BrandIdentityData) => void;
  onBack: () => void;
  onSkip: () => void;
  initialData?: Partial<BrandIdentityData>;
}

export function BrandIdentity({ onNext, onBack, onSkip, initialData = {} }: BrandIdentityProps) {
  const [formData, setFormData] = useState<BrandIdentityData>({
    valueProposition: initialData.valueProposition || "",
    differentials: initialData.differentials || [],
    personalityScales: initialData.personalityScales || {
      formalInformal: 3,
      technicalAccessible: 3,
      seriousFun: 3
    },
    wordsToUse: initialData.wordsToUse || [],
    wordsToBan: initialData.wordsToBan || []
  });

  const [newDifferential, setNewDifferential] = useState("");
  const [newWordToUse, setNewWordToUse] = useState("");
  const [newWordToBan, setNewWordToBan] = useState("");

  const addItem = (field: keyof BrandIdentityData, value: string, setter: (value: string) => void) => {
    if (value.trim() && Array.isArray(formData[field])) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
      setter("");
    }
  };

  const removeItem = (field: keyof BrandIdentityData, index: number) => {
    if (Array.isArray(formData[field])) {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((_, i) => i !== index)
      }));
    }
  };

  const addMessagePillar = () => {
    // Removed - message pillars not needed anymore
  };

  const handleNext = () => {
    onNext(formData);
  };

  const isFormValid = Boolean(formData.valueProposition || formData.differentials.length > 0 || formData.wordsToUse.length > 0);

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={6}
      title="Posicionamento e Personalidade"
      description="Defina como sua marca se posiciona no mercado e sua personalidade de comunicação"
      onNext={handleNext}
      onBack={onBack}
      onSkip={onSkip}
      isNextEnabled={isFormValid}
    >
      <div className="space-y-8">
        {/* Posicionamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Posicionamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="valueProposition">Proposta de Valor</Label>
              <Textarea
                id="valueProposition"
                placeholder="O que nos torna únicos e valiosos para nossos clientes..."
                value={formData.valueProposition}
                onChange={(e) => setFormData(prev => ({ ...prev, valueProposition: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="differentials">Diferenciais (USPs)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar diferencial..."
                  value={newDifferential}
                  onChange={(e) => setNewDifferential(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('differentials', newDifferential, setNewDifferential)}
                />
                <Button type="button" onClick={() => addItem('differentials', newDifferential, setNewDifferential)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.differentials.map((diff, index) => (
                  <Badge key={index} variant="outline" className="pr-1">
                    {diff}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removeItem('differentials', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personalidade & Tom de Voz */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personalidade & Tom de Voz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Formal ↔ Informal</Label>
                <Slider
                  value={[formData.personalityScales.formalInformal]}
                  onValueChange={([value]) => 
                    setFormData(prev => ({
                      ...prev,
                      personalityScales: { ...prev.personalityScales, formalInformal: value }
                    }))
                  }
                  max={5}
                  min={1}
                  step={0.1}
                  className="w-full [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Muito Formal</span>
                  <span>Muito Informal</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Técnico ↔ Acessível</Label>
                <Slider
                  value={[formData.personalityScales.technicalAccessible]}
                  onValueChange={([value]) => 
                    setFormData(prev => ({
                      ...prev,
                      personalityScales: { ...prev.personalityScales, technicalAccessible: value }
                    }))
                  }
                  max={5}
                  min={1}
                  step={0.1}
                  className="w-full [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Muito Técnico</span>
                  <span>Muito Acessível</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sério ↔ Bem-humorado</Label>
                <Slider
                  value={[formData.personalityScales.seriousFun]}
                  onValueChange={([value]) => 
                    setFormData(prev => ({
                      ...prev,
                      personalityScales: { ...prev.personalityScales, seriousFun: value }
                    }))
                  }
                  max={5}
                  min={1}
                  step={0.1}
                  className="w-full [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Muito Sério</span>
                  <span>Bem-humorado</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Palavras que Usamos</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar palavra..."
                    value={newWordToUse}
                    onChange={(e) => setNewWordToUse(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem('wordsToUse', newWordToUse, setNewWordToUse)}
                  />
                  <Button type="button" onClick={() => addItem('wordsToUse', newWordToUse, setNewWordToUse)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.wordsToUse.map((word, index) => (
                    <Badge key={index} variant="default" className="pr-1">
                      {word}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 ml-1 text-current"
                        onClick={() => removeItem('wordsToUse', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Palavras Banidas</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar palavra banida..."
                    value={newWordToBan}
                    onChange={(e) => setNewWordToBan(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem('wordsToBan', newWordToBan, setNewWordToBan)}
                  />
                  <Button type="button" onClick={() => addItem('wordsToBan', newWordToBan, setNewWordToBan)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.wordsToBan.map((word, index) => (
                    <Badge key={index} variant="destructive" className="pr-1">
                      {word}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 ml-1 text-current"
                        onClick={() => removeItem('wordsToBan', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}