import React, { useState } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Lock, Phone, Building, Eye, EyeOff } from 'lucide-react';

interface BasicInfoData {
  fullName: string;
  email: string;
  password: string;
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
    fullName: initialData.fullName || '',
    email: initialData.email || '',
    password: initialData.password || '',
    phone: initialData.phone || '',
    companyName: initialData.companyName || '',
  });

  const [errors, setErrors] = useState<Partial<BasicInfoData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Partial<BasicInfoData> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Nome da empresa é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create user account
      const redirectUrl = `${window.location.origin}/onboarding`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já possui uma conta. Tente fazer login.",
            variant: "destructive"
          });
        } else if (error.message.includes('Signups not allowed')) {
          toast({
            title: "Cadastro desabilitado",
            description: "O cadastro está temporariamente desabilitado. Entre em contato com o suporte.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive"
          });
        }
        return;
      }

      console.log('Signup success:', data);

      if (data.user) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Vamos configurar seu perfil e empresa.",
        });
        
        // Wait a moment for auth state to update, then continue
        setTimeout(() => {
          onNext(formData);
        }, 500);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BasicInfoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormValid = Boolean(formData.fullName && formData.email && formData.password && formData.companyName);

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={6}
      title="Criar Conta Gratuita"
      description="Vamos começar criando sua conta e coletando informações básicas sobre você e sua empresa"
      onNext={handleNext}
      onSkip={onSkip}
      isNextEnabled={isFormValid && !isLoading}
      isLoading={isLoading}
      nextButtonText={isLoading ? "Criando conta..." : "Criar Conta"}
    >
      <div className="space-y-6">
        <Card className="border-0 bg-accent/5">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="Seu nome completo"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`pl-9 ${errors.fullName ? "border-destructive" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-9 ${errors.email ? "border-destructive" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-9 pr-9 ${errors.password ? "border-destructive" : ""}`}
                    disabled={isLoading}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyName">Nome da Empresa *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    placeholder="Nome da sua empresa"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className={`pl-9 ${errors.companyName ? "border-destructive" : ""}`}
                    disabled={isLoading}
                  />
                </div>
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

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal"
              onClick={() => window.location.href = '/auth'}
              disabled={isLoading}
            >
              Fazer login
            </Button>
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}