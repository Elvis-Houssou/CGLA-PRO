"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/AuthContext";
import SidebarMenuNav from "@/components/SidebarMenu";
import Navbar from "@/components/Navbar";
import AuthenticatedLayout from "./AuthenticatedLayout";
import { OffersProvider } from "@/context/OfferContext";
import { Toaster } from "sonner";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <AuthProvider>
      {isDashboard ? (
        <OffersProvider>
          <Toaster 
            position="top-right"
            expand={false}
            richColors
            // closeButton
            toastOptions={{
              duration: 3000,
            }}
          />
          <SidebarProvider className="w-full p-4">
            <SidebarMenuNav />
            <main className="w-full flex flex-col h-screen">
              <Navbar />
              <AuthenticatedLayout>{children}</AuthenticatedLayout>
            </main>
          </SidebarProvider>
        </OffersProvider>
      ) : (
        children
      )}
    </AuthProvider>
  );
}