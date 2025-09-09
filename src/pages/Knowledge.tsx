import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  Database, 
  BookOpen, 
  TrendingUp, 
  Plus,
  FileText,
  Globe,
  Brain,
  Target,
  Search
} from 'lucide-react';

export default function Knowledge() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Base de Conhecimento</h1>
        <p className="text-muted-foreground">
          Gerencie dados, tendências e integrações para alimentar sua estratégia de conteúdo
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Google Trends
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Knowledge Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">847</p>
                    <p className="text-sm text-muted-foreground">Documentos</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-muted-foreground">Tendências</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">89</p>
                    <p className="text-sm text-muted-foreground">Keywords</p>
                  </div>
                  <Search className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-muted-foreground">Personas</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Knowledge Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Categorias de Conhecimento
                </CardTitle>
                <CardDescription>
                  Organize seu conteúdo por categorias temáticas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Produtos & Serviços', count: 234, color: 'bg-blue-500' },
                  { name: 'FAQ & Objeções', count: 189, color: 'bg-green-500' },
                  { name: 'Personas & ICP', count: 156, color: 'bg-purple-500' },
                  { name: 'Tendências', count: 123, color: 'bg-orange-500' },
                  { name: 'Concorrentes', count: 89, color: 'bg-red-500' }
                ].map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Gerencie sua base de conhecimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Documento
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Conteúdo
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analisar Tendências
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Gerenciar Personas
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
              <CardDescription>
                Acompanhe as tendências do seu mercado e nichos de interesse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento. Em breve você poderá visualizar tendências 
                baseadas nos dados do seu onboarding e análises de mercado.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Conteúdo</CardTitle>
              <CardDescription>
                Organize e gerencie todo o conteúdo da sua base de conhecimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento. Em breve você poderá gerenciar todos os seus documentos, 
                FAQ, informações sobre personas e muito mais diretamente por aqui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrações Disponíveis</CardTitle>
              <CardDescription>
                Conecte ferramentas externas para enriquecer sua base de conhecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Google Trends</h4>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Coleta automática de tendências de pesquisa
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Apify (Web Scraping)</h4>
                    <Badge variant="secondary">Em breve</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Extração de dados de redes sociais e notícias
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">APIs de IA</h4>
                    <Badge variant="secondary">Em breve</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    OpenAI, Claude, Gemini, Perplexity e mais
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Looker Studio</h4>
                    <Badge variant="secondary">Em breve</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dashboards e relatórios avançados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}