/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion } from "framer-motion"
import { GarageProps } from "@/props";

import { 
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination"
import { PageSizeSelector } from "@/components/ui/page-size-selector"


import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react"
import { CreateGarageForm, EditGarageForm, DeleteGarageForm } from "@/components/form/GarageForm";

import { MoreVertical } from "lucide-react";

// Animation variants pour les éléments du tableau
const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

// Composant de ligne animée
const AnimatedTableRow = motion(TableRow)


export default function Garages() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [garages, setGarages] = useState<GarageProps[]>([]);
  const [originalGarages, setOriginalGarages] = useState<GarageProps[]>([]);
    const [selectedGarages, setSelectedGarages] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState<boolean>(false);
  
  const [tableKey, setTableKey] = useState<number>(0)
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(1)

  // État pour gérer le tri
  const [sortConfig, setSortConfig] = useState<{
    key: keyof GarageProps | "name" | null;
    direction: "asc" | "desc" | null;
  }>({ key: null, direction: null });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !["super_admin", "manager"].includes(user?.role || ""))) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Fonction pour ajouter un nouvel utilisateur en haut de la liste
  const handleGarageCreated = (newGarage: GarageProps) => {
    setGarages((prevGarages) => [newGarage, ...prevGarages])
    setOriginalGarages((prevGarages) => [newGarage, ...prevGarages])
    // Forcer la réanimation du tableau
    setTableKey((prev) => prev + 1)
  }

  
  const handleGarageUpdated = (updated: GarageProps) =>
    setGarages((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
  );

  const handleGarageDeleted = (deletedGarageId: number) => {
    // Mettre à jour l'état des utilisateurs en filtrant l'utilisateur supprimé
    setGarages((prev) => prev.filter((user) => user.id !== deletedGarageId))

    // Mettre également à jour les utilisateurs originaux
    setOriginalGarages((prev) => prev.filter((user) => user.id !== deletedGarageId))

    // Désélectionner l'utilisateur s'il était sélectionné
    if (selectedGarages.has(deletedGarageId)) {
        const newSelected = new Set(selectedGarages)
        newSelected.delete(deletedGarageId)
        setSelectedGarages(newSelected)
    }

    // Forcer la réanimation du tableau
    setTableKey((prev) => prev + 1)
  }

  // Gérer la sélection individuelle d'un utilisateur
  const handleSelectGarage = (garageId: number) => {
    const newSelected = new Set(selectedGarages);
    if (newSelected.has(garageId)) {
        newSelected.delete(garageId);
        setSelectAll(false);
    } else {
        newSelected.add(garageId);
        // Vérifier si tous les utilisateurs sont maintenant sélectionnés
        if (newSelected.size === garages.length) {
            setSelectAll(true);
        }
    }
    setSelectedGarages(newSelected);
  };

  // Gérer la sélection/désélection de tous les utilisateurs
  const handleSelectAll = () => {
      if (selectAll) {
          // Désélectionner tous les utilisateurs
          setSelectedGarages(new Set());
      } else {
          // Sélectionner tous les utilisateurs
          const allGarageIds = garages.map(garage => garage.id);
          setSelectedGarages(new Set(allGarageIds));
      }
      setSelectAll(!selectAll);
  };

  // Vérifier si un utilisateur est sélectionné
  const isSelected = (garageId: number) => selectedGarages.has(garageId);
  
  // Fonction de tri
  const handleSort = (key: keyof GarageProps | "name") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sortedGarages = [...garages].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      if (key === "name") {
        valueA = `${a.name}`.toLowerCase();
        valueB = `${b.name}`.toLowerCase();
      } else {
        valueA = a[key] ? a[key].toString().toLowerCase() : "";
        valueB = b[key] ? b[key].toString().toLowerCase() : "";
      }

      if (valueA < valueB) return direction === "asc" ? -1 : 1;
      if (valueA > valueB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setGarages(sortedGarages);
  };
  
  // Fonction pour obtenir l'icône de tri appropriée
  const getSortIcon = (columnKey: keyof GarageProps | "name") => {
      if (sortConfig.key === columnKey) {
      return sortConfig.direction === "asc" ? "bx:sort-up" : "bx:sort-down";
      }
      return "bx:sort";
  };

  // Fonction pour obtenir les utilisateurs de la page courante
  const getPaginatedGarages = () => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return garages.slice(startIndex, endIndex)
  }

  // Calculer le nombre total de pages
  useEffect(() => {
      setTotalPages(Math.ceil(garages.length / pageSize))
      // Si la page actuelle est supérieure au nombre total de pages, revenir à la première page
      if (currentPage > Math.ceil(garages.length / pageSize) && garages.length > 0) {
      setCurrentPage(1)
      }
  }, [garages, pageSize, currentPage])

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
      setCurrentPage(page)
  }

  // Gérer le changement de taille de page
  const handlePageSizeChange = (size: number) => {
      setPageSize(size)
      setCurrentPage(1) // Revenir à la première page lors du changement de taille
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-primary-hover p-4 rounded-lg shadow-md flex flex-col gap-4">
      <div className="flex-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p>Interface pour gérer les utilisateurs (super_admin/manager).</p>
        </div>
        <div className="flex items-center gap-2">
          {/* {selectedUsers.size > 0 && (
              <span className="text-sm">{selectedUsers.size} utilisateur(s) sélectionné(s)</span>
          )} */}

          <CreateGarageForm onGarageCreated={handleGarageCreated} />
        </div>
      </div>
      <div>
        {loading ? (
            <div className="text-center py-4">Chargement des garages...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <motion.div key={tableKey} initial="hidden" animate="visible" variants={tableVariants}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        aria-label="Sélectionner tous les utilisateurs"
                        className="border-white"
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center gap-2">
                        Profil
                        <Icon icon={getSortIcon("name")} />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        Propriétaire
                      </div>
                    </TableHead>
                    <TableHead>Info</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedGarages().map((garage, index) => (
                      <AnimatedTableRow key={user.id} variants={rowVariants} custom={index}>
                          <TableCell className="w-12">
                            <Checkbox
                              checked={isSelected(user.id)}
                              onCheckedChange={() => handleSelectGarage(user.id)}
                              aria-label={`Sélectionner ${user.firstname} ${user.lastname}`}
                              className="border-white"
                            />
                          </TableCell>
                          <TableCell className="flex items-center gap-2">
                            {garage.image ? (
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={garage.image || "/placeholder.svg"} alt="Garage Image" />
                                <AvatarFallback>
                                    {(garage.name?.charAt(0) || "?")}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                    {(garage.name?.charAt(0)  || "?")}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <h1 className="font-bold text-md">
                                {garage.name}
                              </h1>
                            </div>
                          </TableCell>
                          <TableCell>{garage.user_id}</TableCell>
                          <TableCell>
                            {garage?.country || ""} - {garage?.city || ""}
                            {garage?.address || ""}
                          </TableCell>
                          <TableCell className="w-16">
                              <Popover>
                                  <PopoverTrigger className="w-full">
                                      <Button
                                          variant="outline"
                                          className={`w-8 justify-center rounded-full text-white lift-effect`}
                                          size="sm"
                                      >
                                          <MoreVertical className="flex items-center" />
                                      </Button>
                                  </PopoverTrigger>
                                  <PopoverContent align="end" className="w-42 text-black flex flex-col gap-2">
                                    <EditGarageForm
                                      getGarage={garage}                 
                                      onUserUpdated={handleGarageUpdated}
                                    />
                                    <DeleteGarageForm 
                                      key={garage.id}
                                      garageId={garage.id}
                                      onUserDeleted={handleGarageDeleted}
                                    />
                                  </PopoverContent>
                              </Popover>
                          </TableCell>
                      </AnimatedTableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Footer de pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <PageSizeSelector pageSize={pageSize} onPageSizeChange={handlePageSizeChange} />
                  {selectedGarages.size > 0 && (
                    <span className="text-sm text-gray-500">{selectedGarages.size} utilisateur(s) sélectionné(s)</span>
                  )}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </motion.div>
          )
        }
      </div>
    </div>
  );
}