"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { BenefitsDialog, BenefitItem } from "@/components/offer_benefit/BenefitsCard";
import CreateOffer from "@/components/offer/CreateForm";
import DeleteOffer from "@/components/offer/DeleteForm";
import { useOffers } from "@/context/OfferContext";
import dynamic from 'next/dynamic';

const Icon = dynamic(() => import('@iconify/react').then(mod => mod.Icon), {
  ssr: false,
});

import { CreditCard, Plus, Package, CheckCircle, Edit3, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const OfferSkeleton = () => (
  <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="pb-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 rounded-lg" />
        <Skeleton className="h-3 w-full rounded-lg" />
        <Skeleton className="h-3 w-5/6 rounded-lg" />
      </div>
    </CardContent>
    <CardFooter className="p-6 pt-0">
      <div className="flex gap-3 w-full">
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </CardFooter>
  </Card>
);

export default function OffersPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { offers, loading, error, fetchOffers } = useOffers();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !["super_admin", "admin_manager"].includes(user?.role || ""))) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    fetchOffers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen rounded-md bg-gray-50">
      <Toaster position="top-right" richColors />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <Package className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Offres</h1>
              </div>
              <p className="text-gray-600 max-w-2xl">
                Gérez et administrez toutes vos offres commerciales avec une interface intuitive et performante.
              </p>
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <OfferSkeleton key={index} />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-center py-12"
            >
              <div className="bg-white border border-red-100 rounded-xl p-8 max-w-md w-full shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-red-100 rounded-full mb-4">
                    <Icon icon="material-symbols:error-outline" className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Réessayer
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : offers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-center py-12"
            >
              <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md w-full shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-blue-100 rounded-full mb-4 text-blue-600">
                    <Package className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune offre disponible</h3>
                  <p className="text-gray-600 mb-6">
                    Commencez par créer votre première offre commerciale pour vos clients.
                  </p>
                  <CreateOffer>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      {/* <Plus className="h-4 w-4 mr-2" /> */}
                      Créer une offre
                    </Button>
                  </CreateOffer>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="offers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {offers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <Card className="h-full flex flex-col bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                    <CardHeader className="pb-0">
                      <div className="flex items-start justify-between p-6">
                        <div className="flex-1 space-y-2">
                          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                            {offer.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                              Offre Premium
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-6 pt-0 space-y-5">
                      {/* Prix */}
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Prix mensuel</span>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-gray-900">
                              {offer.price.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">XOF</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-500">Description</h4>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                          {offer.description || "Aucune description disponible"}
                        </p>
                      </div>

                      {/* Avantages */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Avantages inclus
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {offer.benefits?.length || 0} avantage{offer.benefits?.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {offer.benefits && offer.benefits.length > 0 ? (
                            <>
                              {offer.benefits.slice(0, 3).map((benefit) => (
                                <BenefitItem key={benefit.id} benefit={benefit} />
                              ))}
                              {offer.benefits.length > 3 && (
                                <div className="pt-2">
                                  <BenefitsDialog benefits={offer.benefits} offerName={offer.name}>
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 w-full">
                                      Voir tous les avantages <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                  </BenefitsDialog>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-500 p-2 bg-gray-50 rounded">
                              <Icon icon="material-symbols:info-outline" className="h-4 w-4" />
                              <span>Aucun avantage configuré</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0">
                      <div className="flex gap-3 w-full">
                        <DeleteOffer offerId={offer.id}  />
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </div>
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