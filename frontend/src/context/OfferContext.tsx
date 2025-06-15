"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { OfferProps } from "@/props"
import Offers from "@/api/Offer"
import { toast } from "react-toastify"

interface OffersContextType {
  offers: OfferProps[]
  loading: boolean
  error: string | null

  // Actions
  fetchOffers: () => Promise<void>
  addOffer: (offer: OfferProps) => void
  removeOffer: (offerId: number) => void
  updateOffer: (offerId: number, updatedOffer: Partial<OfferProps>) => void

  // Event handlers
  handleOfferCreated: (newOffer: OfferProps) => void
  handleOfferDeleted: (deletedOfferId: number) => void
  handleOfferUpdated: (offerId: number, updatedOffer: Partial<OfferProps>) => void
}

const OffersContext = createContext<OffersContextType | undefined>(undefined)

export const useOffers = () => {
  const context = useContext(OffersContext)
  if (context === undefined) {
    throw new Error("useOffers must be used within an OffersProvider")
  }
  return context
}

interface OffersProviderProps {
  children: ReactNode
}

export const OffersProvider: React.FC<OffersProviderProps> = ({ children }) => {
  const [offers, setOffers] = useState<OfferProps[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOffers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await Offers.getAllOffers()

      if (response.status === 200) {
        const offersData = response.data.offers || []

        // Récupérer les bénéfices pour chaque offre
        const offersWithBenefits = await Promise.all(
          offersData.map(async (offer: OfferProps) => {
            try {
              const responseBenefit = await Offers.getBenefitByOfferId(offer.id)
              if (responseBenefit.status === 200) {
                const benefits = responseBenefit.data.data?.benefits || []
                return { ...offer, benefits }
              } else {
                return { ...offer, benefits: [] }
              }
            } catch (error) {
              console.error("Error fetching benefits for offer:", offer.id, error)
              return { ...offer, benefits: [] }
            }
          }),
        )

        setOffers(offersWithBenefits)
      } else {
        setError("Erreur lors de la récupération des offres")
        toast.error("Erreur lors de la récupération des offres")
      }
    } catch (error) {
      console.error("Error fetching offers:", error)
      setError("Erreur lors de la récupération des offres")
      toast.error("Erreur lors de la récupération des offres")
    } finally {
      setLoading(false)
    }
  }, [])

  const addOffer = useCallback((offer: OfferProps) => {
    setOffers((prev) => [offer, ...prev])
  }, [])

  const removeOffer = useCallback((offerId: number) => {
    setOffers((prev) => prev.filter((offer) => offer.id !== offerId))
  }, [])

  const updateOffer = useCallback((offerId: number, updatedOffer: Partial<OfferProps>) => {
    setOffers((prev) => prev.map((offer) => (offer.id === offerId ? { ...offer, ...updatedOffer } : offer)))
  }, [])

  const handleOfferCreated = useCallback(
    (newOffer: OfferProps) => {
      addOffer(newOffer)
      toast.success("Offre créée avec succès !")
    },
    [addOffer],
  )

  const handleOfferDeleted = useCallback(
    (deletedOfferId: number) => {
      removeOffer(deletedOfferId)
      toast.success("Offre supprimée avec succès !")
    },
    [removeOffer],
  )

  const handleOfferUpdated = useCallback(
    (offerId: number, updatedOffer: Partial<OfferProps>) => {
      updateOffer(offerId, updatedOffer)
      toast.success("Offre mise à jour avec succès !")
    },
    [updateOffer],
  )

  const value: OffersContextType = {
    offers,
    loading,
    error,
    fetchOffers,
    addOffer,
    removeOffer,
    updateOffer,
    handleOfferCreated,
    handleOfferDeleted,
    handleOfferUpdated,
  }

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>
}
