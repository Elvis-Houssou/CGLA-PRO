"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Icônes dynamiques
const Home = dynamic(() => import('lucide-react').then(mod => mod.Home), { ssr: false });
const Calendar = dynamic(() => import('lucide-react').then(mod => mod.Calendar), { ssr: false });
const Users = dynamic(() => import('lucide-react').then(mod => mod.Users), { ssr: false });
const UserCog = dynamic(() => import('lucide-react').then(mod => mod.UserCog), { ssr: false });
const LogOut = dynamic(() => import('lucide-react').then(mod => mod.LogOut), { ssr: false });
const CreditCard = dynamic(() => import('lucide-react').then(mod => mod.CreditCard), { ssr: false });
const Car = dynamic(() => import('lucide-react').then(mod => mod.Car), { ssr: false });
const User = dynamic(() => import('lucide-react').then(mod => mod.User), { ssr: false });
const Settings = dynamic(() => import('lucide-react').then(mod => mod.Settings), { ssr: false });

export default function SidebarMenuNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [];
  
  if (user?.role === "super_admin") {
    menuItems.push(
      { name: "Tableau de bord", href: "/dashboard", icon: Home },
      { name: "Utilisateurs", href: "/dashboard/admin/users", icon: Users },
      { name: "Managers", href: "/dashboard/admin/managers", icon: UserCog },
      { name: "Offres", href: "/dashboard/admin/offers", icon: CreditCard },
      { name: "Paramètres", href: "/dashboard/settings", icon: Settings }
    );
  }

  if (user?.role === "manager") {
    menuItems.push(
      { name: "Tableau de bord", href: "/dashboard", icon: Home },
      { name: "Utilisateurs", href: "/dashboard/manager/users", icon: Users },
      { name: "Paramètres", href: "/dashboard/settings", icon: Settings }
    );
  }

  if (user?.role === "admin_garage") {
    menuItems.push(
      { name: "Tableau de bord", href: "/dashboard", icon: Home },
      { name: "Lavages", href: "/dashboard/admin/garages", icon: Car },
      { name: "Réservations", href: "/dashboard/reservations", icon: Calendar },
      { name: "Paramètres", href: "/dashboard/settings", icon: Settings }
    );
  }

  if (user && ["employee_garage", "client_garage"].includes(user.role)) {
    menuItems.push(
      { name: "Tableau de bord", href: "/dashboard", icon: Home },
      { name: "Réservations", href: "/dashboard/user/reservations", icon: Calendar },
      { name: "Mon profil", href: "/dashboard/user/profile", icon: User }
    );
  }

  return (
    <div className="h-full">
      <Sidebar variant="floating" className="h-full border-r-0">
        <SidebarContent className="bg-white h-full flex flex-col rounded-r-xl border border-gray-200 shadow-sm">
          {/* En-tête avec logo */}
          <div className="p-4 border-b border-gray-200 rounded-t-xl bg-white flex flex-col items-center">
            <div className="mb-12">
              <Image 
                src="/images/logo.png" 
                alt="Logo de l'application" 
                width={190} 
                height={80} 
                className="h-16 w-auto"
              />
            </div>
            
            <div className="w-full text-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {user?.role === "super_admin" && "Espace Administration"}
                {user?.role === "manager" && "Espace Manager"}
                {user?.role === "admin_garage" && "Mon Garage"}
                {/* type error got to be study  */}
                {["employee_garage", "client_garage"].includes(user?.role) && "Mon Espace"}
              </h2>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 overflow-y-auto py-3 px-2">
            <SidebarGroup>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link 
                        href={item.href} 
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium transition-colors rounded-lg",
                          pathname === item.href 
                            ? "bg-blue-50 text-blue-600" 
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </div>

          {/* Pied de page */}
          <div className="p-2 border-t border-gray-200 rounded-b-xl bg-white">
            <Button 
              onClick={logout} 
              variant="ghost" 
              className="w-full flex items-center justify-center gap-3 text-gray-600 hover:bg-red-100 hover:text-red-500 rounded-lg px-4 py-2.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Déconnexion</span>
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}