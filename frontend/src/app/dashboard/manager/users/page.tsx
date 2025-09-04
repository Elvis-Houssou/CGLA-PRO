"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, spring } from "framer-motion";
import User from "@/api/User";
import { UserProps, RoleEnum, OfferProps } from "@/props";
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
} from "@/components/ui/popover";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import { PageSizeSelector } from "@/components/ui/page-size-selector";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { MoreVertical, Crown, UserCheck, UserX, Filter, Package } from "lucide-react";
import CreateForm from "@/components/user/CreateForm";
import EditForm from "@/components/user/EditForm";
import DeleteForm from "@/components/user/DeleteForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// Animation variants pour les éléments du tableau
const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

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
      type: spring,
      stiffness: 100,
      damping: 15,
    },
  },
};

// Composant de ligne animée
const AnimatedTableRow = motion(TableRow);

export default function MyUsersPage() {
  const { user: currentUser, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProps[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [tableKey, setTableKey] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [userOffers, setUserOffers] = useState<Record<number, OfferProps[]>>({});
  const [loadingOffers, setLoadingOffers] = useState<Record<number, boolean>>({});

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // État pour gérer le tri
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserProps | "fullName" | null;
    direction: "asc" | "desc" | null;
  }>({ key: null, direction: null });

  // Vérification des permissions
  const hasPermission = useMemo(() => {
    return ["super_admin", "manager"].includes(currentUser?.role || "");
  }, [currentUser]);

  // Redirection si non autorisé
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !hasPermission)) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, hasPermission, router]);

  // Fonction pour obtenir la couleur du badge selon le rôle
  const getRoleColor = useCallback((role: string | undefined) => {
    switch (role) {
      case "super_admin":
        return "bg-red-500";
      case "manager":
        return "bg-orange-500";
      case "admin_garage":
        return "bg-blue-500";
      case "employee_garage":
        return "bg-green-500";
      case "client_garage":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  }, []);

  // Fonction pour obtenir le libellé du rôle
  const getRoleLabel = useCallback((role: string | undefined) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "manager":
        return "Manager";
      case "admin_garage":
        return "Admin Garage";
      case "employee_garage":
        return "Employé";
      case "client_garage":
        return "Client";
      default:
        return "Inconnu";
    }
  }, []);

  // Récupération des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || isLoading) return;

      setLoading(true);
      try {
        const response = await User.getAllUsers();
        if (response.status === 200) {
          setUsers(response.data.users);
          setError(null);
        } else {
          setError("Erreur lors de la récupération des utilisateurs.");
          toast.error("Erreur lors de la récupération des utilisateurs.");
        }
      } catch (error: any) {
        const errorMessage =
          error.message || "Erreur lors de la récupération des utilisateurs.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error(
          "Erreur lors de la récupération des utilisateurs:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, isLoading]);

  // Fonction pour récupérer les offres d'un utilisateur
  const fetchUserOffers = useCallback(async (userId: number) => {
    setLoadingOffers(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await User.getUserOffers(userId);
      if (response.status === 200) {
        setUserOffers(prev => ({ 
          ...prev, 
          [userId]: response.data.offers || [] 
        }));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des offres:", error);
      setUserOffers(prev => ({ ...prev, [userId]: [] }));
    } finally {
      setLoadingOffers(prev => ({ ...prev, [userId]: false }));
    }
  }, []);

  // Fonction pour afficher les offres d'un utilisateur
  const renderUserOffers = (userId: number) => {
    const offers = userOffers[userId] || [];
    const isLoading = loadingOffers[userId];

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Chargement des offres...</span>
        </div>
      );
    }

    if (offers.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Aucune offre assignée
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {offers.map((offer) => (
          <div key={offer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{offer.name}</p>
              {offer.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {offer.description}
                </p>
              )}
            </div>
            {offer.price > 0 && (
              <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                {offer.price.toLocaleString()} XOF
              </Badge>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Fonction pour ajouter un nouvel utilisateur
  const handleUserCreated = useCallback((newUser: UserProps) => {
    setUsers((prevUsers) => [newUser, ...prevUsers]);
    setTableKey((prev) => prev + 1);
  }, []);

  // Fonction pour mettre à jour un utilisateur
  const handleUserUpdated = useCallback((updatedUser: UserProps) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    setTableKey((prev) => prev + 1);
  }, []);

  // Fonction pour supprimer un utilisateur
  const handleUserDeleted = useCallback((userId: number) => {
    setUsers((prevUsers) => prevUsers?.filter((user) => user.id !== userId));
    setTableKey((prev) => prev + 1);
  }, []);

  // Fonction pour changer le statut d'un utilisateur
  const handleChangeStatus = async (userId: number, status: boolean) => {
    setLoading(true);
    try {
      const response = await User.updateStatus(userId, status);

      if (response.status === 200) {
        toast.success("Statut mis à jour avec succès.");
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === userId ? { ...u, is_active: status } : u
          )
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour du statut.");
      console.error("Erreur lors de la mise à jour du statut:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour changer le rôle d'un utilisateur
  const handleChangeRole = async (userId: number, role: string) => {
    setLoading(true);
    try {
      const response = await User.updateRole(userId, role);

      if (response.status === 200) {
        toast.success("Rôle mis à jour avec succès.");
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? { ...u, role: role } : u))
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour du rôle.");
      console.error("Erreur lors de la mise à jour du rôle:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la sélection individuelle
  const handleSelectUser = useCallback((userId: number) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  // Fonction de tri
  const handleSort = useCallback(
    (key: keyof UserProps | "fullName") => {
      let direction: "asc" | "desc" = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key, direction });
    },
    [sortConfig]
  );

  // Fonction pour obtenir l'icône de tri appropriée
  const getSortIcon = useCallback(
    (columnKey: keyof UserProps | "fullName") => {
      if (sortConfig.key === columnKey) {
        return sortConfig.direction === "asc" ? "bx:sort-up" : "bx:sort-down";
      }
      return "bx:sort";
    },
    [sortConfig]
  );

  // Filtrage et tri des utilisateurs
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users?.filter((user) => {
      const roleMatch = filterRole === "all" || user.role === filterRole;
      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "active" && user.is_active) ||
        (filterStatus === "inactive" && !user.is_active);
      return roleMatch && statusMatch;
    });

    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a, b) => {
        let valueA: any;
        let valueB: any;

        if (sortConfig.key === "fullName") {
          valueA = `${a.firstname} ${a.lastname}`.toLowerCase();
          valueB = `${b.firstname} ${b.lastname}`.toLowerCase();
        } else if (sortConfig.key === "is_active") {
          valueA = a[sortConfig.key] ? 1 : 0;
          valueB = b[sortConfig.key] ? 1 : 0;
        } else if (sortConfig.key in a) {
          valueA =
            a[sortConfig.key as keyof UserProps]?.toString().toLowerCase() ||
            "";
          valueB =
            b[sortConfig.key as keyof UserProps]?.toString().toLowerCase() ||
            "";
        } else {
          return 0;
        }

        if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, filterRole, filterStatus, sortConfig]);

  // Gérer la sélection/désélection de tous les utilisateurs
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedUsers(new Set());
    } else {
      const allUserIds = filteredAndSortedUsers.map((user) => user.id);
      setSelectedUsers(new Set(allUserIds));
    }
    setSelectAll(!selectAll);
  }, [selectAll, filteredAndSortedUsers]);

  // Calcul des statistiques
  const stats = useMemo(() => {
    return {
      total: users?.length,
      active: users?.filter((u) => u.is_active)?.length,
      inactive: users?.filter((u) => !u.is_active)?.length,
      admins: users?.filter((u) =>
        ["super_admin", "manager", "admin_garage"].includes(u.role || "")
      )?.length,
    };
  }, [users]);

  // Calcul de la pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedUsers?.length / pageSize);
  }, [filteredAndSortedUsers, pageSize]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedUsers?.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedUsers, currentPage, pageSize]);

  // Réinitialiser la sélection quand les données changent
  useEffect(() => {
    setSelectedUsers(new Set());
    setSelectAll(false);
  }, [filteredAndSortedUsers]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, filterStatus]);

  // Gérer le changement de taille de page
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Gérer le changement de page
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Toaster position="top-right" richColors />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-lg bg-white border-none transition-all hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Utilisateurs
            </CardTitle>
            <Icon
              icon="lucide:users"
              className="h-5 w-5 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} actifs
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-white border-none transition-all hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilisateurs Actifs
            </CardTitle>
            <UserCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inactive} inactifs
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-white border-none transition-all hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administrateurs
            </CardTitle>
            <Crown className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">Rôles admin</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-white border-none transition-all hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
            <UserX className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">À réactiver</p>
          </CardContent>
        </Card>
      </div>

      <div className="w-full bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Gestion des utilisateurs
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gérez les utilisateurs et leurs permissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateForm onUserCreated={handleUserCreated} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[150px] sm:w-[180px] border-none bg-transparent">
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin_garage">Admin Garage</SelectItem>
                <SelectItem value="employee_garage">Employé</SelectItem>
                <SelectItem value="client_garage">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px] sm:w-[180px] border-none bg-transparent">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <motion.div
              key={tableKey}
              initial="hidden"
              animate="visible"
              variants={tableVariants}
            >
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        aria-label="Sélectionner tous les utilisateurs"
                      />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("fullName")}
                    >
                      <div className="flex items-center gap-2">
                        <span>Profil</span>
                        <Icon icon={getSortIcon("fullName")} />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline">Email</span>
                        <Icon icon={getSortIcon("email")} />
                      </div>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">Rôle</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Offres</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers?.length > 0 ? (
                    paginatedUsers.map((userData, index) => (
                      <AnimatedTableRow
                        key={userData.id}
                        variants={rowVariants}
                        custom={index}
                        className="border-t hover:bg-gray-50"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(userData.id)}
                            onCheckedChange={() =>
                              handleSelectUser(userData.id)
                            }
                            aria-label={`Sélectionner ${userData.firstname} ${userData.lastname}`}
                          />
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                              <AvatarImage
                                src={userData.image || "/placeholder.svg"}
                                alt="User Image"
                              />
                              <AvatarFallback>
                                {userData.firstname?.charAt(0) || "?"}
                                {userData.lastname?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm sm:text-base">
                                {userData.firstname} {userData.lastname}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                @{userData.username}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-gray-700 text-sm sm:text-base">
                          {userData.email}
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className="flex items-center">
                                <div
                                  className={`h-3 w-3 rounded-full mr-2 ${getRoleColor(
                                    userData.role || ""
                                  )}`}
                                />
                                <div
                                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleColor(
                                    userData.role || ""
                                  )} text-white`}
                                >
                                  {getRoleLabel(userData.role || "")}
                                </div>
                              </div>
                            </PopoverTrigger>
                          </Popover>
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className="flex items-center">
                                <div
                                  className={`h-3 w-3 rounded-full mr-2 ${
                                    userData.is_active
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                <div
                                  className={`relative inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                    userData.is_active
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {userData.is_active ? (
                                    <span className="flex items-center">
                                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" />
                                      Actif
                                    </span>
                                  ) : (
                                    <span className="flex items-center">
                                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5" />
                                      Inactif
                                    </span>
                                  )}
                                </div>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-32 p-2">
                              <div className="space-y-1">
                                <h4 className="font-medium px-2 py-1">
                                  Statut
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-green-600 hover:bg-green-50"
                                  onClick={() =>
                                    handleChangeStatus(userData.id, true)
                                  }
                                >
                                  Activer
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-red-600 hover:bg-red-50"
                                  onClick={() =>
                                    handleChangeStatus(userData.id, false)
                                  }
                                >
                                  Désactiver
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={() => fetchUserOffers(userData.id)}
                              >
                                <Package className="h-4 w-4 mr-1" />
                                Voir offres
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-80 max-h-96 overflow-y-auto">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-lg">
                                  Offres de {userData.firstname} {userData.lastname}
                                </h4>
                                {renderUserOffers(userData.id)}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>

                        <TableCell className="text-right">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="end"
                              className="w-40 p-2 space-y-1"
                            >
                              <EditForm
                                getUser={userData}
                                onUserUpdated={handleUserUpdated}
                              />
                              <DeleteForm
                                userId={userData.id}
                                onUserDeleted={handleUserDeleted}
                              />
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </AnimatedTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Footer de pagination */}
              {filteredAndSortedUsers?.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <PageSizeSelector
                      pageSize={pageSize}
                      onPageSizeChange={handlePageSizeChange}
                    />
                    {selectedUsers.size > 0 && (
                      <span className="text-sm text-gray-500">
                        {selectedUsers.size} utilisateur(s) sélectionné(s)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 items-center">
                    {selectedUsers.size > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mb-2 sm:mb-0"
                      >
                        Actions groupées
                      </Button>
                    )}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}