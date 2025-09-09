import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Mail, FileText, Share2, Video, Mic, Monitor } from "lucide-react";
import { ContentFormatsData } from "@/types/onboarding";

interface ContentFormatsProps {
  onNext: (data: ContentFormatsData) => void;
  onBack: () => void;
  onSkip: () => void;
  initialData?: Partial<ContentFormatsData>;
}

export function ContentFormats({ onNext, onBack, onSkip, initialData = {} }: ContentFormatsProps) {
  const [formData, setFormData] = useState<ContentFormatsData>({
    preferredFormats: initialData.preferredFormats || []
  });

  const [selectedFormat, setSelectedFormat] = useState<{
    type: 'email' | 'blog' | 'social' | 'video' | 'podcast' | 'webinar';
    priority: number;
    frequency: string;
    platforms: string[];
  }>({
    type: 'blog',
    priority: 1,
    frequency: "",
    platforms: []
  });

  const [newPlatform, setNewPlatform] = useState("");

  const formatIcons = {
    email: Mail,
    blog: FileText,
    social: Share2,
    video: Video,
    podcast: Mic,
    webinar: Monitor
  };

  const formatLabels = {
    email: 'E-mail Marketing',
    blog: 'Blog Posts',
    social: 'Social Media',
    video: 'Vídeos',
    podcast: 'Podcasts',
    webinar: 'Webinars'
  };

  const priorityLabels = {
    1: 'Alta',
    2: 'Média',
    3: 'Baixa'
  };

  const frequencyOptions = [
    'Diário',
    '2-3x por semana',
    'Semanal',
    'Quinzenal',
    'Mensal',
    'Trimestral',
    'Conforme demanda'
  ];

  const platformsByFormat = {
    email: ['Newsletter', 'Campanhas', 'Automação', 'Mailchimp', 'ConvertKit'],
    blog: ['Site próprio', 'Medium', 'LinkedIn Articles', 'WordPress'],
    social: ['LinkedIn', 'Instagram', 'Facebook', 'Twitter/X', 'YouTube', 'TikTok'],
    video: ['YouTube', 'Instagram Reels', 'TikTok', 'LinkedIn Video', 'Vimeo'],
    podcast: ['Spotify', 'Apple Podcasts', 'Google Podcasts', 'Anchor', 'Buzzsprout'],
    webinar: ['Zoom', 'Teams', 'Google Meet', 'Streamyard', 'WebinarJam']
  };

  const addPlatform = (platform: string) => {
    if (platform && !selectedFormat.platforms.includes(platform)) {
      setSelectedFormat(prev => ({
        ...prev,
        platforms: [...prev.platforms, platform]
      }));
    }
  };

  const removePlatform = (platform: string) => {
    setSelectedFormat(prev => ({
      ...prev,
      platforms: prev.platforms.filter(p => p !== platform)
    }));
  };

  const addFormat = () => {
    if (selectedFormat.frequency && !formData.preferredFormats.some(f => f.type === selectedFormat.type)) {
      setFormData(prev => ({
        ...prev,
        preferredFormats: [...prev.preferredFormats, {
          ...selectedFormat,
          platforms: selectedFormat.platforms.length > 0 ? selectedFormat.platforms : undefined
        }]
      }));
      setSelectedFormat({
        type: 'blog',
        priority: 1,
        frequency: "",
        platforms: []
      });
    }
  };

  const removeFormat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preferredFormats: prev.preferredFormats.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  const isFormValid = formData.preferredFormats.length > 0;

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={6}
      title="Formatos para Criar Conteúdos"
      description="Defina os formatos e canais preferidos para seus conteúdos"
      onNext={handleNext}
      onBack={onBack}
      onSkip={onSkip}
      isNextEnabled={isFormValid}
      nextButtonText="Finalizar Onboarding"
    >
      <div className="space-y-8">
        {/* Adicionar Formato */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Formato de Conteúdo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="formatType">Tipo de Conteúdo</Label>
                <Select value={selectedFormat.type} onValueChange={(value: any) => setSelectedFormat(prev => ({ 
                  ...prev, 
                  type: value,
                  platforms: [] // Reset platforms when format changes
                }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(formatLabels).map(([key, label]) => {
                      const Icon = formatIcons[key as keyof typeof formatIcons];
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={selectedFormat.priority.toString()} onValueChange={(value) => setSelectedFormat(prev => ({ ...prev, priority: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Alta</SelectItem>
                    <SelectItem value="2">Média</SelectItem>
                    <SelectItem value="3">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência</Label>
                <Select value={selectedFormat.frequency} onValueChange={(value) => setSelectedFormat(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map(freq => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Plataformas */}
            <div className="space-y-4">
              <Label>Plataformas/Canais</Label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {platformsByFormat[selectedFormat.type].map(platform => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform}
                      checked={selectedFormat.platforms.includes(platform)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addPlatform(platform);
                        } else {
                          removePlatform(platform);
                        }
                      }}
                    />
                    <Label htmlFor={platform} className="text-sm">{platform}</Label>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar plataforma personalizada..."
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addPlatform(newPlatform);
                      setNewPlatform("");
                    }
                  }}
                />
                <Button type="button" onClick={() => {
                  addPlatform(newPlatform);
                  setNewPlatform("");
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedFormat.platforms.map(platform => (
                  <Badge key={platform} variant="outline" className="pr-1">
                    {platform}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removePlatform(platform)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              type="button" 
              onClick={addFormat} 
              className="w-full"
              disabled={!selectedFormat.frequency || formData.preferredFormats.some(f => f.type === selectedFormat.type)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Formato
            </Button>
          </CardContent>
        </Card>

        {/* Formatos Selecionados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Formatos Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.preferredFormats.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum formato selecionado ainda</p>
                <p className="text-xs mt-2">Adicione pelo menos um formato para continuar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.preferredFormats.map((format, index) => {
                  const Icon = formatIcons[format.type];
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-accent/5 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{formatLabels[format.type]}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={format.priority === 1 ? "default" : format.priority === 2 ? "secondary" : "outline"}>
                              Prioridade {priorityLabels[format.priority as keyof typeof priorityLabels]}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format.frequency}
                            </span>
                          </div>
                          {format.platforms && format.platforms.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {format.platforms.map(platform => (
                                <Badge key={platform} variant="outline" className="text-xs">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFormat(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo */}
        {formData.preferredFormats.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">🎉 Parabéns! Seu onboarding está quase completo</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Você selecionou {formData.preferredFormats.length} formato(s) de conteúdo. 
                    Nossa IA usará essas informações para gerar conteúdos personalizados para sua marca.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredFormats.map((format, index) => {
                      const Icon = formatIcons[format.type];
                      return (
                        <Badge key={index} variant="default" className="gap-1">
                          <Icon className="h-3 w-3" />
                          {formatLabels[format.type]}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </OnboardingLayout>
  );
}