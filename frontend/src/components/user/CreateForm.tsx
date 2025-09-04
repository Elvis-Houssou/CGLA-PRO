/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
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
import { Plus, ChevronLeft, CheckCircle2, Loader2, X, Search } from "lucide-react";
import { RoleEnum } from "@/props";
import User from "@/api/User";
import Offers from "@/api/Offer";
import { useOffers } from "@/context/OfferContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Définition des types pour le formulaire
interface FormValues {
  username: string;
  email: string;
  password: string;
  role?: RoleEnum;
}

export default function CreateForm({ onUserCreated }: { onUserCreated?: (newUser: any) => void}) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Formulaire, 2: Sélection des offres
  const [selectedOffers, setSelectedOffers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { offers, loading, error, fetchOffers } = useOffers();

  const form = useForm<FormValues>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: undefined,
    },
    mode: "onBlur",
  });

  // Filtrer les offres basé sur la recherche
  const filteredOffers = offers.filter(offer => 
    offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (offer.description && offer.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (open && step === 2 && offers.length === 0) {
      fetchOffers();
    }
  }, [open, step, offers.length, fetchOffers]);

  const handleNextStep = async () => {
    // Valider le formulaire avant de passer à l'étape suivante
    const isValid = await form.trigger();
    if (isValid) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Récupérer les données du formulaire
      const formData = form.getValues();
      
      // Créer l'utilisateur
      const response = await User.register(formData);
      if (response.status === 201) {
        const newUser = response.data.user;
        
        // Associer les offres sélectionnées à l'utilisateur
        if (selectedOffers.length > 0) {
          const assignPromises = selectedOffers.map(offerId => 
            Offers.assignOfferToUser(newUser.id, offerId)
          );
          
          await Promise.all(assignPromises);
          toast.success("Utilisateur créé et offres assignées avec succès !");
        } else {
          toast.success("Utilisateur créé avec succès !");
        }
        
        // Réinitialiser le formulaire
        form.reset();
        setOpen(false);
        setStep(1);
        setSelectedOffers([]);
        setSearchTerm("");
        
        // Appeler la fonction de callback avec le nouvel utilisateur
        if (onUserCreated) {
          onUserCreated(newUser);
        }
      } else {
        toast.error("Erreur lors de la création de l'utilisateur");
        console.error("Erreur API:", response.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue");
      console.error("Erreur:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Réinitialiser le formulaire quand on ferme le dialogue
      setStep(1);
      setSelectedOffers([]);
      setSearchTerm("");
      form.reset();
    }
    setOpen(isOpen);
  };

  const toggleOffer = (offerId: number) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId) 
        : [...prev, offerId]
    );
  };

  // Étape 1: Formulaire utilisateur
  const renderUserForm = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
          1
        </div>
        <div>
          <h3 className="text-lg font-semibold">Informations utilisateur</h3>
          <p className="text-sm text-muted-foreground">Créez le compte utilisateur</p>
        </div>
      </div>

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
              <Input placeholder="Nom d'utilisateur" className="text-foreground border border-foreground"  {...field} />
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
              <Input type="email" className="text-foreground border border-foreground"  placeholder="Email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        rules={{
          required: "Mot de passe obligatoire",
          minLength: {
            value: 6,
            message: "Le mot de passe doit contenir au moins 6 caractères"
          }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mot de passe</FormLabel>
            <FormControl>
              <Input type="password"  className="text-foreground border border-foreground"  {...field} />
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
            <FormItem>
              <FormLabel>Rôle</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
    </motion.div>
  );

  // Étape 2: Sélection des offres
  const renderOfferSelection = () => {
    const formData = form.getValues();
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full font-semibold text-sm">
            2
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Assigner des offres</h3>
            <p className="text-sm text-muted-foreground">
              Sélectionnez les offres à assigner à {formData.username}
            </p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {selectedOffers.length} sélectionné{selectedOffers.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une offre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Offres sélectionnées */}
        {selectedOffers.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Offres sélectionnées
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <AnimatePresence>
                {offers
                  .filter(offer => selectedOffers.includes(offer.id))
                  .map((offer) => (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative"
                    >
                      <Card className="p-3 bg-muted/50">
                        <CardContent className="p-0 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium truncate">{offer.name}</h5>
                            {offer.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {offer.description}
                              </p>
                            )}
                            {offer.price > 0 && (
                              <p className="text-sm font-medium text-green-600 mt-1">
                                {offer.price.toLocaleString()} XOF
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOffer(offer.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
            <Separator />
          </div>
        )}

        {/* Liste des offres disponibles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Offres disponibles</h4>
            <span className="text-sm text-muted-foreground">
              {filteredOffers.length} offre{filteredOffers.length !== 1 ? 's' : ''} disponible{filteredOffers.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Erreur lors du chargement des offres
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground">Aucune offre trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
              <AnimatePresence>
                {filteredOffers.map((offer) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`offer-${offer.id}`}
                      checked={selectedOffers.includes(offer.id)}
                      onCheckedChange={() => toggleOffer(offer.id)}
                    />
                    <Label htmlFor={`offer-${offer.id}`} className="flex-1 cursor-pointer">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{offer.name}</p>
                          {offer.price > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {offer.price.toLocaleString()} XOF
                            </Badge>
                          )}
                        </div>
                        {offer.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {offer.description}
                          </p>
                        )}
                        {offer.benefits && offer.benefits.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {offer.benefits.slice(0, 3).map(benefit => (
                              <Badge key={benefit.id} variant="outline" className="text-xs">
                                {benefit.name}
                              </Badge>
                            ))}
                            {offer.benefits.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{offer.benefits.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </Label>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={"default"} className="w-full mb-4">
          <Plus className="mr-2" />
          Ajouter un utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Créer un utilisateur" : "Assigner des offres"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Remplissez les informations nécessaires pour ajouter un utilisateur." 
              : `Sélectionnez les offres à assigner`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 1 ? renderUserForm() : renderOfferSelection()}
            </AnimatePresence>

            <DialogFooter className="gap-2 sm:gap-0">
              {step === 2 && (
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Retour
                </Button>
              )}
              
              {step === 1 ? (
                <Button 
                variant={"default"}
                  type="button"
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Suivant
                </Button>
              ) : (
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    `Créer l'utilisateur${selectedOffers.length > 0 ? ` avec ${selectedOffers.length} offre(s)` : ''}`
                  )}
                </Button>
              )}
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}