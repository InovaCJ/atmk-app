import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface BasicInfoData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
}

interface BasicInfoProps {
  onNext: (data: BasicInfoData) => void;
  onSkip: () => void;
  initialData?: Partial<BasicInfoData>;
}

export function BasicInfo({ onNext, onSkip, initialData = {} }: BasicInfoProps) {
  const [formData, setFormData] = useState<BasicInfoData>({
    fullName: initialData.fullName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    companyName: initialData.companyName || ""
  });

  const [errors, setErrors] = useState<Partial<BasicInfoData>>({});

  const validateForm = () => {
    const newErrors: Partial<BasicInfoData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Nome da empresa é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  const handleInputChange = (field: keyof BasicInfoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormValid = Boolean(formData.fullName && formData.email && formData.companyName);

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={6}
      title="Dados Básicos"
      description="Vamos começar coletando algumas informações básicas sobre você e sua empresa"
      onNext={handleNext}
      onSkip={onSkip}
      isNextEnabled={isFormValid}
    >
      <div className="space-y-6">
        <Card className="border-0 bg-accent/5">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Seu nome completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Ex: Maria Silva Santos"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail profissional *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="maria@suaempresa.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da empresa *</Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Silva & Associados"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  className={errors.companyName ? "border-destructive" : ""}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg">
          <p>ℹ️ <strong>Privacidade:</strong> Seus dados são criptografados e utilizados apenas para personalizar os conteúdos gerados pela IA.</p>
        </div>
      </div>
    </OnboardingLayout>
  );
}