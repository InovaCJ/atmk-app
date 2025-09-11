import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { BusinessData } from "@/types/onboarding";

interface BusinessOfferProps {
  onNext: (data: BusinessData) => void;
  onBack: () => void;
  onSkip: () => void;
  initialData?: Partial<BusinessData>;
}

export function BusinessOffer({ onNext, onBack, onSkip, initialData = {} }: BusinessOfferProps) {
  const [formData, setFormData] = useState<BusinessData>({
    sector: initialData.sector || "",
    market: initialData.market || "",
    maturity: initialData.maturity || 'growing',
    regulatoryStatus: initialData.regulatoryStatus || "",
    products: initialData.products || [],
    services: initialData.services || [],
    roadmap: initialData.roadmap || []
  });

  const [newProduct, setNewProduct] = useState({ name: "", features: [""], priceRange: "" });
  const [newService, setNewService] = useState({ name: "", description: "", priceRange: "" });
  const [newRoadmapItem, setNewRoadmapItem] = useState("");

  const addProduct = () => {
    if (newProduct.name.trim()) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, {
          name: newProduct.name.trim(),
          features: newProduct.features.filter(f => f.trim()),
          priceRange: newProduct.priceRange.trim()
        }]
      }));
      setNewProduct({ name: "", features: [""], priceRange: "" });
    }
  };

  const addService = () => {
    if (newService.name.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, {
          name: newService.name.trim(),
          description: newService.description.trim(),
          priceRange: newService.priceRange.trim()
        }]
      }));
      setNewService({ name: "", description: "", priceRange: "" });
    }
  };

  const addRoadmapItem = () => {
    if (newRoadmapItem.trim()) {
      setFormData(prev => ({
        ...prev,
        roadmap: [...prev.roadmap, newRoadmapItem.trim()]
      }));
      setNewRoadmapItem("");
    }
  };

  const removeItem = (field: 'products' | 'services' | 'roadmap', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    // Auto-save any pending items before proceeding
    if (newProduct.name.trim()) {
      addProduct();
    }
    if (newService.name.trim()) {
      addService();
    }
    if (newRoadmapItem.trim()) {
      addRoadmapItem();
    }
    
    // Use a small delay to ensure state updates are complete
    setTimeout(() => {
      onNext(formData);
    }, 100);
  };

  const isFormValid = Boolean(formData.sector && formData.market);

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={6}
      title="Negócio e Oferta"
      description="Descreva seu mercado, produtos e serviços"
      onNext={handleNext}
      onBack={onBack}
      onSkip={onSkip}
      isNextEnabled={isFormValid}
    >
      <div className="space-y-8">
        {/* Mercado */}
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
                  value={formData.sector}
                  onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="market">Mercado *</Label>
                <Input
                  id="market"
                  placeholder="Ex: B2B SaaS, E-commerce, Consultoria..."
                  value={formData.market}
                  onChange={(e) => setFormData(prev => ({ ...prev, market: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maturity">Maturidade da Categoria</Label>
                <Select value={formData.maturity} onValueChange={(value: any) => setFormData(prev => ({ ...prev, maturity: value }))}>
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
                  value={formData.regulatoryStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, regulatoryStatus: e.target.value }))}
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
                  onKeyPress={(e) => e.key === 'Enter' && addProduct()}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="productFeatures">Principais Features</Label>
                <Input
                  id="productFeatures"
                  placeholder="Ex: Dashboard, Relatórios, API"
                  value={newProduct.features[0] || ""}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, features: [e.target.value] }))}
                  onKeyPress={(e) => e.key === 'Enter' && addProduct()}
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
                    onKeyPress={(e) => e.key === 'Enter' && addProduct()}
                  />
                  <Button type="button" onClick={addProduct}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {formData.products.map((product, index) => (
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
                    onClick={() => removeItem('products', index)}
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
                  onKeyPress={(e) => e.key === 'Enter' && addService()}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serviceDescription">Descrição</Label>
                <Input
                  id="serviceDescription"
                  placeholder="Ex: Análise e planejamento estratégico"
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && addService()}
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
                    onKeyPress={(e) => e.key === 'Enter' && addService()}
                  />
                  <Button type="button" onClick={addService}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {formData.services.map((service, index) => (
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
                    onClick={() => removeItem('services', index)}
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