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
import { Home, Calendar, Inbox, CarFront, LogOut, CreditCard } from "lucide-react";

export default function SidebarMenuNav() {
  const { user, logout } = useAuth();

  const menuItems = [];
  if (user && user.role === "super_admin" ) {
    menuItems.push(
      { name: "Home", href: "/dashboard", icon: Home },
      { name: "Gestion des utilisateurs", href: "/dashboard/admin/users", icon: CarFront },
      { name: "Gestion des offres", href: "/dashboard/admin/offers", icon: CreditCard }
    );
  }

  if (user && user.role === "manager") {
    menuItems.push(
      { name: "Home", href: "/dashboard", icon: Home },
      { name: "Gestion des utilisateurs", href: "/dashboard/admin/users", icon: CarFront },
    );
  }
  if (user && user.role === "admin_garage") {
    menuItems.push(
      { name: "Mes lavages", href: "/dashboard/admin/garages", icon: Inbox },
      { name: "Abonnements", href: "/dashboard/admin/subscriptions", icon: Inbox }
    );
  }
  if (user && ["employee_garage", "client_garage"].includes(user.role)) {
    menuItems.push(
      { name: "Mes réservations", href: "/dashboard/user/reservations", icon: Calendar },
      { name: "Mon profil", href: "/dashboard/user/profile", icon: Calendar }
    );
  }

  return (
    <Sidebar variant="floating">
      <SidebarContent className="bg-white rounded-lg shadow-md w-64">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild>
                  <Link href={item.href} className="flex items-center gap-2">
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Button variant="ghost" onClick={logout} className="w-full flex items-center gap-2">
                  <LogOut size={20} />
                  <span>Déconnexion</span>
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    
  );
}