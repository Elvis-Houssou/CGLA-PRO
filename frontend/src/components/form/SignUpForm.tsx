/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Auth from "@/api/Auth";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const res = await Auth.register({
        username: formData.email,
        email: formData.email,
        password: formData.password,
      });

      if (res.data.access_token) {
        toast.success("Inscription réussie !");
        login(res.data.access_token, res.data.user);
        router.push("/dashboard");
      } else {
        toast.error(res.data.message || "Erreur lors de l'inscription");
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        toast.error("Un compte existe déjà avec cet email");
      } else if (err.response?.status === 422) {
        const errors = err.response.data.detail || [];
        errors.forEach((error: any) => {
          toast.error(error.msg || "Erreur de validation");
        });
      } else {
        toast.error(err.message || "Erreur lors de l'inscription");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-100/80 border border-gray-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-center text-xl">Inscription</CardTitle>
        <CardDescription className="text-gray-400 text-center text-xs">
          Créez un compte pour continuer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-500">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-400 text-gray-500"
              placeholder="votre@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-500">
              Mot de passe
            </Label>
            <Input
              type="password"
              id="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="border border-gray-400 text-gray-500"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-500">
              Confirmer le mot de passe
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="border border-gray-400 text-gray-500"
              placeholder="••••••••"
            />
          </div>
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-sky-400 text-white hover:bg-sky-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Inscription...
                </span>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-gray-400 text-center">
          En vous inscrivant, vous acceptez nos{" "}
          <span className="text-sky-400 cursor-pointer">
            conditions d'utilisation
          </span>
        </p>
      </CardFooter>
    </Card>
  );
}
