import { useState, useEffect } from "react";
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
  FileText, 
  X, 
  Plus,
  Save,
  Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { OnboardingData, BrandIdentityData, BusinessData, AudienceData, SEOData, ContentFormatsData } from "@/types/onboarding";

export default function Knowledge() {
  const [selectedCompany, setSelectedCompany] = useState("1");
  const [companies] = useState([
    { id: "1", name: "Minha Empresa" },
    { id: "2", name: "Empresa Exemplo" }
  ]);

  const [knowledgeData, setKnowledgeData] = useState<OnboardingData>({
    brandIdentity: {
      mission: "",
      vision: "",
      values: [],
      purpose: "",
      archetypes: [],
      valueProposition: "",
      differentials: [],
      categories: [],
      personalityScales: {
        formalInformal: 3,
        technicalAccessible: 3,
        seriousFun: 3
      },
      wordsToUse: [],
      wordsToBan: [],
      slogans: [],
      messagePillars: []
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

  // Temporary input states
  const [newValue, setNewValue] = useState("");
  const [newDifferential, setNewDifferential] = useState("");
  const [newArchetype, setNewArchetype] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newWordToUse, setNewWordToUse] = useState("");
  const [newWordToBan, setNewWordToBan] = useState("");
  const [newSlogan, setNewSlogan] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newSearchIntent, setNewSearchIntent] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", features: [], priceRange: "" });
  const [newService, setNewService] = useState({ name: "", description: "", priceRange: "" });
  const [newLocation, setNewLocation] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newPersona, setNewPersona] = useState({
    name: "",
    demographics: {},
    painPoints: [],
    objections: [],
    buyingTriggers: []
  });

  // Relevance flags
  const [isB2CRelevant, setIsB2CRelevant] = useState(true);
  const [isB2BRelevant, setIsB2BRelevant] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('onboardingData');
    if (savedData) {
      setKnowledgeData(JSON.parse(savedData));
    }
  }, []);

  const saveData = () => {
    localStorage.setItem('onboardingData', JSON.stringify(knowledgeData));
    toast({
      title: "Dados salvos!",
      description: "Suas informações foram atualizadas com sucesso."
    });
  };

  // Helper functions for adding/removing items from arrays
  const addToArray = (section: keyof OnboardingData, field: string, value: string, setter: (value: string) => void) => {
    if (!value.trim()) return;
    
    setKnowledgeData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section]?.[field] || []), value]
      }
    }));
    setter("");
  };

  const removeFromArray = (section: keyof OnboardingData, field: string, index: number) => {
    setKnowledgeData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section]?.[field]?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const updateBrandIdentity = (field: string, value: any) => {
    setKnowledgeData(prev => ({
      ...prev,
      brandIdentity: {
        ...prev.brandIdentity!,
        [field]: value
      }
    }));
  };

  const updateBusiness = (field: string, value: any) => {
    setKnowledgeData(prev => ({
      ...prev,
      business: {
        ...prev.business!,
        [field]: value
      }
    }));
  };

  const updateAudience = (path: string[], value: any) => {
    setKnowledgeData(prev => {
      const newData = { ...prev };
      let current = newData.audience!;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      
      return newData;
    });
  };

  const formatOptions = [
    { type: 'email', label: 'E-mail Marketing' },
    { type: 'blog', label: 'Blog Post' },
    { type: 'social', label: 'Post para Redes Sociais' },
    { type: 'video', label: 'Roteiro para Vídeo' },
    { type: 'podcast', label: 'Roteiro para Podcast' },
    { type: 'webinar', label: 'Roteiro para Webinar' }
  ];

  const [selectedFormat, setSelectedFormat] = useState({
    type: 'email',
    priority: 1,
    frequency: '',
    platforms: [] as string[]
  });

  const addFormat = () => {
    if (!selectedFormat.frequency) return;
    
    setKnowledgeData(prev => ({
      ...prev,
      contentFormats: {
        ...prev.contentFormats!,
        preferredFormats: [
          ...(prev.contentFormats?.preferredFormats || []),
          selectedFormat as any
        ]
      }
    }));
    
    setSelectedFormat({
      type: 'email',
      priority: 1,
      frequency: '',
      platforms: []
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Base de Conhecimento</h1>
        <p className="text-muted-foreground">
          Gerencie e edite todas as informações da sua empresa e estratégia de marca
        </p>
      </div>

      {/* Seletor de Empresa */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="company-select" className="font-medium">
              Configurando empresa:
            </Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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

        {/* Identidade e Estratégia de Marca */}
        <TabsContent value="identidade" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Essência da Marca</CardTitle>
              <CardDescription>
                Defina a missão, visão e valores da sua marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mission">Missão *</Label>
                <Textarea
                  id="mission"
                  placeholder="Por que sua empresa existe? Qual o propósito dela?"
                  value={knowledgeData.brandIdentity?.mission || ""}
                  onChange={(e) => updateBrandIdentity("mission", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vision">Visão *</Label>
                <Textarea
                  id="vision"
                  placeholder="Como você enxerga o futuro da sua empresa?"
                  value={knowledgeData.brandIdentity?.vision || ""}
                  onChange={(e) => updateBrandIdentity("vision", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Valores da Empresa</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite um valor"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addToArray('brandIdentity', 'values', newValue, setNewValue);
                      }
                    }}
                  />
                  <Button onClick={() => addToArray('brandIdentity', 'values', newValue, setNewValue)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {knowledgeData.brandIdentity?.values?.map((value, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {value}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('brandIdentity', 'values', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valueProposition">Proposta de Valor *</Label>
                <Textarea
                  id="valueProposition"
                  placeholder="O que torna sua empresa única no mercado?"
                  value={knowledgeData.brandIdentity?.valueProposition || ""}
                  onChange={(e) => updateBrandIdentity("valueProposition", e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label>Personalidade da Marca</Label>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Formal</span>
                      <span className="text-sm">Informal</span>
                    </div>
                    <Slider
                      value={[knowledgeData.brandIdentity?.personalityScales?.formalInformal || 3]}
                      onValueChange={(value) => updateBrandIdentity("personalityScales", {
                        ...knowledgeData.brandIdentity?.personalityScales,
                        formalInformal: value[0]
                      })}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Técnico</span>
                      <span className="text-sm">Acessível</span>
                    </div>
                    <Slider
                      value={[knowledgeData.brandIdentity?.personalityScales?.technicalAccessible || 3]}
                      onValueChange={(value) => updateBrandIdentity("personalityScales", {
                        ...knowledgeData.brandIdentity?.personalityScales,
                        technicalAccessible: value[0]
                      })}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Sério</span>
                      <span className="text-sm">Bem-humorado</span>
                    </div>
                    <Slider
                      value={[knowledgeData.brandIdentity?.personalityScales?.seriousFun || 3]}
                      onValueChange={(value) => updateBrandIdentity("personalityScales", {
                        ...knowledgeData.brandIdentity?.personalityScales,
                        seriousFun: value[0]
                      })}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveData} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Negócio e Oferta */}
        <TabsContent value="negocio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Negócio</CardTitle>
              <CardDescription>
                Detalhes sobre seu setor, mercado e ofertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector">Setor/Mercado *</Label>
                  <Input
                    id="sector"
                    placeholder="Ex: Tecnologia, Saúde, Educação..."
                    value={knowledgeData.business?.sector || ""}
                    onChange={(e) => updateBusiness("sector", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market">Mercado de Atuação *</Label>
                  <Input
                    id="market"
                    placeholder="Ex: B2B, B2C, Marketplace..."
                    value={knowledgeData.business?.market || ""}
                    onChange={(e) => updateBusiness("market", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maturity">Maturidade do Mercado</Label>
                  <Select value={knowledgeData.business?.maturity} onValueChange={(value) => updateBusiness("maturity", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emerging">Emergente</SelectItem>
                      <SelectItem value="growing">Em Crescimento</SelectItem>
                      <SelectItem value="mature">Maduro</SelectItem>
                      <SelectItem value="declining">Em Declínio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regulatoryStatus">Status Regulatório</Label>
                  <Input
                    id="regulatoryStatus"
                    placeholder="Ex: Regulamentado pela ANVISA..."
                    value={knowledgeData.business?.regulatoryStatus || ""}
                    onChange={(e) => updateBusiness("regulatoryStatus", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Produtos</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Nome do produto"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    />
                    <Input
                      placeholder="Principais features"
                      value={newProduct.features.join(", ")}
                      onChange={(e) => setNewProduct({...newProduct, features: e.target.value.split(", ")})}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Faixa de preço"
                        value={newProduct.priceRange}
                        onChange={(e) => setNewProduct({...newProduct, priceRange: e.target.value})}
                      />
                      <Button onClick={() => {
                        if (newProduct.name) {
                          updateBusiness("products", [...(knowledgeData.business?.products || []), newProduct]);
                          setNewProduct({name: "", features: [], priceRange: ""});
                        }
                      }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {knowledgeData.business?.products?.map((product, index) => (
                      <div key={index} className="p-3 border rounded-lg flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">Features: {product.features.join(", ")}</p>
                          <p className="text-sm text-muted-foreground">Preço: {product.priceRange}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newProducts = knowledgeData.business?.products?.filter((_, i) => i !== index) || [];
                            updateBusiness("products", newProducts);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveData} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Público e Personas */}
        <TabsContent value="publico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Público-Alvo e Personas</CardTitle>
              <CardDescription>
                Defina seu ICP e personas detalhadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="b2c-relevant" 
                    checked={isB2CRelevant}
                    onCheckedChange={(checked) => setIsB2CRelevant(checked === true)}
                  />
                  <Label htmlFor="b2c-relevant">Perfil Demográfico (B2C) é relevante</Label>
                </div>

                {isB2CRelevant && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="ageRange">Faixa Etária</Label>
                      <Input
                        id="ageRange"
                        placeholder="Ex: 25-40 anos"
                        value={knowledgeData.audience?.icp?.demographics?.ageRange || ""}
                        onChange={(e) => updateAudience(['icp', 'demographics', 'ageRange'], e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gênero</Label>
                      <Input
                        id="gender"
                        placeholder="Ex: Todos os gêneros"
                        value={knowledgeData.audience?.icp?.demographics?.gender || ""}
                        onChange={(e) => updateAudience(['icp', 'demographics', 'gender'], e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="income">Renda</Label>
                      <Input
                        id="income"
                        placeholder="Ex: R$ 5.000 - R$ 15.000"
                        value={knowledgeData.audience?.icp?.demographics?.income || ""}
                        onChange={(e) => updateAudience(['icp', 'demographics', 'income'], e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education">Escolaridade</Label>
                      <Input
                        id="education"
                        placeholder="Ex: Ensino superior completo"
                        value={knowledgeData.audience?.icp?.demographics?.education || ""}
                        onChange={(e) => updateAudience(['icp', 'demographics', 'education'], e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="b2b-relevant" 
                    checked={isB2BRelevant}
                    onCheckedChange={(checked) => setIsB2BRelevant(checked === true)}
                  />
                  <Label htmlFor="b2b-relevant">Perfil Firmográfico (B2B) é relevante</Label>
                </div>

                {isB2BRelevant && (
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="companySize">Tamanho da Empresa</Label>
                      <Input
                        id="companySize"
                        placeholder="Ex: 10-50 funcionários"
                        value={knowledgeData.audience?.icp?.firmographics?.companySize || ""}
                        onChange={(e) => updateAudience(['icp', 'firmographics', 'companySize'], e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Setores de Atuação</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite um setor"
                          value={newIndustry}
                          onChange={(e) => setNewIndustry(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newIndustry.trim()) {
                              const currentIndustries = knowledgeData.audience?.icp?.firmographics?.industry || [];
                              updateAudience(['icp', 'firmographics', 'industry'], [...currentIndustries, newIndustry]);
                              setNewIndustry("");
                            }
                          }}
                        />
                        <Button onClick={() => {
                          if (newIndustry.trim()) {
                            const currentIndustries = knowledgeData.audience?.icp?.firmographics?.industry || [];
                            updateAudience(['icp', 'firmographics', 'industry'], [...currentIndustries, newIndustry]);
                            setNewIndustry("");
                          }
                        }}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {knowledgeData.audience?.icp?.firmographics?.industry?.map((industry, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {industry}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => {
                                const newIndustries = knowledgeData.audience?.icp?.firmographics?.industry?.filter((_, i) => i !== index) || [];
                                updateAudience(['icp', 'firmographics', 'industry'], newIndustries);
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Perguntas Frequentes</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite uma pergunta frequente"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newQuestion.trim()) {
                          const currentQuestions = knowledgeData.audience?.frequentQuestions || [];
                          setKnowledgeData(prev => ({
                            ...prev,
                            audience: {
                              ...prev.audience!,
                              frequentQuestions: [...currentQuestions, newQuestion]
                            }
                          }));
                          setNewQuestion("");
                        }
                      }}
                    />
                    <Button onClick={() => {
                      if (newQuestion.trim()) {
                        const currentQuestions = knowledgeData.audience?.frequentQuestions || [];
                        setKnowledgeData(prev => ({
                          ...prev,
                          audience: {
                            ...prev.audience!,
                            frequentQuestions: [...currentQuestions, newQuestion]
                          }
                        }));
                        setNewQuestion("");
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {knowledgeData.audience?.frequentQuestions?.map((question, index) => (
                      <div key={index} className="p-3 border rounded-lg flex justify-between items-start">
                        <p className="text-sm">{question}</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newQuestions = knowledgeData.audience?.frequentQuestions?.filter((_, i) => i !== index) || [];
                            setKnowledgeData(prev => ({
                              ...prev,
                              audience: {
                                ...prev.audience!,
                                frequentQuestions: newQuestions
                              }
                            }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveData} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO & Semântica */}
        <TabsContent value="seo" className="space-y-6">
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
                      placeholder="Digite uma palavra-chave"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
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
                    {knowledgeData.seo?.keywords?.map((keywordObj, index) => (
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
                      placeholder="Digite uma intenção de busca"
                      value={newSearchIntent}
                      onChange={(e) => setNewSearchIntent(e.target.value)}
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
                    {knowledgeData.seo?.searchIntents?.map((intent, index) => (
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

              <div className="flex justify-end">
                <Button onClick={saveData} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formatos de Conteúdo */}
        <TabsContent value="formatos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Formatos de Conteúdo</CardTitle>
              <CardDescription>
                Configure os formatos preferidos para criação de conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="formatType">Tipo de Conteúdo</Label>
                    <Select value={selectedFormat.type} onValueChange={(value) => setSelectedFormat({...selectedFormat, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formatOptions.map((option) => (
                          <SelectItem key={option.type} value={option.type}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequência</Label>
                    <Select value={selectedFormat.frequency} onValueChange={(value) => setSelectedFormat({...selectedFormat, frequency: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select value={selectedFormat.priority.toString()} onValueChange={(value) => setSelectedFormat({...selectedFormat, priority: parseInt(value)})}>
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
                </div>

                <Button onClick={addFormat} disabled={!selectedFormat.frequency}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Formato
                </Button>
              </div>

              {knowledgeData.contentFormats?.preferredFormats && knowledgeData.contentFormats.preferredFormats.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Formatos Configurados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {knowledgeData.contentFormats.preferredFormats.map((format, index) => (
                      <div key={index} className="p-4 border rounded-lg flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {formatOptions.find(opt => opt.type === format.type)?.label}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Frequência: {format.frequency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Prioridade: {format.priority === 1 ? 'Alta' : format.priority === 2 ? 'Média' : 'Baixa'}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newFormats = knowledgeData.contentFormats?.preferredFormats?.filter((_, i) => i !== index) || [];
                            setKnowledgeData(prev => ({
                              ...prev,
                              contentFormats: {
                                ...prev.contentFormats!,
                                preferredFormats: newFormats
                              }
                            }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={saveData} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}