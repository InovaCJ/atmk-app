import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { 
  Camera, 
  Mail, 
  Phone, 
  User, 
  Shield, 
  LogOut, 
  Save,
  AlertTriangle 
} from 'lucide-react';

const Settings = () => {
  const { signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [profileImage, setProfileImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  if (profileLoading) {
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
          Gerencie seu perfil e configurações da conta
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
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
    </div>
  );
};

export default Settings;