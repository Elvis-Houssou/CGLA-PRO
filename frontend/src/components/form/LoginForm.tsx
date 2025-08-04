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
        <Card className="bg-gray-100/80 border border-gray-200 shadow-md">
            <CardHeader>
                <CardTitle className="text-center text-xl">Connectez-vous à votre compte</CardTitle>
                <CardDescription className="text-gray-400 text-center text-xs" >Entrez votre adresse email pour vous connecter</CardDescription>
            </CardHeader>
            <CardContent >
                <form className="space-y-4">
                    <div className="">
                        <Label htmlFor="email" className="py-2 text-gray-500">Email</Label>
                        <Input 
                            id="email"
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="border border-gray-400 text-gray-500"
                        />
                    </div>
                    <div className="">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="password" className="py-2 text-gray-500">Mot de passe</Label>
                            <span className="py-2 text-sm text-sky-400 hover:text-sky-700 cursor-pointer">
                                Mot de passe oublié ?
                            </span>
                        </div>
                        <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="border border-gray-400 text-gray-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="remember" 
                            className="border-gray-400 text-gray-500"
                            checked={rememberMe}
                            onCheckedChange={setRememberMe}
                        />
                        <Label 
                            htmlFor="remember" 
                            className="text-sm font-medium  text-gray-500leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Se souvenir de moi
                        </Label>
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Button 
                    type="submit" 
                    variant={'animated'}
                    onClick={handleSubmit}
                    className="w-full bg-sky-400 text-white hover:bg-sky-500"
                >Se connecter</Button>
            </CardFooter>
        </Card>
    )
}