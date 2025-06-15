/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react"
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
import { RoleEnum } from "@/props";
import User from "@/api/User";
import { UserProps } from "@/props/index";

// Définition des types pour le formulaire
interface FormValues {
    username: string;
    email: string;
    firstname?: string;
    lastname?: string;
    password: string;
    role?: RoleEnum;
}


export default function EditForm({
  getUser,
  onUserUpdated,
}: { 
    getUser: UserProps;
    onUserUpdated?: (u: UserProps) => void;
}) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const form = useForm<FormValues>({
        defaultValues: {
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        role: undefined,
        },
        mode: "onBlur",
    });

    useEffect(() => {
        if (open && getUser) {
            form.reset({
                username: getUser.username,
                firstname: getUser.firstname ?? "",
                lastname: getUser.lastname ?? "",
                email: getUser.email,
                password: "",
                role: getUser.role as RoleEnum,
            });
        }
    }, [open, getUser, form]);

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            const response = await User.update(getUser.id, data);
            if (response.status == 201) {
                form.reset();
                setOpen(false);
                toast.success("Utilisateur mis à jour !");
                console.log(response);
                
                // Appeler la fonction de callback avec le nouvel utilisateur
                if (onUserUpdated && response.data.user) {
                    onUserUpdated(response.data.user)
                }
            } else {
                toast.error("Erreur lors de la mise à jour");
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
                <Button variant={'animated'} className="w-full items-center justify-end rounded-lg text-sm hover:bg-blue-300 hover:text-white">
                    Modifier
                    <Icon icon="mynaui:edit-one-solid" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[782px] border border-primary-hover overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Modifier {getUser.username}</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations nécessaires pour modifier un utilisateur.
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
                                message: "Username invalide (3-20 caractères alphanumériques)",
                            },
                        }}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nom d&apos;utilisateur</FormLabel>
                            <FormControl>
                                <Input className="border border-foreground" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstname"
                            rules={{
                                required: "Nom obligatoire",
                                pattern: {
                                    value: /^[a-zA-Z0-9_-]{3,20}$/,
                                    message: "Nom d'utilisateur invalide (3-20 caractères alphanumériques)",
                                },
                            }}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl>
                                    <Input className="border border-foreground" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastname"
                            rules={{
                                required: "Prenom obligatoire",
                                pattern: {
                                    value: /^[a-zA-Z0-9_-]{3,20}$/,
                                    message: "Prénom de l'utilisateur invalide (3-20 caractères alphanumériques)",
                                },
                            }}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Prénom</FormLabel>
                                <FormControl>
                                    <Input className="border border-foreground" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                                    <Input className="border border-foreground" type="email" {...field} />
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
                                    <Input className="border border-foreground" type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    {user?.role === 'super_admin' && (
                        <FormField
                            control={form.control}
                            name="role"
                            rules={{
                                required: "Rôle obligatoire",
                            }}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rôle</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner un rôle" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="border border-foreground">
                                    <SelectGroup>
                                    <SelectLabel>Rôles</SelectLabel>
                                    {Object.entries(RoleEnum).map(([key, role]) => (
                                        <SelectItem key={key} value={key}>
                                            {role}
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
                        <Button type="submit" variant={'outline'} disabled={isLoading}>
                            {isLoading ? "Mise à jour..." : "Mettre à jour"}
                        </Button>
                    </DialogFooter>
                </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
