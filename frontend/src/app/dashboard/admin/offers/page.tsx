"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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

import { 
  CreditCard, Plus, Package, CheckCircle, Edit3, ArrowRight, 
  RefreshCw, AlertCircle, Search, Filter, Archive, Eye, EyeOff,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const OfferSkeleton = () => (
  <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
    <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100/50">
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

// Composant de pagination séparé
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
          <Button
            key={number}
            variant={currentPage === number ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(number)}
            className="w-10 h-10 p-0"
          >
            {number}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
};

// Composant de carte d'offre séparé
const OfferCard = ({ offer, index, isArchived = false, onEdit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className={`h-full flex flex-col bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group rounded-xl ${
        isArchived ? 'opacity-70 grayscale-[30%]' : ''
      }`}>
        {isArchived && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="outline" className="bg-gray-100 text-gray-600">
              Archivée
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-0 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="flex items-start justify-between p-6 pt-7">
            <div className="flex-1 space-y-2">
              <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                {offer.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                  <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                  {offer.price === 0 ? 'Offre gratuite' : 'Offre Premium'}
                </Badge>
                {offer.isPopular && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Populaire
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg ml-4">
              <Icon icon={offer.icon || "material-symbols:star"} className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-6 pt-0 space-y-5">
          {/* Prix */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Prix mensuel</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">
                  {offer.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 ml-1">XOF</span>
              </div>
            </div>
            {offer.originalPrice && offer.originalPrice > offer.price && (
              <div className="text-right mt-1">
                <span className="text-sm text-gray-400 line-through">
                  {offer.originalPrice.toLocaleString()} XOF
                </span>
                <span className="text-xs text-green-600 ml-2">
                  (-{Math.round((1 - offer.price/offer.originalPrice) * 100)}%)
                </span>
              </div>
            )}
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
                      <BenefitsDialog benefits={offer.benefits} offerName={offer.name}/>
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
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => onEdit(offer)}
              disabled={isArchived}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <DeleteOffer offerId={offer.id} />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default function OffersPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { offers, loading, error, fetchOffers } = useOffers();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("active");
  const [offersPerPage] = useState(6); // Augmenté à 6 pour une meilleure expérience

  // Redirection si non authentifié
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !["super_admin", "admin_manager"].includes(user?.role || ""))) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Chargement des offres
  useEffect(() => {
    if (isAuthenticated) {
      fetchOffers();
    }
  }, [isAuthenticated, fetchOffers]);

  const handleRefresh = useCallback(() => {
    fetchOffers();
    setCurrentPage(1);
    toast.success("Liste des offres actualisée");
  }, [fetchOffers]);

  // Mémoïsation des offres filtrées et triées
  const { filteredOffers, activeOffers, archivedOffers } = useMemo(() => {
    const filtered = offers.filter(offer => {
      const matchesSearch = offer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            offer.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filterStatus === "all") return matchesSearch;
      if (filterStatus === "active") return matchesSearch && !offer.isArchived;
      if (filterStatus === "archived") return matchesSearch && offer.isArchived;
      
      return matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    return {
      filteredOffers: sorted,
      activeOffers: sorted.filter(offer => !offer.isArchived),
      archivedOffers: sorted.filter(offer => offer.isArchived)
    };
  }, [offers, searchQuery, filterStatus, sortBy]);

  // Pagination
  const getPaginatedOffers = useCallback((offersList) => {
    const indexOfLastOffer = currentPage * offersPerPage;
    const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
    return offersList.slice(indexOfFirstOffer, indexOfLastOffer);
  }, [currentPage, offersPerPage]);

  const handleEditOffer = (offer) => {
    // Implémentez la logique d'édition ici
    console.log("Édition de l'offre:", offer);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
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
    <div className="min-h-fit bg-gradient-to-br from-gray-50 to-blue-50/30 px-3 py-2">
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
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 shadow-sm">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gestion des Offres</h1>
                  <p className="text-gray-600 mt-1">
                    Gérez et administrez toutes vos offres commerciales
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <CreateOffer />
            </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher une offre..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={filterStatus} onValueChange={(value) => {
                  setFilterStatus(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actives</SelectItem>
                    <SelectItem value="archived">Archivées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Select value={sortBy} onValueChange={(value) => {
                setSortBy(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom (A-Z)</SelectItem>
                  <SelectItem value="price">Prix (Croissant)</SelectItem>
                  <SelectItem value="newest">Plus récent</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              className="flex items-center justify-center py-12"
            >
              <div className="bg-white border border-red-100 rounded-xl p-8 max-w-md w-full shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-red-100 rounded-full mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Réessayer
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : filteredOffers.length === 0 ? (
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? "Aucune offre correspondante" : "Aucune offre disponible"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery 
                      ? "Aucune offre ne correspond à votre recherche. Essayez d'autres termes."
                      : "Commencez par créer votre première offre commerciale pour vos clients."}
                  </p>
                  {!searchQuery && <CreateOffer />}
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery("")}>
                      Réinitialiser la recherche
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <TabsList className="bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger value="active" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Offres actives ({activeOffers.length})
                    </TabsTrigger>
                    <TabsTrigger value="archived" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Archivées ({archivedOffers.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="text-sm text-gray-500">
                    {searchQuery 
                      ? `${filteredOffers.length} offre${filteredOffers.length !== 1 ? 's' : ''} correspondant à "${searchQuery}"`
                      : `Total: ${filteredOffers.length} offre${filteredOffers.length !== 1 ? 's' : ''}`}
                  </div>
                </div>
                
                <TabsContent value="active" className="mt-0">
                  <motion.div
                    key="active-offers"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {getPaginatedOffers(activeOffers).map((offer, index) => (
                      <OfferCard 
                        key={offer.id} 
                        offer={offer} 
                        index={index} 
                        onEdit={handleEditOffer}
                      />
                    ))}
                  </motion.div>
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={Math.ceil(activeOffers.length / offersPerPage)} 
                    onPageChange={setCurrentPage}
                  />
                </TabsContent>
                
                <TabsContent value="archived" className="mt-0">
                  <motion.div
                    key="archived-offers"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {getPaginatedOffers(archivedOffers).map((offer, index) => (
                      <OfferCard 
                        key={offer.id} 
                        offer={offer} 
                        index={index} 
                        isArchived={true}
                        onEdit={handleEditOffer}
                      />
                    ))}
                  </motion.div>
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={Math.ceil(archivedOffers.length / offersPerPage)} 
                    onPageChange={setCurrentPage}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}