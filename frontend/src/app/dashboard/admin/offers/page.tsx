"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { toast } from "react-toastify";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import Offers from "@/api/Offer";
import { OfferProps, RoleEnum } from "@/props"; 
import { BenefitsDialog, BenefitItem } from "@/components/offer_benefit/BenefitsCard"; 
import CreateOffer from "@/components/offer/CreateForm";
import DeleteOffer from "@/components/offer/DeleteForm";
import { useOffers } from "@/context/OfferContext";

import { Icon } from "@iconify/react"
import { CreditCard, Plus, Package, CheckCircle, Edit3, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";


const OfferSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </CardContent>
    <CardFooter>
      <div className="flex gap-2 ml-auto">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </CardFooter>
  </Card>
)

export default function OffersPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  // const [offers, setOffers] = useState<OfferProps[]>([]);
  
  const { offers, loading, error, fetchOffers } = useOffers()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !["super_admin", "admin_manager"].includes(user?.role || "") )) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                Gestion des Offres
              </h1>
              <p className="text-slate-600 text-lg">Gérez et administrez toutes vos offres commerciales</p>
            </div>
            <CreateOffer />
          </div>
        </motion.div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <OfferSkeleton key={index} />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16"
            >
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
                <div className="text-red-500 mb-4">
                  <Icon icon="material-symbols:error-outline" className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Réessayer
                </Button>
              </div>
            </motion.div>
          ) : offers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 max-w-md mx-auto">
                <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Aucune offre disponible</h3>
                <p className="text-slate-600 mb-4">Commencez par créer votre première offre commerciale.</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une offre
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="offers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {offers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="h-full"
                >
                  <Card className="h-full bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-slate-900 mb-1 line-clamp-2">
                            {offer.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                              <CreditCard className="h-3 w-3 mr-1" />
                              Offre Premium
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-6 space-y-4">
                      {/* Prix */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-600">Prix</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-slate-900">{offer.price.toLocaleString()}</span>
                          <span className="text-sm text-slate-500 ml-1">XOF</span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-700">Description</h4>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {offer.description || "Aucune description disponible"}
                        </p>
                      </div>

                      {/* Avantages */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Avantages inclus
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {offer.benefits?.length} avantages
                          </Badge>
                        </div>

                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {offer.benefits && offer.benefits.length > 0 ? (
                            <>
                              {offer.benefits.slice(0, 3).map((benefit) => (
                                <BenefitItem key={benefit.id} benefit={benefit} />
                              ))}
                              {offer.benefits.length > 1 && (
                                <div className="pt-2 border-t border-slate-100">
                                  <BenefitsDialog benefits={offer.benefits} offerName={offer.name} />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-slate-500 p-2">
                              <Icon icon="material-symbols:info-outline" className="h-4 w-4" />
                              <span>Aucun avantage configuré</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0 flex gap-3">
                      <DeleteOffer offerId={offer.id} />
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}