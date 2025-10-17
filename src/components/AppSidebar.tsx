import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  BookOpen,
  Brain,
  Home,
  Settings,
  Sparkles,
  Star,
  Building2,
  ChevronDown,
  User
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlanModal } from "./PlanModal";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { useClientContext } from "@/contexts/ClientContext";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Criar Conteúdo", url: "/content/create", icon: Sparkles },
  { title: "Biblioteca", url: "/library", icon: BookOpen },
  // Clientes movido para footer
];

const managementItems = [
  { title: "Clientes", url: "/clients", icon: Building2 },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [showPlanModal, setShowPlanModal] = useState(false);
  const { selectedClient, clients, setSelectedClientId } = useClientContext();

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent";

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border h-20 !flex !flex-row !items-center p-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden leading-none">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                ATMK
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Content AI</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Seção do Cliente Selecionado */}
          {clients.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Cliente Atual</SidebarGroupLabel>
              <SidebarGroupContent>
                {clients.length === 1 ? (
                  // Exibir cliente único
                  <div className="flex items-center gap-2 p-2 rounded-md bg-sidebar-accent/50">
                    <User className="h-4 w-4 text-sidebar-accent-foreground" />
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-medium text-sidebar-accent-foreground">
                        {selectedClient?.name}
                      </span>
                      <span className="text-xs text-sidebar-accent-foreground/70">
                        {selectedClient?.slug}
                      </span>
                    </div>
                  </div>
                ) : (
                  // Select para múltiplos clientes
                  <div className="px-2">
                    <Select value={selectedClient?.id || ""} onValueChange={handleClientChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um cliente">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="group-data-[collapsible=icon]:hidden">
                              {selectedClient?.name || "Selecione um cliente"}
                            </span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{client.name}</span>
                              <span className="text-xs text-muted-foreground">{client.slug}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <SidebarGroupLabel>Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={currentPath === item.url}>
                      <NavLink to={item.url} end>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <div className="space-y-3">
            {/* Menu de Gestão */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managementItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={currentPath === item.url}>
                        <NavLink to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Upgrade Pro */}
            <div className="space-y-2 group-data-[collapsible=icon]:hidden">
              <Button 
                onClick={() => setShowPlanModal(true)}
                variant="outline" 
                className="w-full justify-start bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:bg-primary/10"
              >
                <Star className="h-4 w-4 mr-2" />
                Upgrade Pro
              </Button>
              <div className="text-xs text-muted-foreground px-2">
                <p>Plano Gratuito</p>
                <p>2/10 teste gratuito</p>
              </div>
            </div>
            <div className="hidden group-data-[collapsible=icon]:block">
              <Button 
                onClick={() => setShowPlanModal(true)}
                variant="outline" 
                size="icon"
                className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:bg-primary/10"
              >
                <Star className="h-4 w-4" />
              </Button>
            </div>
            
            <UserProfileDropdown />
          </div>
        </SidebarFooter>
      </Sidebar>

      <PlanModal 
        isOpen={showPlanModal} 
        onClose={() => setShowPlanModal(false)} 
      />
    </>
  );
}