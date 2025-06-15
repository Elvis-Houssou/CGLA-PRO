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
  DialogClose,
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
import { Plus, Trash2 } from "lucide-react";
import { RoleEnum, GarageProps } from "@/props";
import User from "@/api/User";

// Définition des types pour le formulaire
interface FormValues {
    userId: number;
    name: string;
    image?: string;
    city?: string;
    country?: string;
    address?: string;
}

interface DeleteFormProps {
  garageId: number;
  onUserDeleted?: (deletedUserId: number) => void;
}

export function CreateGarageForm({ onGarageCreated }: { onGarageCreated?: (newUser: any) => void }) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const form = useForm<FormValues>({
        defaultValues: {
            userId: undefined,
            name: "",
            image: "",
            city: "",
            country: "",
            address: ""
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
                if (onGarageCreated && response.data.garage) {
                    onGarageCreated(response.data.garage)
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
            <Button>
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
                name="name"
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
                        <Input placeholder="Nom d'utilisateur" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="userId"
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
                            <Input type="email" placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                            <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                {user?.role === "super_admin" && (
                    <FormField
                        control={form.control}
                        name="userId"
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
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Rôles</SelectLabel>
                                {Object.values(RoleEnum).map((role) => (
                                    <SelectItem key={role} value={role}>
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

export function EditGarageForm({
  getGarage,
  onUserUpdated,
}: { 
    getGarage: GarageProps;
    onUserUpdated?: (u: GarageProps) => void;
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
        if (open && getGarage) {
            form.reset({
                username: getGarage.name,
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
                <Button variant={'ghost'} className="w-full justify-end rounded-lg text-sm hover:bg-blue-300 hover:text-white">
                    <Icon icon="mynaui:edit-one-solid" />
                    Modifier
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
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
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
                                <Input {...field} />
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
                                <Input {...field} />
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
                                <Input type="email" {...field} />
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
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

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
                                <SelectContent className="border border-primary-hover">
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
                        <Button variant={"outline"} type="submit" disabled={isLoading}>
                            {isLoading ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}


export function DeleteGarageForm({ garageId, onUserDeleted }: DeleteFormProps) {
    // const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const form = useForm();

    const onSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await User.delete(garageId);
            if (response.status == 200) {
                setOpen(false);
                toast.success("Utilisateur créé !");
                console.log(response);
                
                // Appeler la fonction de callback avec le nouvel utilisateur
                if (onUserDeleted && response.data.message) {
                    onUserDeleted(garageId);
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
            <Button variant={'ghost'} className="w-full justify-end rounded-lg text-sm hover:bg-red-300 hover:text-white">
                <Trash2 />
                Supprimer
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Supprimer un utilisateur</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûre de vouloir supprimer cette utilisateur ? <br />
                        Vous ne pourrez plus revenir en arrière.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter> 
                    <Button variant={"destructive"} type="submit" disabled={isLoading}>
                        {isLoading ? "Suppression..." : "Supprimer"}
                    </Button>
                    <DialogClose asChild>
                        <Button variant="outline">
                            Annuler
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
        </Dialog>
    );
}
