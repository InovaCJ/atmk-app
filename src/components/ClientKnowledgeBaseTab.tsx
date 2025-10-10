import React, { useState, useEffect, useRef } from 'react';
import { Save, Edit2, Plus, Trash2, Target, Building2, Users, Search, Upload, FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useClientContext } from '@/contexts/ClientContext';
import { useClientSettings } from '@/hooks/useClientSettings';
import { toast } from 'sonner';

interface ClientKnowledgeBaseTabProps {
  clientId: string;
}

interface ExampleFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string; // Para arquivos de texto
  uploadedAt: string;
}

interface KnowledgeBaseData {
  // 1. Posicionamento e Personalidade
  positioning: {
    valueProposition: string;
    differentiators: string[];
    personality: {
      formalVsInformal: number; // 0-100
      technicalVsAccessible: number; // 0-100
      seriousVsHumorous: number; // 0-100
    };
    wordsWeUse: string[];
    bannedWords: string[];
    exampleFiles: ExampleFile[];
  };
  
  // 2. Negócio e Oferta
  business: {
    sector: string;
    market: string;
    categoryMaturity: string;
    regulatoryStatus: string;
    products: Array<{
      name: string;
      features: string[];
      priceRange: string;
    }>;
    services: Array<{
      name: string;
      description: string;
      priceRange: string;
    }>;
  };
  
  // 3. Público, Personas e Jornada
  audience: {
    demographicProfile: {
      ageRange: string;
      gender: string;
      income: string;
      education: string;
      location: string;
    };
    firmographicProfile: {
      companySize: string;
      industries: string[];
      targetRoles: string[];
    };
    personas: Array<{
      name: string;
      pains: string[];
      objections: string[];
      purchaseTriggers: string[];
    }>;
    faqs: Array<{
      question: string;
      answer: string;
    }>;
  };
  
  // 4. SEO & Semântica
  seo: {
    mainKeywords: string[];
    searchIntents: string[];
  };
}

