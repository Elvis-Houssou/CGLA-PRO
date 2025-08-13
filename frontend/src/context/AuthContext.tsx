"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie, deleteCookie } from "cookies-next";
import Auth from "@/api/Auth";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hook";

type User = {
  id: number;
  username: string;
  firstname?: string;
  lastname?: string;
  email: string;
  role:
    | "super_admin"
    | "manager"
    | "admin_garage"
    | "employee_garage"
    | "client_garage";
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  Authlogin: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  // const me = useAppSelector((state) => state.user.me);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const checkAuthentication = async () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = JSON.parse(localStorage.getItem("user") || "null");
          if (userData?.id) {
            setUser(userData);
            setCookie("auth_token", token, { maxAge: 60 * 60 * 24 * 7 }); // 7 jours
          } else {
            await logout();
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des données utilisateur:",
            error
          );
          await logout();
        }
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const Authlogin = (token: string, userData: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setCookie("auth_token", token, { maxAge: 60 * 60 * 24 * 7 }); // 7 jours
      setUser(userData);
    }
  };

  const logout = async () => {
    console.log("logout");

    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          await Auth.logout(token);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        deleteCookie("auth_token");
      }
      setUser(null);
      // router.push('/');
    }
  };

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      return !!token && !!user;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        isAuthenticated: !!user,
        Authlogin,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
};
