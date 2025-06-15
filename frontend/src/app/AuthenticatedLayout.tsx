"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (!isLoading && !isAuthenticated && isDashboard) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router, isDashboard]);

  if (isLoading && isDashboard) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  if (!isAuthenticated && isDashboard) {
    return null; // Redirection en cours
  }

  return <div>{children}</div>;
}