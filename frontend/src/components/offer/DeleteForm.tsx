/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react"
import Offers from "@/api/Offer";
import { useOffers } from "@/context/OfferContext";

// Définition des types pour les props
interface DeleteOfferProps {
    offerId: number;
}

export default function DeleteOffer({offerId}: DeleteOfferProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { handleOfferDeleted } = useOffers()

    console.log("DeleteOffer component rendered with offerId:", offerId);
    
    const onSubmit = async () =>  {
        setIsLoading(true);
        try {
            const response = await Offers.deleteOffer(offerId);
            if (response.status == 200) {
                // Utiliser le contexte pour gérer la suppression
                handleOfferDeleted(offerId)
                setOpen(false)
            }
        } catch (err: any) {
            console.error("Erreur lors de la suppression de l'offre:", err);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={'animated'} 
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                >
                    Supprimer
                <Trash2 />
            </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Supprimer l&apos;offre</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Annuler</Button>
                    <Button variant="destructive" onClick={onSubmit} disabled={isLoading} className="flex-1 sm:flex-none">
                        {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Suppression...
                        </>
                        ) : (
                        <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                        </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}