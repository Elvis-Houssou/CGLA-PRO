"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
// import { Easing } from 'framer-motion';
import {
  Users,
  DollarSign,
  UserPlus,
  MoreVertical,
  Eye,
  Edit,
  Activity,
  ChevronRight,
  CircleDollarSign,
  UserCheck,
  BarChart3,
  UserCog,
} from "lucide-react";

import { ManagerProps } from "@/props";
import User from "@/api/User";
import CreateManagerForm from "@/components/manager/create-manager-form";
import ManagerDetailsModal from "@/components/manager/manager-details-modal";
import EditManagerForm from "@/components/manager/edit-manager-form";
import ManagerHistoryModal from "@/components/manager/manager-history-modal";

// Animation variants
import { easeOut } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOut, // Use the Easing.easeOut constant
    },
  },
};
const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const springTransition = {
  type: "spring" as const,
  stiffness: 100,
  damping: 15,
}

const rowVariants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: springTransition,
  },
};

const AnimatedCard = motion(Card);
const AnimatedTableRow = motion(TableRow);

export default function ManagersPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [managers, setManagers] = useState<ManagerProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // États pour les modals
  const [selectedManager, setSelectedManager] = useState<ManagerProps | null>(
    null
  );
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated || !["super_admin"].includes(user?.role || ""))
    ) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user, router]);

  const loadManagers = async () => {
    setLoading(true);
    try {
      const response = await User.getManager();
      if (response.status === 200) {
        setManagers(response.data.managers || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des managers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadManagers();
    }
  }, [isAuthenticated]);

  const handleManagerCreated = (newManager: ManagerProps) => {
    setManagers((prev) => [newManager, ...prev]);
  };

  const handleManagerUpdated = (updatedManager: ManagerProps) => {
    setManagers((prev) =>
      prev.map((m) =>
        m.manager.id === updatedManager.manager.id ? updatedManager : m
      )
    );
  };

  const openDetailsModal = (manager: ManagerProps) => {
    setSelectedManager(manager);
    setActiveTab("details");
    // setDetailsModalOpen(true);
  };

  const openEditModal = (manager: ManagerProps) => {
    setSelectedManager(manager);
    setEditModalOpen(true);
  };

  const openHistoryModal = (manager: ManagerProps) => {
    setSelectedManager(manager);
    setHistoryModalOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="outline" className="gap-1">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        Actif
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        Inactif
      </Badge>
    );
  };

  const stats = {
    totalManagers: managers.length,
    activeManagers: managers.filter((m) => m.manager.is_active).length,
    totalUsersAdded: managers.reduce((sum, m) => sum + m.count_wash_records, 0),
  };

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

  if (!isAuthenticated) {
    return (
      <div className="flex h-fit items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-800">Non authentifié</h2>
          <p className="text-gray-600 mt-2">
            Veuillez vous connecter pour accéder à cette page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen rounded-md bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserCog className="h-8 w-8 text-blue-600" />
              Gestion des Managers
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Suivi et administration des managers et de leurs performances
            </p>
          </div>
          <CreateManagerForm onManagerCreated={handleManagerCreated}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau Manager
            </Button>
          </CreateManagerForm>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AnimatedCard
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="border-0 shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Managers
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalManagers}
                </CardDescription>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-600 font-medium">
                  {stats.activeManagers} actifs
                </span>
                <span>•</span>
                <span>
                  {stats.totalManagers - stats.activeManagers} inactifs
                </span>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="border-0 shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Utilisateurs Ajoutés
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalUsersAdded}
                </CardDescription>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <UserPlus className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">Ce mois</div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="border-0 shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Rémunérations Totales
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-gray-900 mt-1">
                  {managers
                    .reduce((sum, m) => sum + (m.quota?.remuneration || 0), 0)
                    .toLocaleString()}{" "}
                  XOF
                </CardDescription>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <CircleDollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">Ce mois</div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Activity className="h-4 w-4 mr-2" />
              Performances
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Détails
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={tableVariants}
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Liste des Managers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Manager</TableHead>
                          <TableHead>Quota</TableHead>
                          <TableHead>Rémunération</TableHead>
                          <TableHead>Utilisateurs</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {managers.map((manager, index) => (
                          <AnimatedTableRow
                            key={manager.manager.id}
                            variants={rowVariants}
                            custom={index}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-gray-200">
                                  <AvatarImage
                                    src={"/placeholder.svg"}
                                    alt="Manager"
                                  />
                                  <AvatarFallback className="bg-gray-100 text-gray-800">
                                    {manager.manager.firstname?.charAt(0) ||
                                      "M"}
                                    {manager.manager.lastname?.charAt(0) || " "}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {manager.manager.firstname}{" "}
                                    {manager.manager.lastname}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {manager.manager.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">
                                    Objectif
                                  </span>
                                  <span className="font-medium">
                                    {manager.quota?.quota || 0}
                                  </span>
                                </div>
                                <Progress
                                  value={Math.min(
                                    manager.quota?.quota || 0,
                                    100
                                  )}
                                  className={
                                    (manager.quota?.quota || 0) >= 100
                                      ? "bg-green-500"
                                      : "bg-blue-500 h-2"
                                  }
                                />
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="font-medium text-gray-900">
                                {manager.quota?.remuneration?.toLocaleString() ||
                                  0}{" "}
                                XOF
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="font-medium">
                                {manager.count_wash_records}
                              </div>
                              <div className="text-sm text-gray-500">
                                ajoutés
                              </div>
                            </TableCell>

                            <TableCell>
                              {getStatusBadge(manager.manager.is_active)}
                            </TableCell>

                            <TableCell className="text-right">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  align="end"
                                  className="w-48 p-2"
                                >
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="justify-start px-3 py-1.5 h-auto"
                                      onClick={() => openDetailsModal(manager)}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Détails
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="justify-start px-3 py-1.5 h-auto"
                                      onClick={() => openEditModal(manager)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="justify-start px-3 py-1.5 h-auto"
                                      onClick={() => openHistoryModal(manager)}
                                    >
                                      <Activity className="h-4 w-4 mr-2" />
                                      Historique
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                          </AnimatedTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))
              ) : managers.length > 0 ? (
                managers.map((manager) => (
                  <AnimatedCard
                    key={manager.manager.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="border-0 shadow-sm"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-gray-200">
                          <AvatarImage src={"/placeholder.svg"} alt="Manager" />
                          <AvatarFallback className="bg-gray-100 text-gray-800">
                            {manager.manager.firstname?.charAt(0) || "M"}
                            {manager.manager.lastname?.charAt(0) || " "}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">
                            {manager.manager.firstname}{" "}
                            {manager.manager.lastname}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {manager.count_wash_records} utilisateurs ajoutés
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Quota</div>
                          <div className="text-2xl font-bold">
                            {manager.quota?.quota || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">
                            Rémunération
                          </div>
                          <div className="text-2xl font-bold">
                            {manager.quota?.remuneration?.toLocaleString() || 0}{" "}
                            XOF
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={Math.min(manager.quota?.quota || 0, 100)}
                        className={
                          (manager.quota?.quota || 0) >= 100
                            ? "bg-green-500"
                            : "bg-blue-500 h-2"
                        }
                      />
                    </CardContent>
                  </AnimatedCard>
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-12">
                  <UserCheck className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun manager
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Commencez par ajouter votre premier manager
                  </p>
                  <CreateManagerForm onManagerCreated={handleManagerCreated}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Ajouter un manager
                    </Button>
                  </CreateManagerForm>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            {selectedManager ? (
              <AnimatedCard
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="border-0 shadow-sm"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarImage src={"/placeholder.svg"} alt="Manager" />
                      <AvatarFallback className="bg-gray-100 text-gray-800">
                        {selectedManager.manager.firstname?.charAt(0) || "M"}
                        {selectedManager.manager.lastname?.charAt(0) || " "}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        {selectedManager.manager.firstname}{" "}
                        {selectedManager.manager.lastname}
                      </CardTitle>
                      <CardDescription>Détails du manager</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">
                        Informations personnelles
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Email</span>
                          <span className="text-sm font-medium">
                            {selectedManager.manager.email}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Statut</span>
                          <span className="text-sm font-medium">
                            {getStatusBadge(selectedManager.manager.is_active)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">
                        Performances
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Utilisateurs ajoutés
                          </span>
                          <span className="text-sm font-medium">
                            {selectedManager.count_wash_records}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Quota</span>
                          <span className="text-sm font-medium">
                            {selectedManager.quota?.quota || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Rémunération
                          </span>
                          <span className="text-sm font-medium">
                            {selectedManager.quota?.remuneration?.toLocaleString() ||
                              0}{" "}
                            XOF
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">
                        Utilisateurs ajoutés
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600"
                      >
                        Voir tout <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-gray-500">
                        Aucun utilisateur ajouté pour le moment
                      </p>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Eye className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sélectionnez un manager
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Veuillez sélectionner un manager pour voir ses détails
                  </p>
                  <Button variant="outline" className="border-gray-300">
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Voir la liste
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <ManagerDetailsModal
          manager={selectedManager}
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
        />
        <EditManagerForm
          manager={selectedManager}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onManagerUpdated={handleManagerUpdated}
        />
        <ManagerHistoryModal
          manager={selectedManager}
          open={historyModalOpen}
          onOpenChange={setHistoryModalOpen}
        />
      </div>
    </div>
  );
}
