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
    mission: initialData.mission || "",
    vision: initialData.vision || "",
    values: initialData.values || [],
    purpose: initialData.purpose || "",
    archetypes: initialData.archetypes || [],
    valueProposition: initialData.valueProposition || "",
    differentials: initialData.differentials || [],
    categories: initialData.categories || [],
    personalityScales: initialData.personalityScales || {
      formalInformal: 3,
      technicalAccessible: 3,
      seriousFun: 3
    },
    wordsToUse: initialData.wordsToUse || [],
    wordsToBan: initialData.wordsToBan || [],
    slogans: initialData.slogans || [],
    messagePillars: initialData.messagePillars || []
  });

  const [newValue, setNewValue] = useState("");
  const [newArchetype, setNewArchetype] = useState("");
  const [newDifferential, setNewDifferential] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newWordToUse, setNewWordToUse] = useState("");
  const [newWordToBan, setNewWordToBan] = useState("");
  const [newSlogan, setNewSlogan] = useState("");
  const [newPillar, setNewPillar] = useState({ theme: "", keyMessages: [""] });

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
    if (newPillar.theme.trim()) {
      setFormData(prev => ({
        ...prev,
        messagePillars: [...prev.messagePillars, {
          theme: newPillar.theme.trim(),
          keyMessages: newPillar.keyMessages.filter(msg => msg.trim())
        }]
      }));
      setNewPillar({ theme: "", keyMessages: [""] });
    }
  };

  const handleNext = () => {
    onNext(formData);
  };

  const isFormValid = Boolean(formData.mission || formData.vision || formData.valueProposition);

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={6}
      title="Identidade e Estratégia de Marca"
      description="Defina a essência, posicionamento e personalidade da sua marca"
      onNext={handleNext}
      onBack={onBack}
      onSkip={onSkip}
      isNextEnabled={isFormValid}
    >
      <div className="space-y-8">
        {/* Essência */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Essência da Marca</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="mission">Missão</Label>
                <Textarea
                  id="mission"
                  placeholder="O que fazemos e por que existimos..."
                  value={formData.mission}
                  onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vision">Visão</Label>
                <Textarea
                  id="vision"
                  placeholder="Onde queremos chegar..."
                  value={formData.vision}
                  onChange={(e) => setFormData(prev => ({ ...prev, vision: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Propósito</Label>
              <Textarea
                id="purpose"
                placeholder="Qual o impacto que queremos gerar no mundo..."
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="values">Valores</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar valor..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('values', newValue, setNewValue)}
                />
                <Button type="button" onClick={() => addItem('values', newValue, setNewValue)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.values.map((value, index) => (
                  <Badge key={index} variant="outline" className="pr-1">
                    {value}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removeItem('values', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

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
                  step={1}
                  className="w-full"
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
                  step={1}
                  className="w-full"
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
                  step={1}
                  className="w-full"
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