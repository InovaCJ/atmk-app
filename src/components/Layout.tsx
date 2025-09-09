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
      case '/generate':
        return {
          title: 'Geração de IA',
          description: 'Crie conteúdos personalizados com inteligência artificial',
          hasFilter: false
        };
      case '/knowledge':
        return {
          title: 'Base de Conhecimento',
          description: 'Gerencie suas informações de negócio e identidade',
          hasFilter: false
        };
      case '/settings':
        return {
          title: 'Configurações',
          description: 'Personalize sua experiência na plataforma',
          hasFilter: false
        };
      default:
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