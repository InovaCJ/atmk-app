import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from "lucide-react";
import { AudienceData } from "@/types/onboarding";

interface AudiencePersonasProps {
  onNext: (data: AudienceData) => void;
  onBack: () => void;
  onSkip: () => void;
  initialData?: Partial<AudienceData>;
}

export function AudiencePersonas({ onNext, onBack, onSkip, initialData = {} }: AudiencePersonasProps) {
  const [formData, setFormData] = useState<AudienceData>({
    icp: initialData.icp || {
      demographics: {
        ageRange: "",
        gender: "",
        income: "",
        education: "",
        location: []
      },
      firmographics: {
        companySize: "",
        industry: [],
        jobTitles: [],
        regions: [],
        languages: []
      }
    },
    personas: initialData.personas || [],
    frequentQuestions: initialData.frequentQuestions || []
  });

  const [isB2CRelevant, setIsB2CRelevant] = useState(true);
  const [isB2BRelevant, setIsB2BRelevant] = useState(true);

  const [newLocation, setNewLocation] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newPersona, setNewPersona] = useState({
    name: "",
    demographics: {},
    painPoints: [""],
    objections: [""],
    buyingTriggers: [""]
  });

  const addToArray = (path: string[], value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      const updatedData = { ...formData };
      let current: any = updatedData;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      const finalKey = path[path.length - 1];
      if (Array.isArray(current[finalKey])) {
        current[finalKey] = [...current[finalKey], value.trim()];
      }
      
      setFormData(updatedData);
      setter("");
    }
  };

  const removeFromArray = (path: string[], index: number) => {
    const updatedData = { ...formData };
    let current: any = updatedData;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    const finalKey = path[path.length - 1];
    if (Array.isArray(current[finalKey])) {
      current[finalKey] = current[finalKey].filter((_: any, i: number) => i !== index);
    }
    
    setFormData(updatedData);
  };

  const addPersona = () => {
    if (newPersona.name.trim()) {
      setFormData(prev => ({
        ...prev,
        personas: [...prev.personas, {
          name: newPersona.name.trim(),
          demographics: newPersona.demographics,
          painPoints: newPersona.painPoints.filter(p => p.trim()),
          objections: newPersona.objections.filter(o => o.trim()),
          buyingTriggers: newPersona.buyingTriggers.filter(t => t.trim())
        }]
      }));
      setNewPersona({
        name: "",
        demographics: {},
        painPoints: [""],
        objections: [""],
        buyingTriggers: [""]
      });
    }
  };

  const handleNext = () => {
    onNext(formData);
  };

  const isFormValid = Boolean(
    formData.icp.demographics.ageRange || 
    formData.icp.firmographics.companySize || 
    formData.personas.length > 0
  );

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={6}
      title="Público, Personas e Jornada"
      description="Defina seu público-alvo, personas e entenda sua jornada de compra"
      onNext={handleNext}
      onBack={onBack}
      onSkip={onSkip}
      isNextEnabled={isFormValid}
    >
      <div className="space-y-8">
        {/* ICP - Demografia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Perfil Demográfico (B2C)</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="b2c-relevant"
                checked={isB2CRelevant}
                onCheckedChange={(checked) => setIsB2CRelevant(checked === true)}
              />
              <Label htmlFor="b2c-relevant" className="text-sm text-muted-foreground">
                Este perfil é relevante para meu negócio
              </Label>
            </div>
          </CardHeader>
          <CardContent className="space-y-6" style={{ opacity: isB2CRelevant ? 1 : 0.5 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ageRange">Faixa Etária</Label>
                <Input
                  id="ageRange"
                  placeholder="Ex: 25-45 anos"
                  value={formData.icp.demographics.ageRange}
                  disabled={!isB2CRelevant}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    icp: {
                      ...prev.icp,
                      demographics: { ...prev.icp.demographics, ageRange: e.target.value }
                    }
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                 <Input
                   id="gender"
                   placeholder="Ex: Todos, Majoritariamente feminino..."
                   value={formData.icp.demographics.gender}
                   disabled={!isB2CRelevant}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     icp: {
                       ...prev.icp,
                       demographics: { ...prev.icp.demographics, gender: e.target.value }
                     }
                   }))}
                 />
              </div>

              <div className="space-y-2">
                <Label htmlFor="income">Renda</Label>
                 <Input
                   id="income"
                   placeholder="Ex: R$ 5.000-15.000/mês"
                   value={formData.icp.demographics.income}
                   disabled={!isB2CRelevant}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     icp: {
                       ...prev.icp,
                       demographics: { ...prev.icp.demographics, income: e.target.value }
                     }
                   }))}
                 />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Escolaridade</Label>
                 <Input
                   id="education"
                   placeholder="Ex: Ensino superior completo"
                   value={formData.icp.demographics.education}
                   disabled={!isB2CRelevant}
                   onChange={(e) => setFormData(prev => ({
                     ...prev,
                     icp: {
                       ...prev.icp,
                       demographics: { ...prev.icp.demographics, education: e.target.value }
                     }
                   }))}
                 />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Localização</Label>
              <div className="flex gap-2">
                 <Input
                   placeholder="Ex: São Paulo, Rio de Janeiro..."
                   value={newLocation}
                   disabled={!isB2CRelevant}
                   onChange={(e) => setNewLocation(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && isB2CRelevant && addToArray(['icp', 'demographics', 'location'], newLocation, setNewLocation)}
                 />
                 <Button type="button" disabled={!isB2CRelevant} onClick={() => addToArray(['icp', 'demographics', 'location'], newLocation, setNewLocation)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.icp.demographics.location.map((loc, index) => (
                  <Badge key={index} variant="outline" className="pr-1">
                    {loc}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removeFromArray(['icp', 'demographics', 'location'], index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ICP - Firmografia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Perfil Firmográfico (B2B)</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="b2b-relevant"
                checked={isB2BRelevant}
                onCheckedChange={(checked) => setIsB2BRelevant(checked === true)}
              />
              <Label htmlFor="b2b-relevant" className="text-sm text-muted-foreground">
                Este perfil é relevante para meu negócio
              </Label>
            </div>
          </CardHeader>
          <CardContent className="space-y-6" style={{ opacity: isB2BRelevant ? 1 : 0.5 }}>
            <div className="space-y-2">
              <Label htmlFor="companySize">Tamanho da Empresa</Label>
              <Input
                id="companySize"
                placeholder="Ex: 50-200 funcionários, Startups, Grandes corporações..."
                value={formData.icp.firmographics.companySize}
                disabled={!isB2BRelevant}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  icp: {
                    ...prev.icp,
                    firmographics: { ...prev.icp.firmographics, companySize: e.target.value }
                  }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Setores/Indústrias</Label>
              <div className="flex gap-2">
                 <Input
                   placeholder="Ex: Tecnologia, Saúde, Varejo..."
                   value={newIndustry}
                   disabled={!isB2BRelevant}
                   onChange={(e) => setNewIndustry(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && isB2BRelevant && addToArray(['icp', 'firmographics', 'industry'], newIndustry, setNewIndustry)}
                 />
                 <Button type="button" disabled={!isB2BRelevant} onClick={() => addToArray(['icp', 'firmographics', 'industry'], newIndustry, setNewIndustry)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.icp.firmographics.industry.map((ind, index) => (
                  <Badge key={index} variant="outline" className="pr-1">
                    {ind}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removeFromArray(['icp', 'firmographics', 'industry'], index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cargos-alvo</Label>
              <div className="flex gap-2">
                 <Input
                   placeholder="Ex: CEO, CMO, Gerente de Marketing..."
                   value={newJobTitle}
                   disabled={!isB2BRelevant}
                   onChange={(e) => setNewJobTitle(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && isB2BRelevant && addToArray(['icp', 'firmographics', 'jobTitles'], newJobTitle, setNewJobTitle)}
                 />
                 <Button type="button" disabled={!isB2BRelevant} onClick={() => addToArray(['icp', 'firmographics', 'jobTitles'], newJobTitle, setNewJobTitle)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.icp.firmographics.jobTitles.map((job, index) => (
                  <Badge key={index} variant="outline" className="pr-1">
                    {job}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removeFromArray(['icp', 'firmographics', 'jobTitles'], index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personas Detalhadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <Input
                placeholder="Nome da Persona (Ex: Maria - CMO de Startup)"
                value={newPersona.name}
                onChange={(e) => setNewPersona(prev => ({ ...prev, name: e.target.value }))}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Textarea
                  placeholder="Dores (uma por linha)"
                  value={newPersona.painPoints[0] || ""}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, painPoints: [e.target.value] }))}
                  className="min-h-[80px]"
                />
                
                <Textarea
                  placeholder="Objeções (uma por linha)"
                  value={newPersona.objections[0] || ""}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, objections: [e.target.value] }))}
                  className="min-h-[80px]"
                />
                
                <Textarea
                  placeholder="Gatilhos de Compra (um por linha)"
                  value={newPersona.buyingTriggers[0] || ""}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, buyingTriggers: [e.target.value] }))}
                  className="min-h-[80px]"
                />
              </div>
              
              <Button type="button" onClick={addPersona} className="w-fit">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Persona
              </Button>
            </div>

            <div className="space-y-4">
              {formData.personas.map((persona, index) => (
                <div key={index} className="p-4 bg-accent/5 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{persona.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        personas: prev.personas.filter((_, i) => i !== index)
                      }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Dores:</strong>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {persona.painPoints.map((pain, i) => (
                          <li key={i}>{pain}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Objeções:</strong>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {persona.objections.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Gatilhos:</strong>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {persona.buyingTriggers.map((trigger, i) => (
                          <li key={i}>{trigger}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Perguntas Frequentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ex: Quanto custa implementar essa solução?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="min-h-[60px]"
              />
              <Button type="button" onClick={() => addToArray(['frequentQuestions'], newQuestion, setNewQuestion)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {formData.frequentQuestions.map((question, index) => (
                <div key={index} className="flex justify-between items-start p-3 bg-accent/5 rounded-lg">
                  <p className="text-sm">{question}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromArray(['frequentQuestions'], index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}