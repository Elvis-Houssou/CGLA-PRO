"use client"
import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@iconify/react"
import { 
    Plus, 
    X, 
    AlertCircle, 
    Loader2, 
    Package, 
    DollarSign, 
    FileText, 
    Gift, 
    Search, 
    Star, 
    Sparkles, 
    Info, 
    CheckCircle2, 
    ArrowRight,
    Crown,
} from "lucide-react"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"

import { useOffers } from "@/context/OfferContext"


import Offers from "@/api/Offer"
import { BenefitProps } from "@/props"

// Types
interface Benefit {
  id: number
  name: string
  description: string
  icon: string
}

interface OfferFormData {
  name: string
  price: number
  description: string
  icon: string
  benefits: Benefit[]
}

interface FormErrors {
  name?: string
  price?: string
  description?: string
  icon?: string
  benefits?: string
}

export default function CreateOffer() {
    const [open, setOpen] = useState(false)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const [benefits, setBenefits] = useState<Benefit[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    
    const { handleOfferCreated } = useOffers()

    const [formData, setFormData] = useState<OfferFormData>({
        name: "",
        price: 0,
        icon: "",
        description: "",
        benefits: [],
    })

    const [errors, setErrors] = useState<FormErrors>({})

    useEffect(() => {
        const fetchBenefits = async () => {
            setIsLoading(true)
            try {
                const response = await Offers.getAllBenefits()
                if (response.status === 200) {
                    setBenefits(response.data.benefits || [])
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des bénéfices:", error)
            } finally {
                setIsLoading(false)
            }
        }
        if (open) {
            fetchBenefits();
        }
    }, [open])

    // Calcul du progrès du formulaire
    const getFormProgress = () => {
        let progress = 0
        if (formData.name.trim()) progress += 25
        if (formData.price > 0) progress += 25
        if (formData.description.trim()) progress += 25
        if (formData.benefits.length > 0) progress += 25
        return progress
    }

    // Ajout d'un bénéfice existant à la sélection
    const handleBenefitSelect = (benefit: Benefit) => {
        if (formData.benefits.some((b) => b.id === benefit.id)) return

        setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, benefit],
        }))

        if (errors.benefits) {
        setErrors((prev) => ({ ...prev, benefits: undefined }))
        }
    }

    // Supprimer un bénéfice
    const removeBenefit = (id: number) => {
        setFormData((prev) => ({
        ...prev,
        benefits: prev.benefits?.filter((benefit) => benefit.id !== id),
        }))
    }

    // Validation du formulaire
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Le nom de l'offre est requis"
        } else if (formData.name.length < 3) {
            newErrors.name = "Le nom doit contenir au moins 3 caractères"
        }

        if (formData.price === 0 || isNaN(formData.price)) {
            newErrors.price = "Le prix est requis"
        } else if (formData.price <= 0) {
            newErrors.price = "Le prix doit être un nombre positif"
        }

        if (!formData.description?.trim()) {
            newErrors.description = "La description est requise"
        } else if (formData.description.length < 10) {
            newErrors.description = "La description doit contenir au moins 10 caractères"
        }

        if (formData.benefits?.length === 0) {
            newErrors.benefits = "Au moins un avantage est requis"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Gestion des changements de formulaire
    const handleInputChange = (field: keyof OfferFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: field === "price" ? Number(value) : value,
        }))

        // Effacer l'erreur du champ modifié
        if (field in errors) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }


    // Gestion ouverture/fermeture du dialog
    const handleOpenChange = (value: boolean) => {
        setOpen(value)
        if (!value) {
        // Reset du formulaire à la fermeture
        setFormData({ name: "", price: 0, icon: "material-symbols:star", description: "", benefits: [] })
        setErrors({})
        setSubmitSuccess(false)
        setSearchTerm("")
        }
    }

    const filteredBenefits = benefits.filter((benefit) =>
        benefit.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !formData.benefits.some((selected) => selected.id === benefit.id)
    )

    // Soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            // Création de l'offre
            const response = await Offers.createOffer(formData)
            if (response.status === 201) {
                // Création des bénéfices associés
                console.log("Offre créée avec succès:", response.data.id)
                const benefitIds = formData.benefits.map(b => b.id)
                await Offers.linkBenefitToOffer(response.data.id, benefitIds)

                // Créer l'objet offre complet pour le contexte
                const newOffer = {
                ...response.data,
                benefits: formData.benefits,
                }

                // Utiliser le contexte pour ajouter l'offre
                handleOfferCreated(newOffer)
                setSubmitSuccess(true)

                setTimeout(() => {
                    handleOpenChange(false)
                }, 2000);
            }
        } catch (error) {
            console.error("Erreur lors de la création:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const iconOptions = [
        { value: "material-symbols:star", label: "Etoile", icon: "⭐" },
        { value: "material-symbols:diamond", label: "Diamant", icon: "💎" },
        { value: "material-symbols:rocket-launch", label: "Fusée", icon: "🚀" },
        { value: "material-symbols:crown", label: "Couronne", icon: "👑" },
        { value: "material-symbols:flash-on", label: "Éclair", icon: "⚡" },
        { value: "material-symbols:workspace-premium", label: "Premium", icon: "🏆" },

    ]

    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Nouvelle Offre
                </Button>
                </DialogTrigger>

                <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                        <DialogTitle className="text-2xl font-bold text-slate-900">Créer une nouvelle offre</DialogTitle>
                        <DialogDescription className="text-slate-600 mt-1">
                            Créez une offre attractive pour vos clients en quelques étapes simples
                        </DialogDescription>
                        </div>
                    </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-500 mb-1">Progression</div>
                            <div className="flex items-center gap-2">
                                <Progress value={getFormProgress()} className="w-20" />
                                <span className="text-sm font-medium text-slate-700">{getFormProgress()}%</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Étape 1: Informations de base */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                                1
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Informations de base</h3>
                                <p className="text-sm text-slate-600">Définissez les caractéristiques principales de votre offre</p>
                            </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Nom de l'offre */}
                            <div className="lg:col-span-2 space-y-2">
                                <Label htmlFor="offer-name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Nom de l&apos;offre *
                                </Label>
                                <Input
                                id="offer-name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Ex: Offre Premium Entreprise"
                                className={`h-12 text-lg transition-all duration-200 ${
                                    errors.name
                                    ? "border-red-500 focus:border-red-500 bg-red-50"
                                    : "border-slate-300 focus:border-blue-500 focus:bg-blue-50/30"
                                }`}
                                />
                                {errors.name && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-600 flex items-center gap-1"
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.name}
                                </motion.p>
                                )}
                            </div>

                            {/* Icône */}
                            <div className="space-y-2">
                                <Label htmlFor="offer-icon" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Icône
                                </Label>
                                <select
                                id="offer-icon"
                                value={formData.icon}
                                onChange={(e) => handleInputChange("icon", e.target.value)}
                                className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                {iconOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                    {option.icon} {option.label}
                                    </option>
                                ))}
                                </select>
                            </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Prix */}
                            <div className="space-y-2">
                                <Label htmlFor="offer-price" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Prix (XOF) *
                                </Label>
                                <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    id="offer-price"
                                    type="number"
                                    value={formData.price || ""}
                                    onChange={(e) => handleInputChange("price", e.target.value)}
                                    placeholder="25000"
                                    className={`h-12 pl-12 text-lg font-semibold transition-all duration-200 ${
                                    errors.price
                                        ? "border-red-500 focus:border-red-500 bg-red-50"
                                        : "border-slate-300 focus:border-blue-500 focus:bg-blue-50/30"
                                    }`}
                                />
                                </div>
                                {errors.price && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-600 flex items-center gap-1"
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.price}
                                </motion.p>
                                )}
                            </div>

                            {/* Aperçu du prix */}
                            <div className="lg:col-span-2 flex items-end">
                                <Card className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                                <CardContent className="p-0">
                                    <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-700 font-medium">Prix de votre offre</p>
                                        <p className="text-2xl font-bold text-green-800">
                                        {formData.price ? `${formData.price.toLocaleString()} XOF` : "0 XOF"}
                                        </p>
                                    </div>
                                    <div className="text-green-600">
                                        <Icon icon={formData.icon} className="h-8 w-8" />
                                    </div>
                                    </div>
                                </CardContent>
                                </Card>
                            </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                            <Label
                                htmlFor="offer-description"
                                className="text-sm font-medium text-slate-700 flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Description détaillée *
                            </Label>
                            <Textarea
                                id="offer-description"
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Décrivez votre offre de manière attractive et détaillée. Mettez en avant les bénéfices pour vos clients..."
                                rows={4}
                                className={`transition-all duration-200 resize-none ${
                                errors.description
                                    ? "border-red-500 focus:border-red-500 bg-red-50"
                                    : "border-slate-300 focus:border-blue-500 focus:bg-blue-50/30"
                                }`}
                            />
                            <div className="flex justify-between items-center">
                                {errors.description ? (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-600 flex items-center gap-1"
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.description}
                                </motion.p>
                                ) : (
                                <p className="text-sm text-slate-500">{formData.description.length}/500 caractères</p>
                                )}
                            </div>
                            </div>
                        </motion.div>

                        <Separator className="my-8" />

                        {/* Étape 2: Avantages */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full font-semibold text-sm">
                                2
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900">Avantages inclus</h3>
                                <p className="text-sm text-slate-600">
                                Sélectionnez les avantages qui rendront votre offre irrésistible
                                </p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {formData.benefits.length} sélectionné{formData.benefits.length !== 1 ? "s" : ""}
                            </Badge>
                            </div>

                            {/* Barre de recherche */}
                            <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Rechercher un avantage..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white"
                            />
                            </div>

                            {/* Avantages sélectionnés */}
                            {formData.benefits.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Avantages sélectionnés
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <AnimatePresence>
                                    {formData.benefits.map((benefit) => (
                                    <motion.div
                                        key={benefit.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="group relative"
                                    >
                                        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-all duration-200">
                                        <CardContent className="p-0">
                                            <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Icon icon={benefit.icon} className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-medium text-slate-900 mb-1">{benefit.name}</h5>
                                                <p className="text-sm text-slate-600 line-clamp-2">{benefit.description}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeBenefit(benefit.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            </div>
                                        </CardContent>
                                        </Card>
                                    </motion.div>
                                    ))}
                                </AnimatePresence>
                                </div>
                            </div>
                            )}

                            {/* Avantages disponibles */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                                    <Gift className="h-4 w-4 text-blue-600" />
                                    Avantages disponibles
                                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                                </h4>

                                {isLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                                    ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                                    <AnimatePresence>
                                        {filteredBenefits.map((benefit) => (
                                        <motion.div
                                            key={benefit.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            whileHover={{ scale: 1.02 }}
                                            className="group cursor-pointer"
                                            onClick={() => handleBenefitSelect(benefit)}
                                        >
                                            <Card className="p-4 hover:shadow-md transition-all duration-200 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30">
                                            <CardContent className="p-0">
                                                <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                                                    <Icon
                                                    icon={benefit.icon}
                                                    className="h-5 w-5 text-slate-600 group-hover:text-blue-600"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-medium text-slate-900 mb-1 group-hover:text-blue-900">
                                                    {benefit.name}
                                                    </h5>
                                                    <p className="text-sm text-slate-600 line-clamp-2">{benefit.description}</p>
                                                </div>
                                                <Plus className="h-4 w-4 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                                                </div>
                                            </CardContent>
                                            </Card>
                                        </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            {errors.benefits && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.benefits}</AlertDescription>
                            </Alert>
                            )}
                        </motion.div>
                    </form>
                </div>

                <DialogFooter className="pt-6 border-t bg-slate-50/50">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            {submitSuccess && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-medium">Offre créée avec succès !</span>
                            </motion.div>
                            )}

                            <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                <Info className="h-4 w-4" />
                                <span>Progression: {getFormProgress()}%</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Complétez tous les champs pour activer la création</p>
                            </TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isSubmitting}
                                className="min-w-[100px]"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isSubmitting || getFormProgress() < 100}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white min-w-[140px] transition-all duration-200"
                            >
                                {isSubmitting ? (
                                    <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Création...
                                    </>
                                ) : (
                                    <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Créer l&apos;offre
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    )
}