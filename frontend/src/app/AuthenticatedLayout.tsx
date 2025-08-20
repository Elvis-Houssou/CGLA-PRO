"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const publicRoutes = ["/", "/login", "/register", "/forgot-password"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = !isPublicRoute;

  useEffect(() => {
    if (isLoading) return;

    // Rediriger vers la page de login si non authentifié sur une route protégée
    if (!isAuthenticated && isProtectedRoute) {
      router.push("/" );
      return;
    }

    // Rediriger vers le dashboard si authentifié sur une route publique
    if (isAuthenticated && isPublicRoute) {
      router.push("/dashboard");
      return;
    }
  }, [isAuthenticated, isLoading, isProtectedRoute, isPublicRoute, pathname, router]);

  // Afficher un spinner pendant le chargement
  if (isLoading && isProtectedRoute) {
    return (
      <div className="flex h-screen items-center justify-center">
        
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Ne rien afficher si redirection en cours
  if ((!isAuthenticated && isProtectedRoute) || (isAuthenticated && isPublicRoute)) {
    return null;
  }

  return <>{children}</>;
}