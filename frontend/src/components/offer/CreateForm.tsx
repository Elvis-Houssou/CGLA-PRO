"use client"
import React, { useEffect, useState, useCallback, useMemo } from "react"
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
    ChevronLeft,
    ChevronRight
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { useOffers } from "@/context/OfferContext"
import Offers from "@/api/Offer"

// Types
interface Benefit {
  id: number
  name: string
  description: string
  icon: string
  category?: string
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

// Constants
const ICON_OPTIONS = [
  { value: "material-symbols:star", label: "Étoile", icon: "⭐", color: "text-yellow-500" },
  { value: "material-symbols:diamond", label: "Diamant", icon: "💎", color: "text-blue-400" },
  { value: "material-symbols:rocket-launch", label: "Fusée", icon: "🚀", color: "text-purple-500" },
  { value: "material-symbols:crown", label: "Couronne", icon: "👑", color: "text-amber-500" },
  { value: "material-symbols:flash-on", label: "Éclair", icon: "⚡", color: "text-yellow-600" },
  { value: "material-symbols:workspace-premium", label: "Premium", icon: "🏆", color: "text-green-500" },
] as const

const BENEFIT_CATEGORIES = ["Tous", "Marketing", "Support", "Technique", "Commercial"]

// Form Steps Components
const FormStep1: React.FC<{
  formData: OfferFormData;
  errors: FormErrors;
  onInputChange: (field: keyof OfferFormData, value: string) => void;
}> = ({ formData, errors, onInputChange }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }} 
    animate={{ opacity: 1, x: 0 }} 
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
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
          onChange={(e) => onInputChange("name", e.target.value)}
          placeholder="Ex: Offre Premium Entreprise"
          className={`h-12 text-lg transition-all duration-200 ${
            errors.name
              ? "border-red-500 focus:border-red-500 bg-red-50"
              : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
        <div className="grid grid-cols-3 gap-2">
          {ICON_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                formData.icon === option.value
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-slate-300 hover:border-slate-400"
              }`}
              onClick={() => onInputChange("icon", option.value)}
            >
              <Icon icon={option.value} className={`h-6 w-6 ${option.color}`} />
              <span className="text-xs mt-1 text-slate-600">{option.label}</span>
            </div>
          ))}
        </div>
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
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-slate-500">XOF</span>
          </div>
          <Input
            id="offer-price"
            type="number"
            value={formData.price || ""}
            onChange={(e) => onInputChange("price", e.target.value)}
            placeholder="25000"
            className={`h-12 pl-14 text-lg font-semibold transition-all duration-200 ${
              errors.price
                ? "border-red-500 focus:border-red-500 bg-red-50"
                : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
        <Card className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Aperçu de votre offre</p>
                <p className="text-2xl font-bold text-blue-800">
                  {formData.price ? `${formData.price.toLocaleString()} XOF` : "0 XOF"}
                </p>
                <p className="text-sm text-blue-600 mt-1">{formData.name || "Nom de l'offre"}</p>
              </div>
              <div className="text-blue-600">
                <Icon icon={formData.icon} className="h-10 w-10" />
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
        onChange={(e) => onInputChange("description", e.target.value)}
        placeholder="Décrivez votre offre de manière attractive et détaillée. Mettez en avant les bénéfices pour vos clients..."
        rows={4}
        className={`transition-all duration-200 resize-none ${
          errors.description
            ? "border-red-500 focus:border-red-500 bg-red-50"
            : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
);

const FormStep2: React.FC<{
  formData: OfferFormData;
  errors: FormErrors;
  benefits: Benefit[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onBenefitSelect: (benefit: Benefit) => void;
  onRemoveBenefit: (id: number) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}> = ({ formData, errors, benefits, isLoading, searchTerm, setSearchTerm, onBenefitSelect, onRemoveBenefit, selectedCategory, setSelectedCategory }) => {
  const filteredBenefits = useMemo(() => {
    let filtered = benefits.filter((benefit) =>
      benefit.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !formData.benefits.some((selected) => selected.id === benefit.id)
    );
    
    if (selectedCategory !== "Tous") {
      filtered = filtered.filter(benefit => benefit.category === selectedCategory);
    }
    
    return filtered;
  }, [benefits, searchTerm, formData.benefits, selectedCategory]);

  const benefitCategories = useMemo(() => {
    const categories = new Set(benefits.map(b => b.category).filter(Boolean));
    return ["Tous", ...Array.from(categories)].filter(category => category);
  }, [benefits]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full font-semibold text-sm">
          2
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">Avantages inclus</h3>
          <p className="text-sm text-slate-600">
            Sélectionnez les avantages qui rendront votre offre irrésistible
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
          {formData.benefits.length} sélectionné{formData.benefits.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Rechercher un avantage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-white border-slate-300 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        
        <div className="w-full sm:w-auto">
          <Tabs 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 sm:flex h-12">
              {benefitCategories.slice(0, 3).map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="text-xs sm:text-sm"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
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
                          onClick={() => onRemoveBenefit(benefit.id)}
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
          <Separator className="my-4" />
        </div>
      )}

      {/* Avantages disponibles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-slate-900 flex items-center gap-2">
            <Gift className="h-4 w-4 text-blue-600" />
            Avantages disponibles
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600 ml-2" />}
          </h4>
          <span className="text-sm text-slate-500">
            {filteredBenefits.length} avantage{filteredBenefits.length !== 1 ? 's' : ''} disponible{filteredBenefits.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredBenefits.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">Aucun avantage trouvé</p>
            <p className="text-sm text-slate-400 mt-1">Essayez de modifier votre recherche ou filtre</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
            <AnimatePresence>
              {filteredBenefits.map((benefit) => (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.02 }}
                  className="group cursor-pointer"
                  onClick={() => onBenefitSelect(benefit)}
                >
                  <Card className="p-4 hover:shadow-md transition-all duration-200 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 h-full">
                    <CardContent className="p-0 flex flex-col h-full">
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
                          <p className="text-sm text-slate-600 line-clamp-3">{benefit.description}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <Badge variant="outline" className="text-xs">
                          {benefit.category || "Général"}
                        </Badge>
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
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.benefits}</AlertDescription>
        </Alert>
      )}
    </motion.div>
  );
};

export default function CreateOffer() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [currentStep, setCurrentStep] = useState(1)
  
  const { handleOfferCreated } = useOffers()

  const [formData, setFormData] = useState<OfferFormData>({
    name: "",
    price: 0,
    icon: "material-symbols:star",
    description: "",
    benefits: [],
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Calcul du progrès du formulaire
  const formProgress = useMemo(() => {
    let progress = 0
    if (formData.name.trim()) progress += 25
    if (formData.price > 0) progress += 25
    if (formData.description.trim()) progress += 25
    if (formData.benefits.length > 0) progress += 25
    return progress
  }, [formData])

  // Fetch benefits when dialog opens
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
      fetchBenefits()
      setCurrentStep(1) // Reset to first step when opening
    }
  }, [open])

  // Ajout d'un bénéfice existant à la sélection
  const handleBenefitSelect = useCallback((benefit: Benefit) => {
    if (formData.benefits.some((b) => b.id === benefit.id)) return

    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, benefit],
    }))

    if (errors.benefits) {
      setErrors((prev) => ({ ...prev, benefits: undefined }))
    }
  }, [formData.benefits, errors.benefits])

  // Supprimer un bénéfice
  const removeBenefit = useCallback((id: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits?.filter((benefit) => benefit.id !== id),
    }))
  }, [])

  // Validation de l'étape 1
  const validateStep1 = useCallback((): boolean => {
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Validation du formulaire complet
  const validateForm = useCallback((): boolean => {
    if (!validateStep1()) return false

    if (formData.benefits?.length === 0) {
      setErrors(prev => ({ ...prev, benefits: "Au moins un avantage est requis" }))
      return false
    }

    return true
  }, [formData, validateStep1])

  // Gestion des changements de formulaire
  const handleInputChange = useCallback((field: keyof OfferFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "price" ? Number(value) : value,
    }))

    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  // Gestion ouverture/fermeture du dialog
  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value)
    if (!value) {
      // Reset du formulaire à la fermeture
      setFormData({ name: "", price: 0, icon: "material-symbols:star", description: "", benefits: [] })
      setErrors({})
      setSubmitSuccess(false)
      setSearchTerm("")
      setSelectedCategory("Tous")
      setCurrentStep(1)
    }
  }, [])

  // Navigation entre les étapes
  const nextStep = useCallback(() => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }, [currentStep, validateStep1])

  const prevStep = useCallback(() => {
    setCurrentStep(1)
  }, [])

  // Soumission du formulaire
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
        }, 2000)
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, handleOfferCreated, handleOpenChange])

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Sparkles className="h-5 w-5 mr-2 transition-transform group-hover:rotate-12" />
            Nouvelle Offre
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Créer une nouvelle offre</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Créez une offre attractive pour vos clients en quelques étapes simples
                  </DialogDescription>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-sm text-slate-500 mb-1">Progression</div>
                <div className="flex items-center gap-2">
                  <Progress value={formProgress} className="w-20 h-2" />
                  <span className="text-sm font-medium text-slate-700">{formProgress}%</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Indicateur d'étapes */}
          <div className="px-6 py-3 bg-slate-100 border-b">
            <div className="flex items-center justify-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 1 ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"}`}>
                1
              </div>
              <div className="w-12 h-0.5 bg-slate-300 mx-2"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 2 ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"}`}>
                2
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <FormStep1 
                    formData={formData} 
                    errors={errors} 
                    onInputChange={handleInputChange} 
                  />
                )}
                
                {currentStep === 2 && (
                  <FormStep2
                    formData={formData}
                    errors={errors}
                    benefits={benefits}
                    isLoading={isLoading}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onBenefitSelect={handleBenefitSelect}
                    onRemoveBenefit={removeBenefit}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                  />
                )}
              </AnimatePresence>
            </form>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-slate-50/50">
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
                      <span className="hidden sm:inline">Progression: {formProgress}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Complétez tous les champs pour activer la création</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex gap-3">
                {currentStep === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="min-w-[100px]"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Retour
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  Annuler
                </Button>
                
                {currentStep === 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.name.trim() || !formData.price || !formData.description.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting || formProgress < 100}
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
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}