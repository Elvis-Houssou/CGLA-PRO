/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { RoleEnum } from "@/props";
import User from "@/api/User";

// Définition des types pour le formulaire
interface FormValues {
  username: string;
  email: string;
  password: string;
  role?: RoleEnum;
}

export default function CreateForm({ onUserCreated,children }: { onUserCreated?: (newUser: any) => void, children?: React.ReactNode }) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const form = useForm<FormValues>({
        defaultValues: {
        username: "",
        email: "",
        password: "",
        role: undefined,
        },
        mode: "onBlur",
    });

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            const response = await User.register(data);
            if (response.status == 201) {
                form.reset();
                setOpen(false);
                toast.success("Utilisateur créé !");
                console.log(response);
                
                // Appeler la fonction de callback avec le nouvel utilisateur
                if (onUserCreated && response.data.user) {
                    onUserCreated(response.data.user)
                }
            } else {
                toast.error("Erreur lors de la création de l'utilisateur");
                console.error("Erreur API:", response.data);
            }
        } catch (err: any) {
            toast.error(err.message || "Une erreur est survenue")
            console.error("Erreur:", err)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant={"outline"} className="w-full mb-4">
                <Plus className="mr-2" />
                Ajouter un utilisateur
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Créer un utilisateur</DialogTitle>
            <DialogDescription>
                Remplissez les informations nécessaires pour ajouter un utilisateur.
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="username"
                rules={{
                    required: "Username obligatoire",
                    pattern: {
                        value: /^[a-zA-Z0-9_-]{3,20}$/,
                        message: "Nom d'utilisateur invalide (3-20 caractères alphanumériques)",
                    },
                }}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nom d&apos;utilisateur</FormLabel>
                    <FormControl>
                        <Input className="text-foreground border border-foreground" placeholder="Nom d'utilisateur" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    rules={{
                        required: "Email obligatoire",
                        pattern: {
                            value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                            message: "Email invalide",
                        },
                    }}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input className="text-foreground border border-foreground" type="email" placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                            <Input className="text-foreground border border-foreground" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                {user?.role === "super_admin" && (
                    <FormField
                        control={form.control}
                        name="role"
                        rules={{
                            required: "Rôle obligatoire",
                        }}
                        render={({ field }) => (
                            // console.log("role", field.value),
                        <FormItem>
                            <FormLabel>Rôle</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="border border-foreground">
                                    <SelectTrigger className="w-full border border-foreground">
                                    <SelectValue className="border border-foreground" placeholder="Sélectionner un rôle" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="border border-foreground">
                                    <SelectGroup>
                                    <SelectLabel>Rôles</SelectLabel>
                                    {Object.entries(RoleEnum).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}

                <DialogFooter> 
                    <Button variant={"outline"} type="submit" disabled={isLoading}>
                        {isLoading ? "Création..." : "Créer"}
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
        </Dialog>
    );
}
