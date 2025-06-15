/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
// import { useAuth } from "@/context/AuthContext";
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
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Trash2 } from "lucide-react";
import User from "@/api/User";

// Définition des types pour le formulaire
interface DeleteFormProps {
  userId: number;
  onUserDeleted?: (deletedUserId: number) => void;
}

export default function DeleteForm({ userId, onUserDeleted }: DeleteFormProps) {
    // const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const form = useForm();

    const onSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await User.delete(userId);
            if (response.status == 200) {
                setOpen(false);
                toast.success("Utilisateur créé !");
                console.log(response);
                
                // Appeler la fonction de callback avec le nouvel utilisateur
                if (onUserDeleted && response.data.message) {
                    onUserDeleted(userId);
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
            <Button variant={'animated'} className="w-full items-center justify-end rounded-lg text-sm hover:bg-red-300 hover:text-white">
                Supprimer
                <Trash2 />
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
