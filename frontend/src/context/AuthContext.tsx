"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { setCookie, deleteCookie } from "cookies-next";
import Auth from "@/api/Auth";

type User = {
  id: number;
  username: string;
  firstname?: string;
  lastname?: string;
  email: string;
  role:
    | "super_admin"
    | "system_manager"
    | "station_owner"
    | "employee_garage"
    | "client_garage";
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  Authlogin: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuthentication = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }

      // Optionnel: Vérifier la validité du token côté serveur
      // const isValid = await Auth.verifyToken(token);
      // if (!isValid) {
      //   await logout();
      //   return;
      // }

      const userData = JSON.parse(localStorage.getItem("user") || "null");
      if (userData?.id) {
        setUser(userData);
        setCookie("auth_token", token, { 
          maxAge: 60 * 60 * 24 * 7, // 7 jours
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production"
        });
      } else {
        await logout();
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const Authlogin = useCallback((token: string, userData: User) => {
    if (typeof window === "undefined") return;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setCookie("auth_token", token, { 
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          await Auth.logout(token).catch(console.error);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        deleteCookie("auth_token");
      }
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [router]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        Authlogin,
        logout,
        refreshAuth: checkAuthentication,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};