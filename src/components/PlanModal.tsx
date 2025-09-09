import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Check, 
  Crown, 
  Star, 
  Zap,
  Users,
  Building2,
  FileText
} from "lucide-react";

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: "Gratuito",
    description: "Ideal para começar",
    icon: Star,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    features: [
      "10 conteúdos por mês",
      "1 usuário",
      "1 empresa",
      "Suporte por email",
      "Templates básicos"
    ],
    limitations: [
      "Após 10 conteúdos, gerador é travado",
      "Oportunidades são travadas",
      "Sem acesso a templates premium"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 29,90",
    period: "/mês",
    description: "Para profissionais",
    icon: Zap,
    color: "text-primary",
    bgColor: "bg-primary/5",
    popular: true,
    features: [
      "100 conteúdos por mês",
      "1 usuário",
      "1 empresa",
      "Suporte prioritário",
      "Templates premium",
      "Análises avançadas"
    ],
    limitations: []
  },
  {
    id: "business",
    name: "Business",
    price: "R$ 29,90",
    period: "/mês + complementos",
    description: "Totalmente personalizado",
    icon: Crown,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    features: [
      "Conteúdos personalizados",
      "Usuários personalizados",
      "Empresas personalizadas",
      "Suporte premium",
      "API de acesso",
      "Integrações customizadas"
    ],
    addons: [
      "+ R$ 20/mês para cada 100 conteúdos adicionais",
      "+ R$ 10/mês por usuário editor adicional",
      "+ R$ 15/mês por empresa adicional"
    ],
    limitations: []
  }
];

export function PlanModal({ isOpen, onClose }: PlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Aqui você implementaria a lógica de seleção/upgrade do plano
    console.log("Selected plan:", planId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b px-6 py-4 z-10">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">Escolha seu plano</DialogTitle>
                <p className="text-muted-foreground mt-1">
                  Selecione o plano que melhor se adapta às suas necessidades
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all duration-200 hover:shadow-lg ${
                    plan.popular ? 'border-primary shadow-md' : ''
                  } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Mais Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className={`text-center ${plan.bgColor} rounded-t-lg`}>
                    <div className="flex justify-center mb-2">
                      <div className={`p-3 rounded-full bg-background shadow-sm`}>
                        <IconComponent className={`h-6 w-6 ${plan.color}`} />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">
                        {plan.price}
                        {plan.period && <span className="text-base font-normal">{plan.period}</span>}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Incluso no plano:
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.addons && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-amber-600">Complementos:</h4>
                        <ul className="space-y-2">
                          {plan.addons.map((addon, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                              <Star className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {addon}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {plan.limitations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-destructive">Limitações:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-destructive">
                              <X className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button 
                      onClick={() => handleSelectPlan(plan.id)}
                      className="w-full mt-6"
                      variant={plan.popular ? "default" : "outline"}
                      disabled={plan.id === "free"}
                    >
                      {plan.id === "free" ? "Plano Atual" : `Escolher ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Comparison Table */}
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-6 text-center">Comparação Detalhada</h3>
            <div className="overflow-x-auto">
              <table className="w-full border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-4 border-b font-semibold">Recursos</th>
                    <th className="text-center p-4 border-b font-semibold">Free</th>
                    <th className="text-center p-4 border-b font-semibold">Pro</th>
                    <th className="text-center p-4 border-b font-semibold">Business</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Conteúdos por mês
                    </td>
                    <td className="text-center p-4">10</td>
                    <td className="text-center p-4">100</td>
                    <td className="text-center p-4">Ilimitado*</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Número de usuários
                    </td>
                    <td className="text-center p-4">1</td>
                    <td className="text-center p-4">1</td>
                    <td className="text-center p-4">Ilimitado*</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Número de empresas
                    </td>
                    <td className="text-center p-4">1</td>
                    <td className="text-center p-4">1</td>
                    <td className="text-center p-4">Ilimitado*</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Templates Premium</td>
                    <td className="text-center p-4">
                      <X className="h-4 w-4 text-destructive mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Suporte</td>
                    <td className="text-center p-4">Email</td>
                    <td className="text-center p-4">Prioritário</td>
                    <td className="text-center p-4">Premium</td>
                  </tr>
                  <tr>
                    <td className="p-4">API de Acesso</td>
                    <td className="text-center p-4">
                      <X className="h-4 w-4 text-destructive mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <X className="h-4 w-4 text-destructive mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              * No plano Business, recursos são cobrados por uso adicional conforme especificado
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}