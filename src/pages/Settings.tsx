import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCompanies } from '@/hooks/useCompanies';
import { PlanModal } from '@/components/PlanModal';
import { 
  Building2, 
  Camera, 
  Trash2, 
  Plus, 
  Mail, 
  Phone, 
  User, 
  Globe, 
  Target, 
  Palette, 
  MessageSquare, 
  Shield, 
  LogOut, 
  CreditCard,
  Crown,
  Save,
  Edit2,
  AlertTriangle 
} from 'lucide-react';

const Settings = () => {
  const { signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { companies, loading: companiesLoading, createCompany, updateCompany, deleteCompany } = useCompanies();
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [profileImage, setProfileImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    target_audience: '',
    brand_voice: ''
  });
  const [editCompanyData, setEditCompanyData] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    target_audience: '',
    brand_voice: ''
  });

  // Update local state when profile loads
  React.useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
      setProfileImage(profile.avatar_url || '');
    }
  }, [profile]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF).",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho da imagem deve ser menor que 2MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target?.result as string;
      setProfileImage(base64Image);
      updateProfile({ avatar_url: base64Image });
    };
    reader.readAsDataURL(file);
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const saveProfile = () => {
    updateProfile(profileData);
  };

  const handleAddCompany = () => {
    if (!newCompany.name || !newCompany.industry) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e setor são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    createCompany({
      ...newCompany,
      logo_url: null,
      plan_type: 'free',
      plan_expires_at: null
    });

    setNewCompany({
      name: '',
      description: '',
      website: '',
      industry: '',
      target_audience: '',
      brand_voice: ''
    });
    setIsAddingCompany(false);
  };

  const startEditCompany = (company: any) => {
    setEditingCompany(company);
    setEditCompanyData({
      name: company.name,
      description: company.description || '',
      website: company.website || '',
      industry: company.industry || '',
      target_audience: company.target_audience || '',
      brand_voice: company.brand_voice || ''
    });
  };

  const saveEditCompany = () => {
    if (!editingCompany || !editCompanyData.name || !editCompanyData.industry) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e setor são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    updateCompany(editingCompany.id, editCompanyData);
    setEditingCompany(null);
    setEditCompanyData({
      name: '',
      description: '',
      website: '',
      industry: '',
      target_audience: '',
      brand_voice: ''
    });
  };

  const cancelEditCompany = () => {
    setEditingCompany(null);
    setEditCompanyData({
      name: '',
      description: '',
      website: '',
      industry: '',
      target_audience: '',
      brand_voice: ''
    });
  };

  const openDeleteDialog = (id: string) => {
    setCompanyToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCompany = () => {
    if (!companyToDelete) return;

    if (companies.length <= 1) {
      toast({
        title: "Não é possível remover",
        description: "Você deve ter pelo menos uma empresa cadastrada.",
        variant: "destructive"
      });
      setShowDeleteDialog(false);
      setCompanyToDelete(null);
      return;
    }

    deleteCompany(companyToDelete);
    setShowDeleteDialog(false);
    setCompanyToDelete(null);
  };

  const removeCompany = (id: string) => {
    openDeleteDialog(id);
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "free": return "secondary";
      case "pro": return "default";
      case "business": return "outline";
      default: return "secondary";
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case "free": return "Free";
      case "pro": return "Pro";
      case "business": return "Business";
      default: return "Free";
    }
  };

  if (profileLoading || companiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie seu perfil, empresas e plano de assinatura
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Plano
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Conta
          </TabsTrigger>
        </TabsList>

        {/* Perfil do Usuário */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais e informações de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileImage} />
                  <AvatarFallback className="text-lg">
                    {profileData.full_name ? profileData.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <Button variant="outline" size="sm" onClick={triggerImageUpload}>
                    <Camera className="h-4 w-4 mr-2" />
                    Alterar Foto
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG ou GIF. Máximo 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Seu nome completo"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveProfile} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Empresas */}
        <TabsContent value="companies" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Suas Empresas</h3>
              <p className="text-muted-foreground">
                Gerencie as empresas vinculadas à sua conta
              </p>
            </div>
            <Button 
              onClick={() => setIsAddingCompany(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Empresa
            </Button>
          </div>

          {isAddingCompany && (
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Nova Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        placeholder="Nome da empresa"
                        value={newCompany.name}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Setor *</Label>
                    <Input
                      id="industry"
                      placeholder="Ex: Tecnologia"
                      value={newCompany.industry}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, industry: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        placeholder="https://exemplo.com"
                        value={newCompany.website}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, website: e.target.value }))}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Público-Alvo</Label>
                    <div className="relative">
                      <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="targetAudience"
                        placeholder="Ex: Empresas B2B"
                        value={newCompany.target_audience}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, target_audience: e.target.value }))}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Breve descrição da empresa"
                    value={newCompany.description}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandVoice">Tom de Voz da Marca</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="brandVoice"
                      placeholder="Ex: Profissional e acessível"
                      value={newCompany.brand_voice}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, brand_voice: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingCompany(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddCompany}>
                    Salvar Empresa
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {editingCompany && (
            <Card>
              <CardHeader>
                <CardTitle>Editar Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editCompanyName">Nome da Empresa *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="editCompanyName"
                        placeholder="Nome da empresa"
                        value={editCompanyData.name}
                        onChange={(e) => setEditCompanyData(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editIndustry">Setor *</Label>
                    <Input
                      id="editIndustry"
                      placeholder="Ex: Tecnologia"
                      value={editCompanyData.industry}
                      onChange={(e) => setEditCompanyData(prev => ({ ...prev, industry: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editWebsite">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="editWebsite"
                        placeholder="https://exemplo.com"
                        value={editCompanyData.website}
                        onChange={(e) => setEditCompanyData(prev => ({ ...prev, website: e.target.value }))}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editTargetAudience">Público-Alvo</Label>
                    <div className="relative">
                      <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="editTargetAudience"
                        placeholder="Ex: Empresas B2B"
                        value={editCompanyData.target_audience}
                        onChange={(e) => setEditCompanyData(prev => ({ ...prev, target_audience: e.target.value }))}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDescription">Descrição</Label>
                  <Input
                    id="editDescription"
                    placeholder="Breve descrição da empresa"
                    value={editCompanyData.description}
                    onChange={(e) => setEditCompanyData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editBrandVoice">Tom de Voz da Marca</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="editBrandVoice"
                      placeholder="Ex: Profissional e acessível"
                      value={editCompanyData.brand_voice}
                      onChange={(e) => setEditCompanyData(prev => ({ ...prev, brand_voice: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={cancelEditCompany}>
                    Cancelar
                  </Button>
                  <Button onClick={saveEditCompany}>
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{company.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditCompany(company)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCompany(company.id)}
                        disabled={companies.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Plano:</span>
                      <Badge variant={getPlanBadgeVariant(company.plan_type)}>
                        {getPlanName(company.plan_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Setor:</span>
                      <span className="font-medium">{company.industry}</span>
                    </div>
                    {company.website && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Website:</span>
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          <Globe className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Criada em:</span>
                      <span className="text-xs">{new Date(company.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Plano */}
        <TabsContent value="plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Plano Atual
              </CardTitle>
              <CardDescription>
                Informações sobre seu plano e funcionalidades disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Plano Free</h3>
                  <Badge variant="secondary">Gratuito</Badge>
                </div>
                <Button variant="default" onClick={() => setShowPlanModal(true)}>
                  Fazer Upgrade
                </Button>
              </div>

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Recursos disponíveis:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Empresas ilimitadas</li>
                  <li>• Base de conhecimento</li>
                  <li>• Geração de conteúdo com IA</li>
                  <li>• Calendário de conteúdo</li>
                  <li>• Análise de tendências</li>
                  <li>• Suporte por email</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conta */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança da Conta
              </CardTitle>
              <CardDescription>
                Gerencie as configurações de segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alerta de Confirmação de Email */}
              <div className="border rounded-lg p-4 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <h4 className="font-medium text-amber-900 dark:text-amber-100">
                      Confirme seu email para manter sua conta segura
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-200">
                      Para garantir a segurança da sua conta, confirme seu email clicando no link enviado para seu email. 
                      Isso permitirá que você recupere sua senha e receba notificações importantes.
                    </p>
                    <div className="pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-950/40"
                        onClick={() => {
                          toast({
                            title: "Verificação de email",
                            description: "Verifique sua caixa de entrada e clique no link de confirmação.",
                          });
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Como confirmar email
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Sair da Conta</h4>
                  <p className="text-sm text-muted-foreground">
                    Encerrar sessão em todos os dispositivos
                  </p>
                </div>
                <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PlanModal 
        isOpen={showPlanModal} 
        onClose={() => setShowPlanModal(false)} 
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Excluir Empresa Permanentemente
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                <strong className="text-foreground">⚠️ ATENÇÃO: Esta ação é irreversível!</strong>
              </div>
              <div>
                Ao excluir esta empresa, você perderá permanentemente:
              </div>
              <ul className="list-disc ml-4 space-y-1">
                <li>Todos os dados da base de conhecimento</li>
                <li>Histórico de conteúdos gerados</li>
                <li>Configurações personalizadas</li>
                <li>Análises e relatórios</li>
              </ul>
              <div className="bg-muted p-3 rounded-lg">
                <strong className="text-foreground">💡 Recomendação:</strong>
                <p className="text-sm mt-1">
                  Para manter seus dados seguros, considere assinar um novo plano e adicionar uma nova empresa ao invés de excluir a atual.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCompany}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;