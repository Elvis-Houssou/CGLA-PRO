/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
// import { toast, ToastContainer } from "react-toastify";
import { Toaster, toast } from "sonner";
// import{sonner}
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import Auth from "@/api/Auth";
import { useAuth } from "@/context/AuthContext";
import { Credentials } from "@/props";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // console.log(credentials);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    if (!credentials.username || !credentials.password) {
      toast.error("Tous les champs sont requis.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await Auth.login(credentials);

      if (res.data.access_token) {
        toast.success(res.data.message);
        login(res.data.access_token, res.data.user);
        router.push("/dashboard");
      } else {
        toast.error(res.data.message || "Une erreur est survenue.");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Nom d'utilisateur ou mot de passe incorrect");
      } else if (err.response?.status === 422) {
        (err.response.data.detail || []).forEach((error: any) =>
          toast.error(error.msg || "Erreur de validation")
        );
      } else {
        toast.error(err.message || "Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <>
     <Toaster position="top-right"/>
    
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Content de vous revoir</h2>
        <p className="text-gray-500 text-sm">
          Entrez vos identifiants pour accéder à votre compte
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-gray-700">
            Email
          </Label>
          <Input
            id="username"
            type="email"
            placeholder="exemple@email.com"
            value={credentials.username}
            onChange={handleInputChange}
            className="border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 transition h-10"
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-gray-700">
              Mot de passe
            </Label>
            <button
              type="button"
              className="text-xs text-sky-400 hover:text-sky-400/80"
            >
              Mot de passe oublié ?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={credentials.password}
            onChange={handleInputChange}
            className="border-gray-300 focus:border-primary focus:ring-1 focus:ring-sky-300/20 transition h-10"
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(val) => setRememberMe(!!val)}
              className="border-gray-300 data-[state=checked]:bg-sky-400"
            />
            <Label htmlFor="remember" className="text-sm text-gray-600">
              Se souvenir de moi
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-sky-400 hover:bg-sky-400/90 text-white font-medium py-2.5 rounded-lg transition"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            "Se connecter"
          )}
        </Button>
      </form>
    </div>
    </>
  );
}