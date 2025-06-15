/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

import Auth from "@/api/Auth";
import { useAuth } from "@/context/AuthContext";


export default function LoginForm() {
    const router = useRouter();
    const { login } = useAuth();
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState<false | true | 'indeterminate'>(false);
  
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async(e: any) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
    
        if (!username || !password) {
          toast.error("Tous les champs sont requis.");
          setIsLoading(false);
          return;
        }
    
        try {
          const res = await Auth.login({username, password})
    
          if (res.data.access_token) {
            toast.success(res.data.message);
            login(res.data.access_token, res.data.user);
            router.push('/dashboard');
          } else {
            toast.error(res.data.message || 'Une erreur est survenue.');
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }  catch (err: any) {
            if (err.response?.status === 401) {
              toast.error("Nom d'utilisateur ou mot de passe incorrect");
            } else if (err.response?.status === 422) {
              const errors = err.response.data.detail || [];
              errors.forEach((error: any) => {
                toast.error(error.msg || "Erreur de validation");
              });
            } else {
              toast.error(err.message || "Une erreur est survenue");
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="bg-primary-hover border-none shadow-md">
            <CardHeader className="text-background">
                <CardTitle>Connexion</CardTitle>
                <CardDescription>Connectez-vous à votre compte</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4">
                    <div className="py-2">
                        <Label htmlFor="email" className="py-2">Email</Label>
                        <Input 
                            id="email"
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="py-2 text-background">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="password" className="py-2">Mot de passe</Label>
                            <span className="py-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                                Forgot Password?
                            </span>
                        </div>
                        <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="remember" 
                            className="border-background"
                            checked={rememberMe}
                            onCheckedChange={setRememberMe}
                        />
                        <Label 
                            htmlFor="remember" 
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Remember Me
                        </Label>
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Button 
                    type="submit" 
                    variant={'animated'}
                    onClick={handleSubmit}
                >Se connecter</Button>
            </CardFooter>
        </Card>
    )
}