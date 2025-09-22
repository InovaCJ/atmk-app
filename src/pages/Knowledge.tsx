import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building, 
  Target, 
  Users, 
  Search, 
  X, 
  Plus,
  Save,
  Trash2,
  FileText,
  Mail,
  Share2,
  Video,
  Mic,
  Monitor
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useCompanies";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { useCompanyContext } from "@/contexts/CompanyContext";
import type { OnboardingData, BrandIdentityData, BusinessData, AudienceData, SEOData, ContentFormatsData } from "@/types/onboarding";

export default function Knowledge() {
  const { selectedCompanyId, selectedCompany } = useCompanyContext();
  const { createOrUpdateKnowledgeItem, getKnowledgeItemByType, loading: knowledgeLoading } = useKnowledgeBase(selectedCompanyId || undefined);

  const [knowledgeData, setKnowledgeData] = useState<OnboardingData>({
    brandIdentity: {
      valueProposition: "",
      differentials: [],
      personalityScales: {
        formalInformal: 3,
        technicalAccessible: 3,
        seriousFun: 3
      },
      wordsToUse: [],
      wordsToBan: []
    },
    business: {
      sector: "",
      market: "",
      maturity: "growing",
      regulatoryStatus: "",
      products: [],
      services: [],
      roadmap: []
    },
    audience: {
      icp: {
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
      personas: [],
      frequentQuestions: []
    },
    seo: {
      keywords: [],
      searchIntents: []
    },
    contentFormats: {
      preferredFormats: []
    },
    completedSteps: []
  });

  // Form inputs state
  const [newDifferential, setNewDifferential] = useState("");
  const [newWordToUse, setNewWordToUse] = useState("");
  const [newWordToBan, setNewWordToBan] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newSearchIntent, setNewSearchIntent] = useState("");
  
  const [newProduct, setNewProduct] = useState({ name: "", features: [""], priceRange: "" });
  const [newService, setNewService] = useState({ name: "", description: "", priceRange: "" });
  const [newPersona, setNewPersona] = useState({
    name: "",
    demographics: {},
    painPoints: [""],
    objections: [""],
    buyingTriggers: [""]
  });
  const [selectedFormat, setSelectedFormat] = useState<{
    type: 'email' | 'blog' | 'social' | 'video' | 'podcast' | 'webinar';
    priority: number;
    frequency: string;
    platforms?: string[];
  }>({
    type: 'blog',
    priority: 1,
    frequency: "",
    platforms: []
  });

  // Format labels and icons
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
    video: 'Roteiro para Vídeos',
    podcast: 'Roteiro para Podcasts',
    webinar: 'Roteiro para Webinars'
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

  useEffect(() => {
    console.log('useEffect triggered, selectedCompanyId:', selectedCompanyId);
    if (selectedCompanyId) {
      loadKnowledgeData();
    }
  }, [selectedCompanyId]); // Removendo getKnowledgeItemByType da dependência

  // Auto-save effect - salva automaticamente quando os dados mudam
  useEffect(() => {
    console.log('Knowledge data changed:', knowledgeData);
    
    // Só faz auto-save se já carregou dados iniciais e tem uma empresa selecionada
    if (selectedCompanyId && !knowledgeLoading) {
      // Debounce para evitar muitas chamadas
      const timeoutId = setTimeout(() => {
        autoSaveData();
      }, 1000); // Salva 1 segundo após a última mudança
      
      return () => clearTimeout(timeoutId);
    }
  }, [knowledgeData, selectedCompanyId, knowledgeLoading]);

  // Helper function to deep merge objects, preserving existing non-empty values
  const deepMerge = (defaults: any, saved: any): any => {
    if (!saved || typeof saved !== 'object') return defaults;
    if (!defaults || typeof defaults !== 'object') return saved;
    
    const result = { ...defaults };
    
    for (const key in saved) {
      if (saved[key] && typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
        // Skip corrupted metadata objects
        if (saved[key]._type === 'MaxDepthReached') {
          continue;
        }
        result[key] = deepMerge(defaults[key] || {}, saved[key]);
      } else if (saved[key] !== undefined && saved[key] !== null && saved[key] !== "" && !(Array.isArray(saved[key]) && saved[key].length === 0)) {
        // Only use saved value if it's not empty (prioritize saved data over defaults)
        result[key] = saved[key];
      }
      // If saved value is empty, keep the default value (don't overwrite with empty)
    }
    
    return result;
  };

  const loadKnowledgeData = useCallback(() => {
    if (!selectedCompanyId) {
      console.log('No selectedCompanyId, cannot load data');
      return;
    }
    
    console.log('Attempting to load knowledge data for company:', selectedCompanyId);
    const knowledgeItem = getKnowledgeItemByType('onboarding_data');
    console.log('Found knowledge item:', knowledgeItem);
    
    if (knowledgeItem && knowledgeItem.metadata) {
      console.log('Loading knowledge data from metadata:', knowledgeItem.metadata);
      
      // Create default structure
      const defaultStructure = {
        brandIdentity: {
          valueProposition: "",
          differentials: [],
          personalityScales: {
            formalInformal: 3,
            technicalAccessible: 3,
            seriousFun: 3
          },
          wordsToUse: [],
          wordsToBan: []
        },
        business: {
          sector: "",
          market: "",
          maturity: "growing",
          regulatoryStatus: "",
          products: [],
          services: [],
          roadmap: []
        },
        audience: {
          icp: {
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
          personas: [],
          frequentQuestions: []
        },
        seo: {
          keywords: [],
          searchIntents: []
        },
        contentFormats: {
          preferredFormats: []
        },
        completedSteps: []
      };
      
      // Deep merge defaults with saved data, preserving filled values from saved data
      const mergedData = deepMerge(defaultStructure, knowledgeItem.metadata);
      console.log('Merged data result:', mergedData);
      setKnowledgeData(mergedData);
    } else if (knowledgeItem && knowledgeItem.content) {
      // Fallback para content se metadata não existir
      try {
        let parsedData;
        if (typeof knowledgeItem.content === 'string') {
          parsedData = JSON.parse(knowledgeItem.content);
        } else {
          parsedData = knowledgeItem.content;
        }
        console.log('Loading knowledge data from content:', parsedData);
        
        // Create default structure (same as above)
        const defaultStructure = {
          brandIdentity: {
            valueProposition: "",
            differentials: [],
            personalityScales: {
              formalInformal: 3,
              technicalAccessible: 3,
              seriousFun: 3
            },
            wordsToUse: [],
            wordsToBan: []
          },
          business: {
            sector: "",
            market: "",
            maturity: "growing",
            regulatoryStatus: "",
            products: [],
            services: [],
            roadmap: []
          },
          audience: {
            icp: {
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
            personas: [],
            frequentQuestions: []
          },
          seo: {
            keywords: [],
            searchIntents: []
          },
          contentFormats: {
            preferredFormats: []
          },
          completedSteps: []
        };
        
        // Deep merge defaults with saved data, preserving filled values from saved data
        const mergedData = deepMerge(defaultStructure, parsedData);
        setKnowledgeData(mergedData);
      } catch (error) {
        console.error('Error parsing knowledge content:', error);
      }
    } else {
      console.log('No knowledge data found, keeping current state or using defaults');
    }
  }, [selectedCompanyId, getKnowledgeItemByType]);

  // Auto-save silencioso (sem toast de sucesso)
  const autoSaveData = async () => {
    if (!selectedCompanyId) {
      return;
    }

    console.log('Auto-saving knowledge data:', knowledgeData);

    const companyName = selectedCompany?.name || 'Empresa';
    const existingItem = getKnowledgeItemByType('onboarding_data');
    
    try {
      await createOrUpdateKnowledgeItem(
        `Base de Conhecimento - ${companyName}`,
        knowledgeData,
        'onboarding_data',
        ['onboarding', 'brand', 'business', 'audience', 'seo'],
        existingItem?.id
      );
      
      console.log('Knowledge data auto-saved successfully');
    } catch (error) {
      console.error('Error auto-saving knowledge data:', error);
    }
  };

  // Função de salvamento manual (com toast de sucesso)
  const saveData = async () => {
    if (!selectedCompanyId) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa primeiro.",
        variant: "destructive"
      });
      return;
    }

    console.log('Manually saving knowledge data:', knowledgeData);

    const companyName = selectedCompany?.name || 'Empresa';
    const existingItem = getKnowledgeItemByType('onboarding_data');
    
    try {
      await createOrUpdateKnowledgeItem(
        `Base de Conhecimento - ${companyName}`,
        knowledgeData,
        'onboarding_data',
        ['onboarding', 'brand', 'business', 'audience', 'seo'],
        existingItem?.id
      );
      
      toast({
        title: "Sucesso",
        description: "Base de conhecimento salva com sucesso!",
      });
      
      // Aguardar um pouco para garantir que o banco foi atualizado, mas não recarregar automaticamente
      // para evitar sobrescrever dados que o usuário acabou de editar
      console.log('Dados salvos com sucesso, mantendo estado atual');
    } catch (error) {
      console.error('Error saving knowledge data:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados.",
        variant: "destructive"
      });
    }
  };

  // Helper functions for adding/removing items from arrays
  const addItem = (field: string, section: string, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setKnowledgeData(prev => {
        const currentSection = prev[section as keyof OnboardingData] as any;
        return {
          ...prev,
          [section]: {
            ...currentSection,
            [field]: [...(currentSection[field] || []), value.trim()]
          }
        };
      });
      setter("");
    }
  };

  const removeItem = (field: string, section: string, index: number) => {
    setKnowledgeData(prev => {
      const currentSection = prev[section as keyof OnboardingData] as any;
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: currentSection[field]?.filter((_: any, i: number) => i !== index) || []
        }
      };
    });
  };

  // Format functions
  const addPlatform = (platform: string) => {
    if (platform && !selectedFormat.platforms?.includes(platform)) {
      setSelectedFormat(prev => ({
        ...prev,
        platforms: [...(prev.platforms || []), platform]
      }));
    }
  };

  const removePlatform = (platform: string) => {
    setSelectedFormat(prev => ({
      ...prev,
      platforms: prev.platforms?.filter(p => p !== platform) || []
    }));
  };

  const addFormat = async () => {
    if (selectedFormat.frequency && !knowledgeData.contentFormats?.preferredFormats?.some(f => f.type === selectedFormat.type)) {
      const newKnowledgeData = {
        ...knowledgeData,
        contentFormats: {
          ...knowledgeData.contentFormats!,
          preferredFormats: [...(knowledgeData.contentFormats?.preferredFormats || []), {
            ...selectedFormat,
            platforms: selectedFormat.platforms && selectedFormat.platforms.length > 0 ? selectedFormat.platforms : undefined
          }]
        }
      };

      setKnowledgeData(newKnowledgeData);
      
      // Reset selected format
      setSelectedFormat({
        type: 'blog',
        priority: 1,
        frequency: "",
        platforms: []
      });

      toast({
        title: "Sucesso",
        description: "Formato adicionado com sucesso!",
      });
    }
  };

  const removeFormat = async (index: number) => {
    const newKnowledgeData = {
      ...knowledgeData,
      contentFormats: {
        ...knowledgeData.contentFormats!,
        preferredFormats: knowledgeData.contentFormats?.preferredFormats?.filter((_, i) => i !== index) || []
      }
    };

    setKnowledgeData(newKnowledgeData);

    toast({
      title: "Sucesso",
      description: "Formato removido com sucesso!",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Base de Conhecimento</h1>
        <p className="text-muted-foreground">
          Gerencie e edite todas as informações da {selectedCompany?.name || 'empresa'}
        </p>
      </div>

      <Tabs defaultValue="identidade" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="identidade" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Identidade
          </TabsTrigger>
          <TabsTrigger value="negocio" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Negócio
          </TabsTrigger>
          <TabsTrigger value="publico" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Público
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="formatos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Formatos
          </TabsTrigger>
        </TabsList>


        {/* Identidade */}
        <TabsContent value="identidade">
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
                    value={knowledgeData.brandIdentity?.valueProposition || ""}
                    onChange={(e) => setKnowledgeData(prev => ({
                      ...prev,
                      brandIdentity: {
                        ...prev.brandIdentity!,
                        valueProposition: e.target.value
                      }
                    }))}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="differentials">Diferenciais</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: Entrega em 24h, Suporte 24/7, Preço mais baixo (use vírgula para separar)"
                      value={newDifferential}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.includes(',')) {
                          const items = value.split(',').map(i => i.trim()).filter(i => i);
                          items.forEach(item => {
                            if (item) {
                              setKnowledgeData(prev => ({
                                ...prev,
                                brandIdentity: {
                                  ...prev.brandIdentity!,
                                  differentials: [...(prev.brandIdentity?.differentials || []), item]
                                }
                              }));
                            }
                          });
                          setNewDifferential("");
                        } else {
                          setNewDifferential(value);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newDifferential.trim()) {
                          setKnowledgeData(prev => ({
                            ...prev,
                            brandIdentity: {
                              ...prev.brandIdentity!,
                              differentials: [...(prev.brandIdentity?.differentials || []), newDifferential.trim()]
                            }
                          }));
                          setNewDifferential("");
                        }
                      }}
                    />
                    <Button type="button" onClick={() => {
                      if (newDifferential.trim()) {
                        setKnowledgeData(prev => ({
                          ...prev,
                          brandIdentity: {
                            ...prev.brandIdentity!,
                            differentials: [...(prev.brandIdentity?.differentials || []), newDifferential.trim()]
                          }
                        }));
                        setNewDifferential("");
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(knowledgeData.brandIdentity?.differentials || []).map((diff, index) => (
                      <Badge key={index} variant="outline" className="pr-1">
                        {diff}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1"
                          onClick={() => removeItem('differentials', 'brandIdentity', index)}
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
                      value={[knowledgeData.brandIdentity?.personalityScales?.formalInformal || 3]}
                      onValueChange={([value]) => 
                        setKnowledgeData(prev => ({
                          ...prev,
                          brandIdentity: {
                            ...prev.brandIdentity!,
                            personalityScales: { 
                              ...prev.brandIdentity!.personalityScales, 
                              formalInformal: value 
                            }
                          }
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
                      value={[knowledgeData.brandIdentity?.personalityScales?.technicalAccessible || 3]}
                      onValueChange={([value]) => 
                        setKnowledgeData(prev => ({
                          ...prev,
                          brandIdentity: {
                            ...prev.brandIdentity!,
                            personalityScales: { 
                              ...prev.brandIdentity!.personalityScales, 
                              technicalAccessible: value 
                            }
                          }
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
                      value={[knowledgeData.brandIdentity?.personalityScales?.seriousFun || 3]}
                      onValueChange={([value]) => 
                        setKnowledgeData(prev => ({
                          ...prev,
                          brandIdentity: {
                            ...prev.brandIdentity!,
                            personalityScales: { 
                              ...prev.brandIdentity!.personalityScales, 
                              seriousFun: value 
                            }
                          }
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
                        placeholder="Ex: inovação, qualidade, confiança (use vírgula para separar)"
                        value={newWordToUse}
                       onChange={(e) => {
                         const value = e.target.value;
                         if (value.includes(',')) {
                           const words = value.split(',').map(w => w.trim()).filter(w => w);
                           words.forEach(word => {
                             if (word) {
                               setKnowledgeData(prev => ({
                                 ...prev,
                                 brandIdentity: {
                                   ...prev.brandIdentity!,
                                   wordsToUse: [...(prev.brandIdentity?.wordsToUse || []), word]
                                 }
                               }));
                             }
                           });
                           setNewWordToUse("");
                         } else {
                           setNewWordToUse(value);
                         }
                       }}
                       onKeyPress={(e) => {
                         if (e.key === 'Enter' && newWordToUse.trim()) {
                           setKnowledgeData(prev => ({
                             ...prev,
                             brandIdentity: {
                               ...prev.brandIdentity!,
                               wordsToUse: [...(prev.brandIdentity?.wordsToUse || []), newWordToUse.trim()]
                             }
                           }));
                           setNewWordToUse("");
                         }
                       }}
                      />
                     <Button type="button" onClick={() => {
                       if (newWordToUse.trim()) {
                         setKnowledgeData(prev => ({
                           ...prev,
                           brandIdentity: {
                             ...prev.brandIdentity!,
                             wordsToUse: [...(prev.brandIdentity?.wordsToUse || []), newWordToUse.trim()]
                           }
                         }));
                         setNewWordToUse("");
                       }
                     }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(knowledgeData.brandIdentity?.wordsToUse || []).map((word, index) => (
                        <Badge key={index} variant="default" className="pr-1">
                          {word}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 ml-1 text-current"
                            onClick={() => removeItem('wordsToUse', 'brandIdentity', index)}
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
                        placeholder="Ex: barato, problemático, ruim (use vírgula para separar)"
                        value={newWordToBan}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.includes(',')) {
                            const words = value.split(',').map(w => w.trim()).filter(w => w);
                            words.forEach(word => {
                              if (word) {
                                setKnowledgeData(prev => ({
                                  ...prev,
                                  brandIdentity: {
                                    ...prev.brandIdentity!,
                                    wordsToBan: [...(prev.brandIdentity?.wordsToBan || []), word]
                                  }
                                }));
                              }
                            });
                            setNewWordToBan("");
                          } else {
                            setNewWordToBan(value);
                          }
                        }}
                         onKeyPress={(e) => {
                           if (e.key === 'Enter' && newWordToBan.trim()) {
                             setKnowledgeData(prev => ({
                               ...prev,
                               brandIdentity: {
                                 ...prev.brandIdentity!,
                                 wordsToBan: [...(prev.brandIdentity?.wordsToBan || []), newWordToBan.trim()]
                               }
                             }));
                             setNewWordToBan("");
                           }
                         }}
                      />
                     <Button type="button" onClick={() => {
                       if (newWordToBan.trim()) {
                         setKnowledgeData(prev => ({
                           ...prev,
                           brandIdentity: {
                             ...prev.brandIdentity!,
                             wordsToBan: [...(prev.brandIdentity?.wordsToBan || []), newWordToBan.trim()]
                           }
                         }));
                         setNewWordToBan("");
                       }
                     }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(knowledgeData.brandIdentity?.wordsToBan || []).map((word, index) => (
                        <Badge key={index} variant="destructive" className="pr-1">
                          {word}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 ml-1 text-current"
                            onClick={() => removeItem('wordsToBan', 'brandIdentity', index)}
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

            <Button 
              onClick={() => saveData()}
              disabled={!selectedCompany || knowledgeLoading}
              className="w-full"
            >
              {knowledgeLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </TabsContent>

        {/* Negócio */}
        <TabsContent value="negocio">
          <div className="space-y-8">
            {/* Mercado e Setor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mercado e Setor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sector">Setor *</Label>
                    <Input
                      id="sector"
                      placeholder="Ex: Tecnologia, Saúde, Educação..."
                      value={knowledgeData.business?.sector || ''}
                      onChange={(e) => setKnowledgeData(prev => ({
                        ...prev,
                        business: {
                          ...prev.business!,
                          sector: e.target.value
                        }
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="market">Mercado *</Label>
                    <Input
                      id="market"
                      placeholder="Ex: B2B SaaS, E-commerce, Consultoria..."
                      value={knowledgeData.business?.market || ''}
                      onChange={(e) => setKnowledgeData(prev => ({
                        ...prev,
                        business: {
                          ...prev.business!,
                          market: e.target.value
                        }
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maturity">Maturidade da Categoria</Label>
                    <Select 
                      value={knowledgeData.business?.maturity || 'growing'} 
                      onValueChange={(value: any) => setKnowledgeData(prev => ({
                        ...prev,
                        business: {
                          ...prev.business!,
                          maturity: value
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emerging">Emergente</SelectItem>
                        <SelectItem value="growing">Em Crescimento</SelectItem>
                        <SelectItem value="mature">Madura</SelectItem>
                        <SelectItem value="declining">Em Declínio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regulatory">Status Regulatório</Label>
                    <Input
                      id="regulatory"
                      placeholder="Ex: Regulamentado pela ANVISA, Sem regulação específica..."
                      value={knowledgeData.business?.regulatoryStatus || ''}
                      onChange={(e) => setKnowledgeData(prev => ({
                        ...prev,
                        business: {
                          ...prev.business!,
                          regulatoryStatus: e.target.value
                        }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Produtos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Portfólio de Produtos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Nome do Produto</Label>
                    <Input
                      id="productName"
                      placeholder="Ex: Sistema de Gestão"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="productFeatures">Principais Features</Label>
                    <Input
                      id="productFeatures"
                      placeholder="Ex: Dashboard, Relatórios, API"
                      value={newProduct.features[0] || ""}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, features: [e.target.value] }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productPrice">Faixa de Preço</Label>
                    <div className="flex gap-2">
                      <Input
                        id="productPrice"
                        placeholder="Ex: R$ 99-499/mês"
                        value={newProduct.priceRange}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, priceRange: e.target.value }))}
                      />
                      <Button type="button" onClick={() => {
                        if (newProduct.name.trim()) {
                          setKnowledgeData(prev => ({
                            ...prev,
                            business: {
                              ...prev.business!,
                              products: [...(prev.business?.products || []), {
                                name: newProduct.name.trim(),
                                features: newProduct.features.filter(f => f.trim()),
                                priceRange: newProduct.priceRange.trim()
                              }]
                            }
                          }));
                          setNewProduct({ name: "", features: [""], priceRange: "" });
                        }
                      }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {(knowledgeData.business?.products || []).map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-accent/5 rounded-lg">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Features: {product.features.join(", ")} | Preço: {product.priceRange}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setKnowledgeData(prev => ({
                          ...prev,
                          business: {
                            ...prev.business!,
                            products: prev.business!.products.filter((_, i) => i !== index)
                          }
                        }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Serviços */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Portfólio de Serviços</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceName">Nome do Serviço</Label>
                    <Input
                      id="serviceName"
                      placeholder="Ex: Consultoria Estratégica"
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serviceDescription">Descrição</Label>
                    <Input
                      id="serviceDescription"
                      placeholder="Ex: Análise e planejamento estratégico"
                      value={newService.description}
                      onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="servicePrice">Faixa de Preço</Label>
                    <div className="flex gap-2">
                      <Input
                        id="servicePrice"
                        placeholder="Ex: R$ 5.000-15.000"
                        value={newService.priceRange}
                        onChange={(e) => setNewService(prev => ({ ...prev, priceRange: e.target.value }))}
                      />
                      <Button type="button" onClick={() => {
                        if (newService.name.trim()) {
                          setKnowledgeData(prev => ({
                            ...prev,
                            business: {
                              ...prev.business!,
                              services: [...(prev.business?.services || []), {
                                name: newService.name.trim(),
                                description: newService.description.trim(),
                                priceRange: newService.priceRange.trim()
                              }]
                            }
                          }));
                          setNewService({ name: "", description: "", priceRange: "" });
                        }
                      }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {(knowledgeData.business?.services || []).map((service, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-accent/5 rounded-lg">
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {service.description} | Preço: {service.priceRange}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setKnowledgeData(prev => ({
                          ...prev,
                          business: {
                            ...prev.business!,
                            services: prev.business!.services.filter((_, i) => i !== index)
                          }
                        }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => saveData()}
              disabled={!selectedCompany || knowledgeLoading}
              className="w-full"
            >
              {knowledgeLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </TabsContent>

        {/* Público */}
        <TabsContent value="publico">
          <div className="space-y-8">
            {/* ICP - Demografia B2C */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Perfil Demográfico (B2C)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ageRange">Faixa Etária</Label>
                    <Input
                      id="ageRange"
                      placeholder="Ex: 25-45 anos"
                      value={knowledgeData.audience?.icp?.demographics?.ageRange || ''}
                      onChange={(e) => setKnowledgeData(prev => ({
                        ...prev,
                        audience: {
                          ...prev.audience!,
                          icp: {
                            ...prev.audience!.icp,
                            demographics: {
                              ...prev.audience!.icp.demographics,
                              ageRange: e.target.value
                            }
                          }
                        }
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Input
                      id="gender"
                      placeholder="Ex: Todos, Majoritariamente feminino..."
                      value={knowledgeData.audience?.icp?.demographics?.gender || ''}
                      onChange={(e) => setKnowledgeData(prev => ({
                        ...prev,
                        audience: {
                          ...prev.audience!,
                          icp: {
                            ...prev.audience!.icp,
                            demographics: {
                              ...prev.audience!.icp.demographics,
                              gender: e.target.value
                            }
                          }
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income">Renda</Label>
                    <Input
                      id="income"
                      placeholder="Ex: R$ 5.000-15.000/mês"
                      value={knowledgeData.audience?.icp?.demographics?.income || ''}
                      onChange={(e) => setKnowledgeData(prev => ({
                        ...prev,
                        audience: {
                          ...prev.audience!,
                          icp: {
                            ...prev.audience!.icp,
                            demographics: {
                              ...prev.audience!.icp.demographics,
                              income: e.target.value
                            }
                          }
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">Escolaridade</Label>
                    <Input
                      id="education"
                      placeholder="Ex: Ensino superior completo"
                      value={knowledgeData.audience?.icp?.demographics?.education || ''}
                      onChange={(e) => setKnowledgeData(prev => ({
                        ...prev,
                        audience: {
                          ...prev.audience!,
                          icp: {
                            ...prev.audience!.icp,
                            demographics: {
                              ...prev.audience!.icp.demographics,
                              education: e.target.value
                            }
                          }
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
                      onChange={(e) => setNewLocation(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newLocation.trim()) {
                          setKnowledgeData(prev => ({
                            ...prev,
                            audience: {
                              ...prev.audience!,
                              icp: {
                                ...prev.audience!.icp,
                                demographics: {
                                  ...prev.audience!.icp.demographics,
                                  location: [...(prev.audience!.icp.demographics.location || []), newLocation.trim()]
                                }
                              }
                            }
                          }));
                          setNewLocation("");
                        }
                      }}
                    />
                    <Button type="button" onClick={() => {
                      if (newLocation.trim()) {
                        setKnowledgeData(prev => ({
                          ...prev,
                          audience: {
                            ...prev.audience!,
                            icp: {
                              ...prev.audience!.icp,
                              demographics: {
                                ...prev.audience!.icp.demographics,
                                location: [...(prev.audience!.icp.demographics.location || []), newLocation.trim()]
                              }
                            }
                          }
                        }));
                        setNewLocation("");
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(knowledgeData.audience?.icp?.demographics?.location || []).map((loc, index) => (
                      <Badge key={index} variant="outline" className="pr-1">
                        {loc}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1"
                          onClick={() => setKnowledgeData(prev => ({
                            ...prev,
                            audience: {
                              ...prev.audience!,
                              icp: {
                                ...prev.audience!.icp,
                                demographics: {
                                  ...prev.audience!.icp.demographics,
                                  location: prev.audience!.icp.demographics.location?.filter((_, i) => i !== index) || []
                                }
                              }
                            }
                          }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ICP - Firmografia B2B */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Perfil Firmográfico (B2B)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companySize">Tamanho da Empresa</Label>
                  <Input
                    id="companySize"
                    placeholder="Ex: 50-200 funcionários, Startups, Grandes corporações..."
                    value={knowledgeData.audience?.icp?.firmographics?.companySize || ''}
                    onChange={(e) => setKnowledgeData(prev => ({
                      ...prev,
                      audience: {
                        ...prev.audience!,
                        icp: {
                          ...prev.audience!.icp,
                          firmographics: {
                            ...prev.audience!.icp.firmographics,
                            companySize: e.target.value
                          }
                        }
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
                      onChange={(e) => setNewIndustry(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newIndustry.trim()) {
                          setKnowledgeData(prev => ({
                            ...prev,
                            audience: {
                              ...prev.audience!,
                              icp: {
                                ...prev.audience!.icp,
                                firmographics: {
                                  ...prev.audience!.icp.firmographics,
                                  industry: [...(prev.audience!.icp.firmographics.industry || []), newIndustry.trim()]
                                }
                              }
                            }
                          }));
                          setNewIndustry("");
                        }
                      }}
                    />
                    <Button type="button" onClick={() => {
                      if (newIndustry.trim()) {
                        setKnowledgeData(prev => ({
                          ...prev,
                          audience: {
                            ...prev.audience!,
                            icp: {
                              ...prev.audience!.icp,
                              firmographics: {
                                ...prev.audience!.icp.firmographics,
                                industry: [...(prev.audience!.icp.firmographics.industry || []), newIndustry.trim()]
                              }
                            }
                          }
                        }));
                        setNewIndustry("");
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(knowledgeData.audience?.icp?.firmographics?.industry || []).map((ind, index) => (
                      <Badge key={index} variant="outline" className="pr-1">
                        {ind}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1"
                          onClick={() => setKnowledgeData(prev => ({
                            ...prev,
                            audience: {
                              ...prev.audience!,
                              icp: {
                                ...prev.audience!.icp,
                                firmographics: {
                                  ...prev.audience!.icp.firmographics,
                                  industry: prev.audience!.icp.firmographics.industry?.filter((_, i) => i !== index) || []
                                }
                              }
                            }
                          }))}
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
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newJobTitle.trim()) {
                          setKnowledgeData(prev => ({
                            ...prev,
                            audience: {
                              ...prev.audience!,
                              icp: {
                                ...prev.audience!.icp,
                                firmographics: {
                                  ...prev.audience!.icp.firmographics,
                                  jobTitles: [...(prev.audience!.icp.firmographics.jobTitles || []), newJobTitle.trim()]
                                }
                              }
                            }
                          }));
                          setNewJobTitle("");
                        }
                      }}
                    />
                    <Button type="button" onClick={() => {
                      if (newJobTitle.trim()) {
                        setKnowledgeData(prev => ({
                          ...prev,
                          audience: {
                            ...prev.audience!,
                            icp: {
                              ...prev.audience!.icp,
                              firmographics: {
                                ...prev.audience!.icp.firmographics,
                                jobTitles: [...(prev.audience!.icp.firmographics.jobTitles || []), newJobTitle.trim()]
                              }
                            }
                          }
                        }));
                        setNewJobTitle("");
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(knowledgeData.audience?.icp?.firmographics?.jobTitles || []).map((job, index) => (
                      <Badge key={index} variant="outline" className="pr-1">
                        {job}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1"
                          onClick={() => setKnowledgeData(prev => ({
                            ...prev,
                            audience: {
                              ...prev.audience!,
                              icp: {
                                ...prev.audience!.icp,
                                firmographics: {
                                  ...prev.audience!.icp.firmographics,
                                  jobTitles: prev.audience!.icp.firmographics.jobTitles?.filter((_, i) => i !== index) || []
                                }
                              }
                            }
                          }))}
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
                  
                  <Button type="button" onClick={() => {
                    if (newPersona.name.trim()) {
                      setKnowledgeData(prev => ({
                        ...prev,
                        audience: {
                          ...prev.audience!,
                          personas: [...(prev.audience!.personas || []), {
                            name: newPersona.name.trim(),
                            demographics: newPersona.demographics,
                            painPoints: newPersona.painPoints.filter(p => p.trim()),
                            objections: newPersona.objections.filter(o => o.trim()),
                            buyingTriggers: newPersona.buyingTriggers.filter(t => t.trim())
                          }]
                        }
                      }));
                      setNewPersona({
                        name: "",
                        demographics: {},
                        painPoints: [""],
                        objections: [""],
                        buyingTriggers: [""]
                      });
                    }
                  }} className="w-fit">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Persona
                  </Button>
                </div>

                <div className="space-y-4">
                  {(knowledgeData.audience?.personas || []).map((persona, index) => (
                    <div key={index} className="p-4 bg-accent/5 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{persona.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setKnowledgeData(prev => ({
                            ...prev,
                            audience: {
                              ...prev.audience!,
                              personas: prev.audience!.personas.filter((_, i) => i !== index)
                            }
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
                  <Button type="button" onClick={() => {
                    if (newQuestion.trim()) {
                      setKnowledgeData(prev => ({
                        ...prev,
                        audience: {
                          ...prev.audience!,
                          frequentQuestions: [...(prev.audience!.frequentQuestions || []), newQuestion.trim()]
                        }
                      }));
                      setNewQuestion("");
                    }
                  }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {(knowledgeData.audience?.frequentQuestions || []).map((question, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-accent/5 rounded-lg">
                      <p className="text-sm">{question}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setKnowledgeData(prev => ({
                          ...prev,
                          audience: {
                            ...prev.audience!,
                            frequentQuestions: prev.audience!.frequentQuestions.filter((_, i) => i !== index)
                          }
                        }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => saveData()}
              disabled={!selectedCompany || knowledgeLoading}
              className="w-full"
            >
              {knowledgeLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Semântica</CardTitle>
              <CardDescription>
                Palavras-chave e intenções de busca para otimização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Palavras-chave</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite palavras-chave (use vírgula para separar)"
                      value={newKeyword}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.includes(',')) {
                          const keywords = value.split(',').map(k => k.trim()).filter(k => k);
                          keywords.forEach(keyword => {
                            if (keyword) {
                              const currentKeywords = knowledgeData.seo?.keywords || [];
                              setKnowledgeData(prev => ({
                                ...prev,
                                seo: {
                                  ...prev.seo!,
                                  keywords: [...currentKeywords, { keyword: keyword, searchVolume: 0, difficulty: 0, intent: 'informational' as const }]
                                }
                              }));
                            }
                          });
                          setNewKeyword("");
                        } else {
                          setNewKeyword(value);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newKeyword.trim()) {
                          const currentKeywords = knowledgeData.seo?.keywords || [];
                          setKnowledgeData(prev => ({
                            ...prev,
                            seo: {
                              ...prev.seo!,
                              keywords: [...currentKeywords, { keyword: newKeyword, searchVolume: 0, difficulty: 0, intent: 'informational' as const }]
                            }
                          }));
                          setNewKeyword("");
                        }
                      }}
                    />
                    <Button onClick={() => {
                      if (newKeyword.trim()) {
                        const currentKeywords = knowledgeData.seo?.keywords || [];
                        setKnowledgeData(prev => ({
                          ...prev,
                          seo: {
                            ...prev.seo!,
                            keywords: [...currentKeywords, { keyword: newKeyword, searchVolume: 0, difficulty: 0, intent: 'informational' as const }]
                          }
                        }));
                        setNewKeyword("");
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(knowledgeData.seo?.keywords || []).map((keywordObj, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {keywordObj.keyword}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => {
                            const newKeywords = knowledgeData.seo?.keywords?.filter((_, i) => i !== index) || [];
                            setKnowledgeData(prev => ({
                              ...prev,
                              seo: {
                                ...prev.seo!,
                                keywords: newKeywords
                              }
                            }));
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Intenções de Busca</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite intenções de busca (use vírgula para separar)"
                      value={newSearchIntent}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.includes(',')) {
                          const intents = value.split(',').map(i => i.trim()).filter(i => i);
                          intents.forEach(intent => {
                            if (intent) {
                              const currentIntents = knowledgeData.seo?.searchIntents || [];
                              setKnowledgeData(prev => ({
                                ...prev,
                                seo: {
                                  ...prev.seo!,
                                  searchIntents: [...currentIntents, intent]
                                }
                              }));
                            }
                          });
                          setNewSearchIntent("");
                        } else {
                          setNewSearchIntent(value);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newSearchIntent.trim()) {
                          const currentIntents = knowledgeData.seo?.searchIntents || [];
                          setKnowledgeData(prev => ({
                            ...prev,
                            seo: {
                              ...prev.seo!,
                              searchIntents: [...currentIntents, newSearchIntent]
                            }
                          }));
                          setNewSearchIntent("");
                        }
                      }}
                    />
                    <Button onClick={() => {
                      if (newSearchIntent.trim()) {
                        const currentIntents = knowledgeData.seo?.searchIntents || [];
                        setKnowledgeData(prev => ({
                          ...prev,
                          seo: {
                            ...prev.seo!,
                            searchIntents: [...currentIntents, newSearchIntent]
                          }
                        }));
                        setNewSearchIntent("");
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(knowledgeData.seo?.searchIntents || []).map((intent, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {intent}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => {
                            const newIntents = knowledgeData.seo?.searchIntents?.filter((_, i) => i !== index) || [];
                            setKnowledgeData(prev => ({
                              ...prev,
                              seo: {
                                ...prev.seo!,
                                searchIntents: newIntents
                              }
                            }));
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => saveData()}
                disabled={!selectedCompany || knowledgeLoading}
                className="w-full"
              >
                {knowledgeLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formatos */}
        <TabsContent value="formatos">
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
                          checked={selectedFormat.platforms?.includes(platform) || false}
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
                    {(selectedFormat.platforms || []).map(platform => (
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
                  disabled={!selectedFormat.frequency || (knowledgeData.contentFormats?.preferredFormats?.some(f => f.type === selectedFormat.type) || false)}
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
                {(knowledgeData.contentFormats?.preferredFormats?.length || 0) === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum formato selecionado ainda</p>
                    <p className="text-xs mt-2">Adicione pelo menos um formato acima</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(knowledgeData.contentFormats?.preferredFormats || []).map((format, index) => {
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

            <Button 
              onClick={() => saveData()}
              disabled={!selectedCompany || knowledgeLoading}
              className="w-full"
            >
              {knowledgeLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}