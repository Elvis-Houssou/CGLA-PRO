"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { motion, easeOut } from "framer-motion"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  DollarSign,
  Target,
  TrendingUp,
  Award,
  MoreVertical,
  Eye,
  Edit,
  UserPlus,
  Star,
  Crown,
  Activity,
} from "lucide-react"

import { ManagerProps } from "@/props"
import User from "@/api/User"
// Import des composants
import CreateManagerForm from "@/components/manager/create-manager-form"
import ManagerDetailsModal from "@/components/manager/manager-details-modal"
import EditManagerForm from "@/components/manager/edit-manager-form"
import ManagerHistoryModal from "@/components/manager/manager-history-modal"


// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
}

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const rowVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

const AnimatedCard = motion(Card)
const AnimatedTableRow = motion(TableRow)

export default function ManagersPage() {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()
    const [managers, setManagers] = useState<ManagerProps[]>([])
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("overview")

    // États pour les modals
    const [selectedManager, setSelectedManager] = useState<ManagerProps | null>(null)
    const [detailsModalOpen, setDetailsModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [historyModalOpen, setHistoryModalOpen] = useState(false)

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !["super_admin"].includes(user?.role || ""))) {
        router.push("/")
        }
    }, [isAuthenticated, isLoading, user, router])

    const LoadManagers = async () => {
        setLoading(true)
        try {
            const response = await User.getManager()
            if (response.status === 200) {
                console.log("success lors du chargement des managers", response.data)
                setManagers(response.data.managers || [])
            }
        } catch (error) {
            console.error("Erreur lors du chargement des managers:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            LoadManagers()
        }
    }, [])

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Chargement...</div>
    }

    if (!isAuthenticated) {
        return <div className="flex h-screen items-center justify-center">Non authentifié</div>
    }

    const handleManagerCreated = (newManager: ManagerProps) => {
        setManagers((prevManagers) => [newManager, ...prevManagers])
    }

    const handleManagerUpdated = (updatedManager: ManagerProps) => {
        setManagers((prev) => prev.map((m) => (m.manager.id === updatedManager.manager.id ? updatedManager : m)))
    }

    const openDetailsModal = (manager: ManagerProps) => {
        setSelectedManager(manager)
        setDetailsModalOpen(true)
    }

    const openEditModal = (manager: ManagerProps) => {
        setSelectedManager(manager)
        setEditModalOpen(true)
    }

    const openHistoryModal = (manager: ManagerProps) => {
        setSelectedManager(manager)
        setHistoryModalOpen(true)
    }

    const getStatusColor = (status: boolean) => {
        switch (status) {
        case true:
            return "bg-green-500"
        case false:
            return "bg-red-500"
        // case "on_leave":
        //     return "bg-orange-500"
        default:
            return "bg-gray-500"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
        case "active":
            return "Actif"
        case "inactive":
            return "Inactif"
        case "on_leave":
            return "En congé"
        default:
            return "Inconnu"
        }
    }

    const stats = {
        totalManagers: managers.length,
        activeManagers: managers.filter((m) => m.manager.is_active === true).length,
        totalUsersAdded: managers.reduce((sum, m) => sum + m.count_wash_records, 0),
        // totalEarnings: managers.reduce((sum, m) => sum + m.quota.remuneration, 0),
    }

    if (!user) {
        return null
    }

    return (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Suivi des Managers
            </h1>
            <p className="text-muted-foreground">Tableau de bord des performances et rémunérations</p>
            </div>
            <div className="flex items-center gap-2">
            <CreateManagerForm onManagerCreated={handleManagerCreated} />
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedCard
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700">Total Managers</CardTitle>
                    <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-blue-800">{stats.totalManagers}</div>
                    <p className="text-xs text-blue-600">{stats.activeManagers} actifs</p>
                </CardContent>
            </AnimatedCard>

            <AnimatedCard
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-700">Utilisateurs Ajoutés</CardTitle>
                    <UserPlus className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-green-800">{stats.totalUsersAdded}</div>
                    <p className="text-xs text-green-600">Ce mois</p>
                </CardContent>
            </AnimatedCard>

            <AnimatedCard
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700">Rémunérations Totales</CardTitle>
                    <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                {/* <CardContent>
                    <div className="text-3xl font-bold text-purple-800">{stats.totalEarnings.toLocaleString()}€</div>
                    <p className="text-xs text-purple-600">Ce mois</p>
                </CardContent> */}
            </AnimatedCard>

            {/* <AnimatedCard
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-700">Quota Moyen</CardTitle>
                    <Target className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-orange-800">{stats.averageQuotaCompletion}%</div>
                    <p className="text-xs text-orange-600">Réalisation</p>
                </CardContent>
            </AnimatedCard> */}
        </div>

        {/* Top Performer Highlight */}
        {/* {stats.topPerformer && (
            <AnimatedCard
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
            >
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                <Crown className="w-5 h-5 text-yellow-500" />
                Manager du Mois
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-yellow-300">
                    <AvatarImage src={stats.topPerformer.avatar || "/placeholder.svg"} alt="Top Performer" />
                    <AvatarFallback className="bg-yellow-100 text-yellow-800 text-lg font-bold">
                    {stats.topPerformer.firstname.charAt(0)}
                    {stats.topPerformer.lastname.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-900">
                    {stats.topPerformer.firstname} {stats.topPerformer.lastname}
                    </h3>
                    <p className="text-amber-700">{stats.topPerformer.performance.thisMonth} utilisateurs ajoutés</p>
                    <div className="flex items-center gap-4 mt-2">
                    <Badge className="bg-yellow-500 text-white">{stats.topPerformer.quota.percentage}% du quota</Badge>
                    <span className="text-sm text-amber-600">
                        +{stats.topPerformer.performance.growth}% vs mois dernier
                    </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-amber-800">
                    {stats.topPerformer.totalEarnings.toLocaleString()}€
                    </div>
                    <p className="text-sm text-amber-600">Rémunération totale</p>
                </div>
                </div>
            </CardContent>
            </AnimatedCard>
        )} */}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="performance">Performances</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
            {loading ? (
                <div className="text-center py-8">Chargement des managers...</div>
            ) : (
                <motion.div initial="hidden" animate="visible" variants={tableVariants}>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Liste des Managers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Manager</TableHead>
                                    <TableHead>Quota</TableHead>
                                    {/* <TableHead>Performance</TableHead> */}
                                    <TableHead>Rémunération</TableHead>
                                    <TableHead>Utilisateurs</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {managers.map((manager, index) => (
                                    <AnimatedTableRow key={manager.manager.id} variants={rowVariants} custom={index}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={"/placeholder.svg"} alt="Manager" />
                                                <AvatarFallback>
                                                    {manager.manager.firstname?.charAt(0) || "?"}
                                                    {manager.manager.lastname?.charAt(0) || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                {manager.manager.firstname} {manager.manager.lastname}
                                                {/* {getRankIcon(manager..performance.rank)} */}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{manager.manager.email}</div>
                                                {/* <div className="flex gap-1 mt-1">
                                                    {manager.regions.map((region, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                        {region}
                                                        </Badge>
                                                    ))}
                                                </div> */}
                                            </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>
                                                    {/* {manager.quota.current}/{manager.quota.monthly} */}
                                                    {manager.quota?.quota || 0}
                                                </span>
                                                {/* <span className={getPerformanceColor(manager.quota.percentage)}>
                                                    {manager.quota.percentage}%
                                                </span> */}
                                            </div>
                                            <Progress
                                                value={Math.min(manager.quota?.quota || 0, 100)}
                                                className="h-2"
                                                style={{
                                                background:
                                                    manager.quota?.quota || 0 >= 100
                                                    ? "linear-gradient(to right, #10b981, #059669)"
                                                    : undefined,
                                                }}
                                            />
                                            </div>
                                        </TableCell>

                                        {/* <TableCell>
                                            <div className="space-y-1">
                                            <div className="font-medium">{manager.performance.thisMonth} ce mois</div>
                                            <div className="text-sm text-muted-foreground">
                                                {manager.performance.lastMonth} le mois dernier
                                            </div>
                                            <div
                                                className={`text-sm flex items-center gap-1 ${
                                                manager.performance.growth >= 0 ? "text-green-600" : "text-red-600"
                                                }`}
                                            >
                                                <TrendingUp className="w-3 h-3" />
                                                {manager.performance.growth > 0 ? "+" : ""}
                                                {manager.performance.growth}%
                                            </div>
                                            </div>
                                        </TableCell> */}

                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-bold text-lg">{manager.quota?.remuneration?.toLocaleString() || 0}XOF</div>
                                                {/* <div className="font-bold text-lg">{manager.totalEarnings.toLocaleString()}€</div> */}
                                                {/* <div className="text-sm text-muted-foreground">
                                                    Base: {manager.baseSalary.toLocaleString()}€
                                                </div>
                                                <div className="text-sm text-green-600">
                                                    Commission: +{manager.commission.toLocaleString()}€
                                                </div> */}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="space-y-1">
                                            <div className="font-medium">{manager.count_wash_records} ajoutés</div>
                                            {/* <div className="text-sm text-muted-foreground">
                                                {manager.usersAdded.filter((u) => u.status === "active").length} actifs
                                            </div> */}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge className={`${getStatusColor(manager.manager.is_active)} text-white`}>
                                            {getStatusLabel(manager.manager.is_active ? "active" : "inactive")}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align="end" className="w-48">
                                                    <div className="flex flex-col gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="justify-start"
                                                        onClick={() => openDetailsModal(manager)}
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Voir détails
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="justify-start"
                                                        onClick={() => openEditModal(manager)}
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Modifier
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="justify-start"
                                                        onClick={() => openHistoryModal(manager)}
                                                    >
                                                        <Activity className="w-4 h-4 mr-2" />
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
                {managers.map((manager) => (
                <AnimatedCard key={manager.manager.id} variants={cardVariants} initial="hidden" animate="visible">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={"/placeholder.svg"} alt="Manager" />
                        <AvatarFallback>
                            {manager.manager.firstname?.charAt(0) || "?"}
                            {manager.manager.lastname?.charAt(0) || "?"}
                        </AvatarFallback>
                        </Avatar>
                        {manager.manager.firstname} {manager.manager.lastname}
                        {/* {getRankIcon(manager.performance.rank)} */}
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <div className="text-sm text-muted-foreground">Quota</div>
                        {/* <div className="text-2xl font-bold">{manager.quota.percentage}%</div> */}
                        <div className="text-2xl font-bold">{manager.quota?.quota || 0}</div>
                        </div>
                        <div>
                        {/* <div className="text-sm text-muted-foreground">Croissance</div>
                        <div
                            className={`text-2xl font-bold ${
                            manager.performance.growth >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                        >
                            {manager.performance.growth > 0 ? "+" : ""}
                            {manager.performance.growth}%
                        </div> */}
                        </div>
                    </div>
                    <Progress value={Math.min(manager.quota?.quota || 0, 100)} className="h-3" />
                    {/* <div className="text-sm text-muted-foreground">
                        {manager.quota.current} / {manager.quota.monthly} utilisateurs ce mois
                    </div> */}
                    </CardContent>
                </AnimatedCard>
                ))}
            </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
            {selectedManager ? (
                <AnimatedCard variants={cardVariants} initial="hidden" animate="visible">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={"/placeholder.svg"} alt="Manager" />
                            <AvatarFallback>
                            {selectedManager.manager.firstname?.charAt(0) || "?"}
                            {selectedManager.manager.lastname?.charAt(0) || "?"}
                            </AvatarFallback>
                        </Avatar>
                        Détails - {selectedManager.manager.firstname} {selectedManager.manager.lastname}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-3">Informations personnelles</h3>
                        <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{selectedManager.manager.email}</span>
                        </div>
                        {/* <div className="flex justify-between">
                            <span className="text-muted-foreground">Date d&apos;embauche:</span>
                            <span>{new Date(selectedManager.hireDate).toLocaleDateString("fr-FR")}</span>
                        </div> */}
                        {/* <div className="flex justify-between">
                            <span className="text-muted-foreground">Dernière activité:</span>
                            <span>{new Date(selectedManager.lastActivity).toLocaleDateString("fr-FR")}</span>
                        </div> */}
                        </div>
                    </div>

                        {/* <div>
                            <h3 className="font-semibold mb-3">Spécialités</h3>
                            <div className="flex flex-wrap gap-2">
                            {selectedManager.specialties.map((specialty, idx) => (
                                <Badge key={idx} variant="secondary">
                                {specialty}
                                </Badge>
                            ))}
                            </div>
                        </div> */}
                    </div>

                    <div>
                    <h3 className="font-semibold mb-3">Utilisateurs ajoutés ({selectedManager.count_wash_records})</h3>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Date d&apos;ajout</TableHead>
                            <TableHead>Statut</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* {selectedManager.wash_records.map((userAdded) => (
                                <TableRow key={userAdded.id}>
                                <TableCell className="font-medium">
                                    {userAdded.firstname} {userAdded.lastname}
                                </TableCell>
                                <TableCell>{userAdded.email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{userAdded.role}</Badge>
                                </TableCell>
                                <TableCell>{new Date(userAdded.addedDate).toLocaleDateString("fr-FR")}</TableCell>
                                <TableCell>
                                    <Badge
                                    className={`${userAdded.status === "active" ? "bg-green-500" : "bg-red-500"} text-white`}
                                    >
                                    {userAdded.status === "active" ? "Actif" : "Inactif"}
                                    </Badge>
                                </TableCell>
                                </TableRow>
                            ))} */}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
                </AnimatedCard>
            ) : (
                <Card>
                <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                    <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Sélectionnez un manager pour voir ses détails</p>
                    </div>
                </CardContent>
                </Card>
            )}
            </TabsContent>
        </Tabs>

        {/* Modals */}
        <ManagerDetailsModal manager={selectedManager} open={detailsModalOpen} onOpenChange={setDetailsModalOpen} />

        <EditManagerForm
            manager={selectedManager}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onManagerUpdated={handleManagerUpdated}
        />

        <ManagerHistoryModal manager={selectedManager} open={historyModalOpen} onOpenChange={setHistoryModalOpen} />
        </div>
    )
}