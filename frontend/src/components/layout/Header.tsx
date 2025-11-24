"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, LogOut, UserCircle, Mail, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLogout } from "@/hooks/queries/useAuth";
import { useInvitations } from "@/hooks/queries/useInvitations";
import { useUserInfo } from "@/hooks/useUserInfo";
import type { Invitation } from "@/types/invitation";

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const logoutMutation = useLogout();
  const { userInitials, userName, userEmail, userAvatar } = useUserInfo();
  const { data: invitationsData = [] } = useInvitations();

  const pendingInvitations = (invitationsData as Invitation[]).filter(
    (inv) => inv.status === 'PENDING'
  );
  const invitationCount = pendingInvitations.length;

  const navLinks = [
    { href: "/dashboard", label: "Inicio", icon: Home },
    { href: "/explore", label: "Explorar", icon: Compass },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 transition-all duration-300 hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
            <span className="text-xl font-bold text-primary-foreground">C</span>
          </div>
          <span className="hidden text-xl font-bold text-foreground sm:inline-block">
            Colectaya
          </span>
        </Link>

        <nav className="hidden items-center space-x-1 md:flex">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-2">
          

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden md:flex">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Menú de usuario"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Ver perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/invitations" className="cursor-pointer">
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="flex-1">Invitaciones</span>
                  {invitationCount > 0 && (
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      {invitationCount}
                    </Badge>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ✅ Menú móvil - SIN badge de notificaciones */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Abrir menú">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0">
              <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle className="text-left">Menú</SheetTitle>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="flex flex-col p-4 space-y-6">
                  
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-purple-600/10 border border-primary/20">
                    <Avatar className="h-14 w-14 border-2 border-background">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground text-xl font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Navegación
                    </p>
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={handleNavLinkClick}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            isActive(link.href)
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "hover:bg-muted"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>

                  {/* ✅ REMOVIDA toda la sección de notificaciones del menú móvil */}

                  <div className="space-y-1 pt-2 border-t">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Cuenta
                    </p>
                    <Link
                      to="/profile"
                      onClick={handleNavLinkClick}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <UserCircle className="h-5 w-5" />
                      Ver perfil
                    </Link>
                    <Link
                      to="/invitations"
                      onClick={handleNavLinkClick}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        Invitaciones
                      </div>
                      {invitationCount > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {invitationCount}
                        </Badge>
                      )}
                    </Link>
                  </div>

                  <div className="pt-2 border-t">
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      disabled={logoutMutation.isPending}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="h-5 w-5" />
                      {logoutMutation.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
                    </button>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}