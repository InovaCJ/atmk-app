import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export function Layout() {
  const location = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState("30 dias");
  
  const periodOptions = [
    "7 dias",
    "30 dias", 
    "60 dias",
    "90 dias"
  ];
  
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Dashboard',
          description: 'Gerencie suas oportunidades de conteúdo e performance',
          hasFilter: true
        };
      case '/library':
        return {
          title: 'Biblioteca',
          description: 'Seus conteúdos organizados e prontos para usar',
          hasFilter: false
        };
      case '/content/create':
        return {
          title: 'Criar Conteúdo',
          description: 'Gere conteúdos a partir de notícias, URLs ou contextos livres',
          hasFilter: false
        };
      case '/automations':
        return {
          title: 'Automações',
          description: 'Crie fluxos para gerar conteúdos automaticamente',
          hasFilter: false
        };
      case '/clients':
        return {
          title: 'Clientes',
          description: 'Gerencie seus clientes e suas configurações',
          hasFilter: false
        };
      case '/settings':
        return {
          title: 'Configurações',
          description: 'Personalize sua experiência na plataforma',
          hasFilter: false
        };
      default:
        if (location.pathname.startsWith('/automations/')) {
          return {
            title: 'Construtor de Automação',
            description: 'Defina gatilhos, objetivos, categorias e frequência',
            hasFilter: false
          };
        }
        // Verificar se é uma rota de detalhes do cliente
        if (location.pathname.startsWith('/clients/') && location.pathname !== '/clients') {
          return {
            title: 'Detalhe do Cliente',
            description: 'Configure e gerencie as informações do cliente',
            hasFilter: false
          };
        }
        return {
          title: 'ATMK Content AI',
          description: '',
          hasFilter: false
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-20 items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-lg font-semibold">{pageInfo.title}</h1>
                  {pageInfo.description && (
                    <p className="text-sm text-muted-foreground">{pageInfo.description}</p>
                  )}
                </div>
              </div>
              {pageInfo.hasFilter && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Últimos {selectedPeriod}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {periodOptions.map((period) => (
                      <DropdownMenuItem
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className="cursor-pointer"
                      >
                        Últimos {period}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>
          <div className="flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}