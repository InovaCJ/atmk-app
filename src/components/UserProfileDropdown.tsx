import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  ChevronDown,
  LogOut, 
  Settings, 
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export function UserProfileDropdown() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = profile?.email || user?.email || '';
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-3 h-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
        >
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ""} alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col items-start text-left group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium leading-none">{userName}</p>
            </div>
          </div>
          
          <ChevronDown className="h-4 w-4 opacity-50 group-data-[collapsible=icon]:hidden" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 bg-background/95 backdrop-blur-sm border shadow-lg" 
        align="end"
        side="right"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ""} alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <NavLink to="/settings" className="flex items-center gap-2 px-3">
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </NavLink>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <NavLink to="/settings" className="flex items-center gap-2 px-3">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </NavLink>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={signOut}
          className="flex items-center gap-2 px-3 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}