export function ClientKnowledgeBaseTab({ clientId }: ClientKnowledgeBaseTabProps) {
  const { canEditClient } = useClientContext();
  const { knowledgeData, loading, saveKnowledgeData } = useClientSettings(clientId);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localKnowledgeData, setLocalKnowledgeData] = useState<KnowledgeBaseData>({
    positioning: {
      valueProposition: '',
      differentiators: [''],
      personality: {
        formalVsInformal: 50,
        technicalVsAccessible: 50,
        seriousVsHumorous: 50,
      },
      wordsWeUse: [''],
      bannedWords: [''],
      exampleFiles: [],
    },
    business: {
      sector: '',
      market: '',
      categoryMaturity: '',
      regulatoryStatus: '',
      products: [{ name: '', features: [''], priceRange: '' }],
      services: [{ name: '', description: '', priceRange: '' }],
    },
    audience: {
      demographicProfile: {
        ageRange: '',
        gender: '',
        income: '',
        education: '',
        location: '',
      },
      firmographicProfile: {
        companySize: '',
        industries: [''],
        targetRoles: [''],
      },
      personas: [{ name: '', pains: [''], objections: [''], purchaseTriggers: [''] }],
      faqs: [{ question: '', answer: '' }],
    },
    seo: {
      mainKeywords: [''],
      searchIntents: [''],
    },
  });

  // Sincronizar dados locais com dados do hook
  useEffect(() => {
    if (knowledgeData) {
      setLocalKnowledgeData(knowledgeData);
    }
  }, [knowledgeData]);

  // Funções de gerenciamento de dados
  const updatePositioning = (field: string, value: string | string[] | { formalVsInformal: number; technicalVsAccessible: number; seriousVsHumorous: number; }) => {
    setLocalKnowledgeData(prev => ({
      ...prev,
      positioning: {
        ...prev.positioning,
        [field]: value
      }
    }));
  };

  const updateBusiness = (field: string, value: string | Array<{ name: string; features: string[]; priceRange: string; } | { name: string; description: string; priceRange: string; }>) => {
    setLocalKnowledgeData(prev => ({
      ...prev,
      business: {
        ...prev.business,
        [field]: value
      }
    }));
  };

  const updateAudience = (field: string, value: { ageRange: string; gender: string; income: string; education: string; location: string; } | { companySize: string; industries: string[]; targetRoles: string[]; } | Array<{ name: string; pains: string[]; objections: string[]; purchaseTriggers: string[]; } | { question: string; answer: string; }>) => {
    setLocalKnowledgeData(prev => ({
      ...prev,
      audience: {
        ...prev.audience,
        [field]: value
      }
    }));
  };

  const updateSeo = (field: string, value: string[]) => {
    setLocalKnowledgeData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  const addArrayItem = (path: string[], newItem: string | { name: string; features: string[]; priceRange: string; } | { name: string; description: string; priceRange: string; } | { name: string; pains: string[]; objections: string[]; purchaseTriggers: string[]; } | { question: string; answer: string; }) => {
    setLocalKnowledgeData(prev => {
      const newData = { ...prev };
      let current: Record<string, unknown> = newData;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]] as Record<string, unknown>;
      }
      
      (current[path[path.length - 1]] as unknown[]).push(newItem);
      return newData;
    });
  };

  const removeArrayItem = (path: string[], index: number) => {
    setLocalKnowledgeData(prev => {
      const newData = { ...prev };
      let current: Record<string, unknown> = newData;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]] as Record<string, unknown>;
      }
      
      (current[path[path.length - 1]] as unknown[]).splice(index, 1);
      return newData;
    });
  };

  const updateArrayItem = (path: string[], index: number, field: string, value: string | string[]) => {
    setKnowledgeData(prev => {
      const newData = { ...prev };
      let current: Record<string, unknown> = newData;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]] as Record<string, unknown>;
      }
      
      ((current[path[path.length - 1]] as Record<string, unknown>[])[index] as Record<string, unknown>)[field] = value;
      return newData;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveKnowledgeData(localKnowledgeData);
      toast.success('Base de conhecimento salva com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar base de conhecimento. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Funções para gerenciar arquivos de exemplo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validar tipo de arquivo (apenas texto)
    const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Apenas arquivos de texto (.txt, .md) e PDF são permitidos');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo permitido: 5MB');
      return;
    }

    try {
      const content = await readFileContent(file);
      const newFile: ExampleFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        content: content,
        uploadedAt: new Date().toISOString(),
      };

      setKnowledgeData(prev => ({
        ...prev,
        positioning: {
          ...prev.positioning,
          exampleFiles: [...prev.positioning.exampleFiles, newFile]
        }
      }));
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
      alert('Erro ao processar arquivo');
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const removeExampleFile = (fileId: string) => {
    setKnowledgeData(prev => ({
      ...prev,
      positioning: {
        ...prev.positioning,
        exampleFiles: prev.positioning.exampleFiles.filter(file => file.id !== fileId)
      }
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('markdown')) return '📝';
    return '📄';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Base de Conhecimento</h2>
          <p className="text-muted-foreground">
            Configure os dados fundamentais da sua empresa
          </p>
        </div>
        {canEditClient(clientId) && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              onClick={handleEditToggle}
              disabled={isSaving}
              size="sm"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
            {isEditing && (
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 1. Posicionamento e Personalidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Posicionamento e Personalidade
          </CardTitle>
          <CardDescription>
            Defina como sua empresa se posiciona e se comunica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Proposta de Valor */}
          <div>
            <Label htmlFor="value-proposition">Proposta de Valor</Label>
            {isEditing ? (
              <Textarea
                id="value-proposition"
                value={localKnowledgeData.positioning.valueProposition}
                onChange={(e) => updatePositioning('valueProposition', e.target.value)}
                placeholder="Descreva o valor único que sua empresa oferece..."
                className="mt-1"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-1 text-muted-foreground">
                {localKnowledgeData.positioning.valueProposition || 'Não informado'}
              </p>
            )}
          </div>

          {/* Diferenciais */}
          <div>
            <Label>Diferenciais (USPs)</Label>
            {isEditing ? (
              <div className="space-y-2 mt-1">
                {localKnowledgeData.positioning.differentiators.map((diff, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={diff}
                      onChange={(e) => {
                        const newDiffs = [...localKnowledgeData.positioning.differentiators];
                        newDiffs[index] = e.target.value;
                        updatePositioning('differentiators', newDiffs);
                      }}
                      placeholder="Digite um diferencial..."
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem(['positioning', 'differentiators'], index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(['positioning', 'differentiators'], '')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Diferencial
                </Button>
              </div>
            ) : (
              <div className="mt-1">
                {localKnowledgeData.positioning.differentiators.filter(d => d.trim()).length > 0 ? (
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {localKnowledgeData.positioning.differentiators.filter(d => d.trim()).map((diff, index) => (
                      <li key={index}>{diff}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Não informado</p>
                )}
              </div>
            )}
          </div>

          {/* Personalidade & Tom de Voz */}
          <div>
            <Label>Personalidade & Tom de Voz</Label>
            {isEditing ? (
              <div className="space-y-4 mt-1">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Formal</span>
                    <span>Informal</span>
                  </div>
                  <Slider
                    value={[localKnowledgeData.positioning.personality.formalVsInformal]}
                    onValueChange={(value) => updatePositioning('personality', {
                      ...localKnowledgeData.positioning.personality,
                      formalVsInformal: value[0]
                    })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Técnico</span>
                    <span>Acessível</span>
                  </div>
                  <Slider
                    value={[localKnowledgeData.positioning.personality.technicalVsAccessible]}
                    onValueChange={(value) => updatePositioning('personality', {
                      ...localKnowledgeData.positioning.personality,
                      technicalVsAccessible: value[0]
                    })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Sério</span>
                    <span>Bem-humorado</span>
                  </div>
                  <Slider
                    value={[localKnowledgeData.positioning.personality.seriousVsHumorous]}
                    onValueChange={(value) => updatePositioning('personality', {
                      ...localKnowledgeData.positioning.personality,
                      seriousVsHumorous: value[0]
                    })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                <div className="text-sm text-muted-foreground">
                  Formal ↔ Informal: {localKnowledgeData.positioning.personality.formalVsInformal}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Técnico ↔ Acessível: {localKnowledgeData.positioning.personality.technicalVsAccessible}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Sério ↔ Bem-humorado: {localKnowledgeData.positioning.personality.seriousVsHumorous}%
                </div>
              </div>
            )}
          </div>

          {/* Palavras que Usamos */}
          <div>
            <Label>Palavras que Usamos (whitelist)</Label>
            {isEditing ? (
              <div className="space-y-2 mt-1">
                {localKnowledgeData.positioning.wordsWeUse.map((word, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={word}
                      onChange={(e) => {
                        const newWords = [...localKnowledgeData.positioning.wordsWeUse];
                        newWords[index] = e.target.value;
                        updatePositioning('wordsWeUse', newWords);
                      }}
                      placeholder="Digite uma palavra..."
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem(['positioning', 'wordsWeUse'], index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(['positioning', 'wordsWeUse'], '')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Palavra
                </Button>
              </div>
            ) : (
              <div className="mt-1">
                {localKnowledgeData.positioning.wordsWeUse.filter(w => w.trim()).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {localKnowledgeData.positioning.wordsWeUse.filter(w => w.trim()).map((word, index) => (
                      <Badge key={index} variant="secondary">{word}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Não informado</p>
                )}
              </div>
            )}
          </div>

          {/* Palavras Banidas */}
          <div>
            <Label>Palavras Banidas (blacklist)</Label>
            {isEditing ? (
              <div className="space-y-2 mt-1">
                {localKnowledgeData.positioning.bannedWords.map((word, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={word}
                      onChange={(e) => {
                        const newWords = [...localKnowledgeData.positioning.bannedWords];
                        newWords[index] = e.target.value;
                        updatePositioning('bannedWords', newWords);
                      }}
                      placeholder="Digite uma palavra..."
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem(['positioning', 'bannedWords'], index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(['positioning', 'bannedWords'], '')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Palavra
                </Button>
              </div>
            ) : (
              <div className="mt-1">
                {localKnowledgeData.positioning.bannedWords.filter(w => w.trim()).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {localKnowledgeData.positioning.bannedWords.filter(w => w.trim()).map((word, index) => (
                      <Badge key={index} variant="destructive">{word}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Não informado</p>
                )}
              </div>
            )}
          </div>

          {/* Arquivos de Exemplo */}
          <div>
            <Label>Arquivos de Exemplo de Conteúdo</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Anexe arquivos de exemplo para aprimorar o tom de voz e formato de escrita
            </p>
            {isEditing ? (
              <div className="space-y-4 mt-1">
                {/* Upload de arquivo */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Clique para selecionar um arquivo ou arraste aqui
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Formatos aceitos: .txt, .md, .pdf (máximo 5MB)
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                </div>

                {/* Lista de arquivos */}
                {localKnowledgeData.positioning.exampleFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Arquivos Anexados:</h4>
                    {localKnowledgeData.positioning.exampleFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getFileIcon(file.type)}</span>
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (file.content) {
                                const blob = new Blob([file.content], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = file.name;
                                a.click();
                                URL.revokeObjectURL(url);
                              }
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExampleFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-1">
                {localKnowledgeData.positioning.exampleFiles.length > 0 ? (
                  <div className="space-y-2">
                    {localKnowledgeData.positioning.exampleFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <span className="text-lg">{getFileIcon(file.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (file.content) {
                              const blob = new Blob([file.content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = file.name;
                              a.click();
                              URL.revokeObjectURL(url);
                            }
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum arquivo anexado</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Negócio e Oferta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Negócio e Oferta
          </CardTitle>
          <CardDescription>
            Defina informações sobre seu setor, mercado e portfólio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Setor */}
            <div>
              <Label htmlFor="sector">Setor</Label>
              {isEditing ? (
                <Select value={localKnowledgeData.business.sector} onValueChange={(value) => updateBusiness('sector', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="varejo">Varejo</SelectItem>
                    <SelectItem value="industria">Indústria</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm mt-1 text-muted-foreground">
                  {localKnowledgeData.business.sector || 'Não informado'}
                </p>
              )}
            </div>

            {/* Mercado */}
            <div>
              <Label htmlFor="market">Mercado</Label>
              {isEditing ? (
                <Select value={localKnowledgeData.business.market} onValueChange={(value) => updateBusiness('market', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o mercado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b2b-saas">B2B SaaS</SelectItem>
                    <SelectItem value="b2c-ecommerce">B2C E-commerce</SelectItem>
                    <SelectItem value="b2b-enterprise">B2B Enterprise</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="fintech">Fintech</SelectItem>
                    <SelectItem value="edtech">Edtech</SelectItem>
                    <SelectItem value="healthtech">Healthtech</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm mt-1 text-muted-foreground">
                  {localKnowledgeData.business.market || 'Não informado'}
                </p>
              )}
            </div>

            {/* Maturidade da Categoria */}
            <div>
              <Label htmlFor="category-maturity">Maturidade da Categoria</Label>
              {isEditing ? (
                <Select value={localKnowledgeData.business.categoryMaturity} onValueChange={(value) => updateBusiness('categoryMaturity', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a maturidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nascente">Nascente</SelectItem>
                    <SelectItem value="crescimento">Em crescimento</SelectItem>
                    <SelectItem value="madura">Madura</SelectItem>
                    <SelectItem value="declinio">Em declínio</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm mt-1 text-muted-foreground">
                  {localKnowledgeData.business.categoryMaturity || 'Não informado'}
                </p>
              )}
            </div>

            {/* Status Regulatório */}
            <div>
              <Label htmlFor="regulatory-status">Status Regulatório</Label>
              {isEditing ? (
                <Select value={localKnowledgeData.business.regulatoryStatus} onValueChange={(value) => updateBusiness('regulatoryStatus', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anvisa">Regulado pela ANVISA</SelectItem>
                    <SelectItem value="bacen">Regulado pelo BACEN</SelectItem>
                    <SelectItem value="cvm">Regulado pela CVM</SelectItem>
                    <SelectItem value="sem-regulacao">Sem regulação específica</SelectItem>
                    <SelectItem value="outros">Outros órgãos</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm mt-1 text-muted-foreground">
                  {localKnowledgeData.business.regulatoryStatus || 'Não informado'}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Portfólio de Produtos */}
          <div>
            <Label>Portfólio de Produtos</Label>
            {isEditing ? (
              <div className="space-y-4 mt-1">
                {localKnowledgeData.business.products.map((product, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Produto {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem(['business', 'products'], index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Nome</Label>
                          <Input
                            value={product.name}
                            onChange={(e) => updateArrayItem(['business', 'products'], index, 'name', e.target.value)}
                            placeholder="Nome do produto"
                          />
                        </div>
                        <div>
                          <Label>Faixa de Preço</Label>
                          <Input
                            value={product.priceRange}
                            onChange={(e) => updateArrayItem(['business', 'products'], index, 'priceRange', e.target.value)}
                            placeholder="Ex: R$ 100-500"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Principais Features</Label>
                        <div className="space-y-2">
                          {product.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2">
                              <Input
                                value={feature}
                                onChange={(e) => {
                                  const newFeatures = [...product.features];
                                  newFeatures[featureIndex] = e.target.value;
                                  updateArrayItem(['business', 'products'], index, 'features', newFeatures);
                                }}
                                placeholder="Digite uma feature..."
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newFeatures = [...product.features];
                                  newFeatures.splice(featureIndex, 1);
                                  updateArrayItem(['business', 'products'], index, 'features', newFeatures);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newFeatures = [...product.features, ''];
                              updateArrayItem(['business', 'products'], index, 'features', newFeatures);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Feature
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addArrayItem(['business', 'products'], { name: '', features: [''], priceRange: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                {localKnowledgeData.business.products.filter(p => p.name.trim()).length > 0 ? (
                  localKnowledgeData.business.products.filter(p => p.name.trim()).map((product, index) => (
                    <div key={index} className="border rounded p-3">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">Preço: {product.priceRange || 'Não informado'}</p>
                      {product.features.filter(f => f.trim()).length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Features:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {product.features.filter(f => f.trim()).map((feature, featureIndex) => (
                              <li key={featureIndex}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Não informado</p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Portfólio de Serviços */}
          <div>
            <Label>Portfólio de Serviços</Label>
            {isEditing ? (
              <div className="space-y-4 mt-1">
                {localKnowledgeData.business.services.map((service, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Serviço {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem(['business', 'services'], index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Nome</Label>
                          <Input
                            value={service.name}
                            onChange={(e) => updateArrayItem(['business', 'services'], index, 'name', e.target.value)}
                            placeholder="Nome do serviço"
                          />
                        </div>
                        <div>
                          <Label>Faixa de Preço</Label>
                          <Input
                            value={service.priceRange}
                            onChange={(e) => updateArrayItem(['business', 'services'], index, 'priceRange', e.target.value)}
                            placeholder="Ex: R$ 1.000-5.000"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Textarea
                          value={service.description}
                          onChange={(e) => updateArrayItem(['business', 'services'], index, 'description', e.target.value)}
                          placeholder="Descreva o serviço..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addArrayItem(['business', 'services'], { name: '', description: '', priceRange: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Serviço
                </Button>
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                {localKnowledgeData.business.services.filter(s => s.name.trim()).length > 0 ? (
                  localKnowledgeData.business.services.filter(s => s.name.trim()).map((service, index) => (
                    <div key={index} className="border rounded p-3">
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">Preço: {service.priceRange || 'Não informado'}</p>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Não informado</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Público, Personas e Jornada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Público, Personas e Jornada
          </CardTitle>
          <CardDescription>
            Defina seu público-alvo, personas e perguntas frequentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Perfil Demográfico (B2C) */}
          <div>
            <Label>Perfil Demográfico (B2C)</Label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4 mt-1">
                <div>
                  <Label>Faixa Etária</Label>
                  <Input
                    value={localKnowledgeData.audience.demographicProfile.ageRange}
                    onChange={(e) => updateAudience('demographicProfile', {
                      ...localKnowledgeData.audience.demographicProfile,
                      ageRange: e.target.value
                    })}
                    placeholder="Ex: 25-45 anos"
                  />
                </div>
                <div>
                  <Label>Gênero</Label>
                  <Select value={localKnowledgeData.audience.demographicProfile.gender} onValueChange={(value) => updateAudience('demographicProfile', {
                    ...localKnowledgeData.audience.demographicProfile,
                    gender: value
                  })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                      <SelectItem value="nao-informado">Não informado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Renda</Label>
                  <Input
                    value={localKnowledgeData.audience.demographicProfile.income}
                    onChange={(e) => updateAudience('demographicProfile', {
                      ...localKnowledgeData.audience.demographicProfile,
                      income: e.target.value
                    })}
                    placeholder="Ex: R$ 3.000-8.000"
                  />
                </div>
                <div>
                  <Label>Escolaridade</Label>
                  <Select value={localKnowledgeData.audience.demographicProfile.education} onValueChange={(value) => updateAudience('demographicProfile', {
                    ...localKnowledgeData.audience.demographicProfile,
                    education: value
                  })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ensino-medio">Ensino Médio</SelectItem>
                      <SelectItem value="superior-incompleto">Superior Incompleto</SelectItem>
                      <SelectItem value="superior-completo">Superior Completo</SelectItem>
                      <SelectItem value="pos-graduacao">Pós-graduação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Localização</Label>
                  <Input
                    value={localKnowledgeData.audience.demographicProfile.location}
                    onChange={(e) => updateAudience('demographicProfile', {
                      ...localKnowledgeData.audience.demographicProfile,
                      location: e.target.value
                    })}
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-1 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>Faixa Etária: {localKnowledgeData.audience.demographicProfile.ageRange || 'Não informado'}</div>
                <div>Gênero: {localKnowledgeData.audience.demographicProfile.gender || 'Não informado'}</div>
                <div>Renda: {localKnowledgeData.audience.demographicProfile.income || 'Não informado'}</div>
                <div>Escolaridade: {localKnowledgeData.audience.demographicProfile.education || 'Não informado'}</div>
                <div className="col-span-2">Localização: {localKnowledgeData.audience.demographicProfile.location || 'Não informado'}</div>
              </div>
            )}
          </div>

          <Separator />

          {/* Perfil Firmográfico (B2B) */}
          <div>
            <Label>Perfil Firmográfico (B2B)</Label>
            {isEditing ? (
              <div className="space-y-4 mt-1">
                <div>
                  <Label>Tamanho da Empresa</Label>
                  <Select value={localKnowledgeData.audience.firmographicProfile.companySize} onValueChange={(value) => updateAudience('firmographicProfile', {
                    ...localKnowledgeData.audience.firmographicProfile,
                    companySize: value
                  })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="micro">Micro (até 9 funcionários)</SelectItem>
                      <SelectItem value="pequena">Pequena (10-49 funcionários)</SelectItem>
                      <SelectItem value="media">Média (50-249 funcionários)</SelectItem>
                      <SelectItem value="grande">Grande (250+ funcionários)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Setores/Indústrias</Label>
                  <div className="space-y-2">
                    {localKnowledgeData.audience.firmographicProfile.industries.map((industry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={industry}
                          onChange={(e) => {
                            const newIndustries = [...localKnowledgeData.audience.firmographicProfile.industries];
                            newIndustries[index] = e.target.value;
                            updateAudience('firmographicProfile', {
                              ...localKnowledgeData.audience.firmographicProfile,
                              industries: newIndustries
                            });
                          }}
                          placeholder="Digite um setor..."
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem(['audience', 'firmographicProfile', 'industries'], index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem(['audience', 'firmographicProfile', 'industries'], '')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Setor
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Cargos-alvo</Label>
                  <div className="space-y-2">
                    {localKnowledgeData.audience.firmographicProfile.targetRoles.map((role, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={role}
                          onChange={(e) => {
                            const newRoles = [...localKnowledgeData.audience.firmographicProfile.targetRoles];
                            newRoles[index] = e.target.value;
                            updateAudience('firmographicProfile', {
                              ...localKnowledgeData.audience.firmographicProfile,
                              targetRoles: newRoles
                            });
                          }}
                          placeholder="Digite um cargo..."
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem(['audience', 'firmographicProfile', 'targetRoles'], index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem(['audience', 'firmographicProfile', 'targetRoles'], '')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Cargo
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-1 space-y-2 text-sm text-muted-foreground">
                <div>Tamanho da Empresa: {localKnowledgeData.audience.firmographicProfile.companySize || 'Não informado'}</div>
                <div>Setores: {localKnowledgeData.audience.firmographicProfile.industries.filter(i => i.trim()).join(', ') || 'Não informado'}</div>
                <div>Cargos-alvo: {localKnowledgeData.audience.firmographicProfile.targetRoles.filter(r => r.trim()).join(', ') || 'Não informado'}</div>
              </div>
            )}
          </div>

          <Separator />

          {/* Personas Detalhadas */}
          <div>
            <Label>Personas Detalhadas</Label>
            {isEditing ? (
              <div className="space-y-4 mt-1">
                {localKnowledgeData.audience.personas.map((persona, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Persona {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem(['audience', 'personas'], index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={persona.name}
                          onChange={(e) => updateArrayItem(['audience', 'personas'], index, 'name', e.target.value)}
                          placeholder="Ex: João, Gerente de TI"
                        />
                      </div>
                      <div>
                        <Label>Dores (uma por linha)</Label>
                        <div className="space-y-2">
                          {persona.pains.map((pain, painIndex) => (
                            <div key={painIndex} className="flex items-center gap-2">
                              <Input
                                value={pain}
                                onChange={(e) => {
                                  const newPains = [...persona.pains];
                                  newPains[painIndex] = e.target.value;
                                  updateArrayItem(['audience', 'personas'], index, 'pains', newPains);
                                }}
                                placeholder="Digite uma dor..."
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newPains = [...persona.pains];
                                  newPains.splice(painIndex, 1);
                                  updateArrayItem(['audience', 'personas'], index, 'pains', newPains);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPains = [...persona.pains, ''];
                              updateArrayItem(['audience', 'personas'], index, 'pains', newPains);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Dor
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Objeções</Label>
                        <div className="space-y-2">
                          {persona.objections.map((objection, objectionIndex) => (
                            <div key={objectionIndex} className="flex items-center gap-2">
                              <Input
                                value={objection}
                                onChange={(e) => {
                                  const newObjections = [...persona.objections];
                                  newObjections[objectionIndex] = e.target.value;
                                  updateArrayItem(['audience', 'personas'], index, 'objections', newObjections);
                                }}
                                placeholder="Digite uma objeção..."
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newObjections = [...persona.objections];
                                  newObjections.splice(objectionIndex, 1);
                                  updateArrayItem(['audience', 'personas'], index, 'objections', newObjections);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newObjections = [...persona.objections, ''];
                              updateArrayItem(['audience', 'personas'], index, 'objections', newObjections);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Objeção
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Gatilhos de Compra</Label>
                        <div className="space-y-2">
                          {persona.purchaseTriggers.map((trigger, triggerIndex) => (
                            <div key={triggerIndex} className="flex items-center gap-2">
                              <Input
                                value={trigger}
                                onChange={(e) => {
                                  const newTriggers = [...persona.purchaseTriggers];
                                  newTriggers[triggerIndex] = e.target.value;
                                  updateArrayItem(['audience', 'personas'], index, 'purchaseTriggers', newTriggers);
                                }}
                                placeholder="Digite um gatilho..."
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newTriggers = [...persona.purchaseTriggers];
                                  newTriggers.splice(triggerIndex, 1);
                                  updateArrayItem(['audience', 'personas'], index, 'purchaseTriggers', newTriggers);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newTriggers = [...persona.purchaseTriggers, ''];
                              updateArrayItem(['audience', 'personas'], index, 'purchaseTriggers', newTriggers);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Gatilho
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addArrayItem(['audience', 'personas'], { name: '', pains: [''], objections: [''], purchaseTriggers: [''] })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Persona
                </Button>
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                {localKnowledgeData.audience.personas.filter(p => p.name.trim()).length > 0 ? (
                  localKnowledgeData.audience.personas.filter(p => p.name.trim()).map((persona, index) => (
                    <div key={index} className="border rounded p-3">
                      <h4 className="font-medium">{persona.name}</h4>
                      {persona.pains.filter(p => p.trim()).length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Dores:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {persona.pains.filter(p => p.trim()).map((pain, painIndex) => (
                              <li key={painIndex}>{pain}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Não informado</p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* FAQs */}
          <div>
            <Label>Perguntas Frequentes (FAQs)</Label>
            {isEditing ? (
              <div className="space-y-4 mt-1">
                {localKnowledgeData.audience.faqs.map((faq, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">FAQ {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem(['audience', 'faqs'], index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label>Pergunta</Label>
                        <Input
                          value={faq.question}
                          onChange={(e) => updateArrayItem(['audience', 'faqs'], index, 'question', e.target.value)}
                          placeholder="Digite a pergunta..."
                        />
                      </div>
                      <div>
                        <Label>Resposta</Label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => updateArrayItem(['audience', 'faqs'], index, 'answer', e.target.value)}
                          placeholder="Digite a resposta..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addArrayItem(['audience', 'faqs'], { question: '', answer: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar FAQ
                </Button>
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                {localKnowledgeData.audience.faqs.filter(f => f.question.trim()).length > 0 ? (
                  localKnowledgeData.audience.faqs.filter(f => f.question.trim()).map((faq, index) => (
                    <div key={index} className="border rounded p-3">
                      <h4 className="font-medium">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Não informado</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. SEO & Semântica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO & Semântica
          </CardTitle>
          <CardDescription>
            Configure palavras-chave e intenções de busca
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Palavras-chave Principais */}
          <div>
            <Label>Palavras-chave Principais</Label>
            {isEditing ? (
              <div className="space-y-2 mt-1">
                {localKnowledgeData.seo.mainKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={keyword}
                      onChange={(e) => {
                        const newKeywords = [...localKnowledgeData.seo.mainKeywords];
                        newKeywords[index] = e.target.value;
                        updateSeo('mainKeywords', newKeywords);
                      }}
                      placeholder="Digite uma palavra-chave..."
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem(['seo', 'mainKeywords'], index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(['seo', 'mainKeywords'], '')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Palavra-chave
                </Button>
              </div>
            ) : (
              <div className="mt-1">
                {localKnowledgeData.seo.mainKeywords.filter(k => k.trim()).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {localKnowledgeData.seo.mainKeywords.filter(k => k.trim()).map((keyword, index) => (
                      <Badge key={index} variant="outline">{keyword}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Não informado</p>
                )}
              </div>
            )}
          </div>

          {/* Intenções de Busca */}
          <div>
            <Label>Intenções de Busca</Label>
            {isEditing ? (
              <div className="space-y-2 mt-1">
                {localKnowledgeData.seo.searchIntents.map((intent, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={intent}
                      onChange={(e) => {
                        const newIntents = [...localKnowledgeData.seo.searchIntents];
                        newIntents[index] = e.target.value;
                        updateSeo('searchIntents', newIntents);
                      }}
                      placeholder="Digite uma intenção de busca..."
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem(['seo', 'searchIntents'], index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(['seo', 'searchIntents'], '')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Intenção
                </Button>
              </div>
            ) : (
              <div className="mt-1">
                {localKnowledgeData.seo.searchIntents.filter(i => i.trim()).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {localKnowledgeData.seo.searchIntents.filter(i => i.trim()).map((intent, index) => (
                      <Badge key={index} variant="secondary">{intent}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Não informado</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar no Final */}
      {isEditing && canEditClient(clientId) && (
        <div className="flex justify-center pt-6 border-t">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="min-w-[200px]"
          >
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Base de Conhecimento'}
          </Button>
        </div>
      )}
    </div>
  );
}
