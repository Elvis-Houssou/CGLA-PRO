"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/AuthContext";
import SidebarMenuNav from "@/components/SidebarMenu";
import Navbar from "@/components/Navbar";
import AuthenticatedLayout from "./AuthenticatedLayout";
import { OffersProvider } from "@/context/OfferContext";
import { ToastContainer } from "react-toastify";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <AuthProvider>
      {isDashboard ? (
        <OffersProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            className="mt-16"
          />
          <SidebarProvider className="w-full p-4">
            <SidebarMenuNav />
            <main className="w-full bg-blue-200 flex flex-col h-screen">
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