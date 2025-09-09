import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Building2, 
  CreditCard, 
  Save,
  Plus,
  Edit2,
  Trash2,
  Crown,
  AlertTriangle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { PlanModal } from "@/components/PlanModal";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  createdAt: string;
}

interface PlanUsage {
  currentPlan: "free" | "pro" | "business";
  contentGenerated: number;
  contentLimit: number;
  usersCount: number;
  usersLimit: number;
  companiesCount: number;
  companiesLimit: number;
}

export default function Settings() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    phone: ""
  });

  const [companies, setCompanies] = useState<Company[]>([
    {
      id: "1",
      name: "Minha Empresa",
      industry: "Tecnologia",
      size: "10-50 funcionários",
      createdAt: "2024-01-15"
    }
  ]);

  const [planUsage, setPlanUsage] = useState<PlanUsage>({
    currentPlan: "free",
    contentGenerated: 3,
    contentLimit: 10,
    usersCount: 1,
    usersLimit: 1,
    companiesCount: 1,
    companiesLimit: 1
  });

  const [newCompany, setNewCompany] = useState({ name: "", industry: "", size: "" });
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editCompanyData, setEditCompanyData] = useState({ name: "", industry: "", size: "" });
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    const savedCompanies = localStorage.getItem('userCompanies');
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    }

    const savedUsage = localStorage.getItem('planUsage');
    if (savedUsage) {
      setPlanUsage(JSON.parse(savedUsage));
    }
  }, []);

  const saveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso."
    });
  };

  const saveCompanies = () => {
    localStorage.setItem('userCompanies', JSON.stringify(companies));
  };

  const addCompany = () => {
    if (!newCompany.name || !newCompany.industry) return;

    if (planUsage.companiesCount >= planUsage.companiesLimit) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de empresas do seu plano atual.",
        variant: "destructive"
      });
      return;
    }

    const company: Company = {
      id: Date.now().toString(),
      name: newCompany.name,
      industry: newCompany.industry,
      size: newCompany.size,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedCompanies = [...companies, company];
    setCompanies(updatedCompanies);
    saveCompanies();
    
    setPlanUsage(prev => ({
      ...prev,
      companiesCount: prev.companiesCount + 1
    }));

    setNewCompany({ name: "", industry: "", size: "" });
    setIsAddingCompany(false);

    toast({
      title: "Empresa adicionada!",
      description: "Nova empresa foi criada com sucesso."
    });
  };

  const startEditCompany = (company: Company) => {
    setEditingCompany(company);
    setEditCompanyData({
      name: company.name,
      industry: company.industry,
      size: company.size
    });
  };

  const saveEditCompany = () => {
    if (!editingCompany || !editCompanyData.name || !editCompanyData.industry) return;

    const updatedCompanies = companies.map(company =>
      company.id === editingCompany.id
        ? { ...company, ...editCompanyData }
        : company
    );

    setCompanies(updatedCompanies);
    localStorage.setItem('userCompanies', JSON.stringify(updatedCompanies));
    
    setEditingCompany(null);
    setEditCompanyData({ name: "", industry: "", size: "" });

    toast({
      title: "Empresa atualizada!",
      description: "Os dados da empresa foram salvos com sucesso."
    });
  };

  const cancelEditCompany = () => {
    setEditingCompany(null);
    setEditCompanyData({ name: "", industry: "", size: "" });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF).",
        variant: "destructive"
      });
      return;
    }

    // Verificar tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho da imagem deve ser menor que 2MB.",
        variant: "destructive"
      });
      return;
    }

    // Converter para base64 e atualizar o perfil
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target?.result as string;
      setUserProfile(prev => ({ ...prev, avatar: base64Image }));
      
      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi alterada com sucesso."
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
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

    const updatedCompanies = companies.filter(c => c.id !== companyToDelete);
    setCompanies(updatedCompanies);
    localStorage.setItem('userCompanies', JSON.stringify(updatedCompanies));
    
    setPlanUsage(prev => ({
      ...prev,
      companiesCount: prev.companiesCount - 1
    }));

    setShowDeleteDialog(false);
    setCompanyToDelete(null);

    toast({
      title: "Empresa excluída",
      description: "A empresa e todos os dados associados foram removidos permanentemente."
    });
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie seu perfil, empresas e plano de assinatura
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
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
            Plano & Uso
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
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback className="text-lg">
                    {userProfile.fullName ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
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
                  <Input
                    id="fullName"
                    placeholder="Seu nome completo"
                    value={userProfile.fullName}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
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
              disabled={planUsage.companiesCount >= planUsage.companiesLimit}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa *</Label>
                    <Input
                      id="companyName"
                      placeholder="Nome da empresa"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                    />
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
                    <Label htmlFor="size">Tamanho</Label>
                    <Input
                      id="size"
                      placeholder="Ex: 10-50 funcionários"
                      value={newCompany.size}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, size: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingCompany(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addCompany}>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editCompanyName">Nome da Empresa *</Label>
                    <Input
                      id="editCompanyName"
                      placeholder="Nome da empresa"
                      value={editCompanyData.name}
                      onChange={(e) => setEditCompanyData(prev => ({ ...prev, name: e.target.value }))}
                    />
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
                    <Label htmlFor="editSize">Tamanho</Label>
                    <Input
                      id="editSize"
                      placeholder="Ex: 10-50 funcionários"
                      value={editCompanyData.size}
                      onChange={(e) => setEditCompanyData(prev => ({ ...prev, size: e.target.value }))}
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
              <Card key={company.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
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
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Setor:</strong> {company.industry}</p>
                    {company.size && <p><strong>Tamanho:</strong> {company.size}</p>}
                    <p><strong>Criado em:</strong> {new Date(company.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {planUsage.companiesCount >= planUsage.companiesLimit && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                Você atingiu o limite de {planUsage.companiesLimit} empresa(s) do seu plano atual.
              </p>
              <Button variant="link" className="mt-2" onClick={() => setShowPlanModal(true)}>
                Fazer upgrade do plano
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Plano & Uso */}
        <TabsContent value="plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Plano Atual
              </CardTitle>
              <CardDescription>
                Informações sobre seu plano e consumo atual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Plano {getPlanName(planUsage.currentPlan)}
                  </h3>
                  <Badge variant={getPlanBadgeVariant(planUsage.currentPlan)}>
                    {planUsage.currentPlan === "free" ? "Gratuito" : 
                     planUsage.currentPlan === "pro" ? "R$ 29,90/mês" : "Personalizado"}
                  </Badge>
                </div>
                <Button variant="default" onClick={() => setShowPlanModal(true)}>
                  Fazer Upgrade
                </Button>
              </div>

              <Separator />

              <div className="space-y-6">
                {/* Uso de Conteúdos */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Conteúdos do Teste Gratuito</span>
                    <span className="text-sm text-muted-foreground">
                      {planUsage.contentGenerated} de {planUsage.contentLimit}
                    </span>
                  </div>
                  <Progress 
                    value={(planUsage.contentGenerated / planUsage.contentLimit) * 100} 
                    className="h-2"
                  />
                  {planUsage.contentGenerated >= planUsage.contentLimit && (
                    <p className="text-sm text-destructive">
                      Teste gratuito esgotado! Faça upgrade para gerar mais conteúdos.
                    </p>
                  )}
                </div>

                {/* Usuários */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Usuários</span>
                    <span className="text-sm text-muted-foreground">
                      {planUsage.usersCount} de {planUsage.usersLimit}
                    </span>
                  </div>
                  <Progress 
                    value={(planUsage.usersCount / planUsage.usersLimit) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Empresas */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Empresas</span>
                    <span className="text-sm text-muted-foreground">
                      {planUsage.companiesCount} de {planUsage.companiesLimit}
                    </span>
                  </div>
                  <Progress 
                    value={(planUsage.companiesCount / planUsage.companiesLimit) * 100} 
                    className="h-2"
                  />
                </div>
              </div>

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Benefícios do seu plano:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {planUsage.currentPlan === "free" && (
                    <>
                      <li>• 10 conteúdos como teste gratuito</li>
                      <li>• 1 usuário</li>
                      <li>• 1 empresa</li>
                      <li>• Suporte por email</li>
                    </>
                  )}
                  {planUsage.currentPlan === "pro" && (
                    <>
                      <li>• Até 100 conteúdos por mês</li>
                      <li>• 1 usuário</li>
                      <li>• 1 empresa</li>
                      <li>• Suporte prioritário</li>
                      <li>• Templates premium</li>
                    </>
                  )}
                  {planUsage.currentPlan === "business" && (
                    <>
                      <li>• Conteúdos ilimitados*</li>
                      <li>• Usuários ilimitados*</li>
                      <li>• Empresas ilimitadas*</li>
                      <li>• Suporte premium</li>
                      <li>• API acesso</li>
                      <li>• Customizações</li>
                    </>
                  )}
                </ul>
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
}