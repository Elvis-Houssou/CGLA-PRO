/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion"
import User from "@/api/User"
import { UserProps, RoleEnum } from "@/props";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination"
import { PageSizeSelector } from "@/components/ui/page-size-selector"


import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react"
import { MoreVertical, Crown, UserCheck, UserX } from "lucide-react";

// import UserLavage from "@/components/user/userLavage";
import CreateForm from "@/components/user/CreateForm";
import EditForm from "@/components/user/EditForm";
import DeleteForm from "@/components/user/DeleteForm"

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
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

// Composant de ligne animée
const AnimatedTableRow = motion(TableRow)

export default function UsersPage() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserProps[]>([]);
    const [originalUsers, setOriginalUsers] = useState<UserProps[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [is_active, setIsActive] = useState<boolean>(false);
    const [role, setRole] = useState<RoleEnum | null>(null);

    const [tableKey, setTableKey] = useState<number>(0) // Pour forcer la réanimation du tableau

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [filterRole, setFilterRole] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")

    
    // États pour la pagination
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(10)
    const [totalPages, setTotalPages] = useState<number>(1)

    // État pour gérer le tri
    const [sortConfig, setSortConfig] = useState<{
        key: keyof UserProps | "fullName" | null;
        direction: "asc" | "desc" | null;
    }>({ key: null, direction: null });

     const getRoleColor = (role: string) => {
        switch (role) {
        case "super_admin":
            return "bg-red-500"
        case "manager":
            return "bg-orange-500"
        case "admin_garage":
            return "bg-blue-500"
        case "employee_garage":
            return "bg-green-500"
        case "client_garage":
            return "bg-gray-500"
        default:
            return "bg-gray-500"
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
        case "super_admin":
            return "Super Admin"
        case "manager":
            return "Manager"
        case "admin_garage":
            return "Admin Garage"
        case "employee_garage":
            return "Employé"
        case "client_garage":
            return "Client"
        default:
            return "Inconnu"
        }
    }

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !["super_admin", "manager"].includes(user?.role || ""))) {
        router.push("/");
        }
    }, [isAuthenticated, isLoading, user, router]);

    useEffect(() => {
        const fetchUsers = async () => {
            // Vérifier si on est authentifié avant de faire la requête
            if (!isAuthenticated || isLoading) return;

            setLoading(true);
            try {
                const response = await User.getAllUsers();
                if (response.status === 200) {
                    setUsers(response.data.users);
                    setOriginalUsers(response.data.users); // Sauvegarde des données originales
                } else {
                    setError("Erreur lors de la récupération des utilisateurs.");
                    toast.error("Erreur lors de la récupération des utilisateurs.");
                }
            } catch (error: any) {
                toast.error(error.message || "Erreur lors de la récupération des utilisateurs.");
                console.error("Erreur lors de la récupération des utilisateurs:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, [isAuthenticated, isLoading]);

    // Fonction pour ajouter un nouvel utilisateur en haut de la liste
    const handleUserCreated = (newUser: UserProps) => {
        setUsers((prevUsers) => [newUser, ...prevUsers])
        setOriginalUsers((prevUsers) => [newUser, ...prevUsers])
        // Forcer la réanimation du tableau
        setTableKey((prev) => prev + 1)
    }

    const handleUserUpdated = (updated: UserProps) =>
        setUsers((prev) =>
            prev.map((u) => (u.id === updated.id ? updated : u))
    );

    const handleUserDeleted = (deletedUserId: number) => {
        // Mettre à jour l'état des utilisateurs en filtrant l'utilisateur supprimé
        setUsers((prev) => prev.filter((user) => user.id !== deletedUserId))

        // Mettre également à jour les utilisateurs originaux
        setOriginalUsers((prev) => prev.filter((user) => user.id !== deletedUserId))

        // Désélectionner l'utilisateur s'il était sélectionné
        if (selectedUsers.has(deletedUserId)) {
            const newSelected = new Set(selectedUsers)
            newSelected.delete(deletedUserId)
            setSelectedUsers(newSelected)
        }

        // Forcer la réanimation du tableau
        setTableKey((prev) => prev + 1)
    }


    const handleChangeStatus = async (userId: number, status: boolean) => {
        setLoading(true);
        try {
            const response = await User.updateStatus(userId, status);

            if (response.status === 200) {
                toast.success("Statut mis à jour avec succès.");
                // Mettre à jour l'état local des utilisateurs
                setUsers(prevUsers => prevUsers.map(u => 
                    u.id === userId ? {...u, is_active: status} : u
                ));
            }
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour du statut.");
            console.error("Erreur lors de la mise à jour du statut:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleChangeRole = async (userId: number, role: any) => {
        setLoading(true);
        try {
            const response = await User.updateRole(userId, role);

            if (response.status === 200) {
                toast.success("Role mis à jour avec succès.");
                // Mettre à jour l'état local des utilisateurs
                setUsers(prevUsers => prevUsers.map(u => 
                    u.id === userId ? {...u, role: role} : u
                ));
            }
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour du statut.");
            console.error("Erreur lors de la mise à jour du statut:", error);
        } finally {
            setLoading(false);
        }
    }

    // Gérer la sélection individuelle d'un utilisateur
    const handleSelectUser = (userId: number) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
            setSelectAll(false);
        } else {
            newSelected.add(userId);
            // Vérifier si tous les utilisateurs sont maintenant sélectionnés
            if (newSelected.size === users.length) {
                setSelectAll(true);
            }
        }
        setSelectedUsers(newSelected);
    };

    // Gérer la sélection/désélection de tous les utilisateurs
    const handleSelectAll = () => {
        if (selectAll) {
            // Désélectionner tous les utilisateurs
            setSelectedUsers(new Set());
        } else {
            // Sélectionner tous les utilisateurs
            const allUserIds = users.map(user => user.id);
            setSelectedUsers(new Set(allUserIds));
        }
        setSelectAll(!selectAll);
    };

    // Vérifier si un utilisateur est sélectionné
    const isSelected = (userId: number) => selectedUsers.has(userId);

    // Fonction de tri
    const handleSort = (key: keyof UserProps | "fullName") => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
        }

        setSortConfig({ key, direction });

        const sortedUsers = [...users].sort((a, b) => {
            let valueA: any;
            let valueB: any;

            if (key === "fullName") {
                valueA = `${a.firstname} ${a.lastname}`.toLowerCase();
                valueB = `${b.firstname} ${b.lastname}`.toLowerCase();
            } else if (key === "is_active") {
                valueA = a[key] ? 1 : 0; // true -> 1, false -> 0
                valueB = b[key] ? 1 : 0;
            } else {
                valueA = a[key] ? a[key].toString().toLowerCase() : "";
                valueB = b[key] ? b[key].toString().toLowerCase() : "";
            }

            if (valueA < valueB) return direction === "asc" ? -1 : 1;
            if (valueA > valueB) return direction === "asc" ? 1 : -1;
            return 0;
        });

        setUsers(sortedUsers);
    };

    // Fonction pour obtenir l'icône de tri appropriée
    const getSortIcon = (columnKey: keyof UserProps | "fullName") => {
        if (sortConfig.key === columnKey) {
        return sortConfig.direction === "asc" ? "bx:sort-up" : "bx:sort-down";
        }
        return "bx:sort";
    };

    

    // Calculer le nombre total de pages
    useEffect(() => {
        setTotalPages(Math.ceil(users.length / pageSize))
        // Si la page actuelle est supérieure au nombre total de pages, revenir à la première page
        if (currentPage > Math.ceil(users.length / pageSize) && users.length > 0) {
        setCurrentPage(1)
        }
    }, [users, pageSize, currentPage])

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

    const filteredUsers = users.filter((user) => {
        if (filterRole !== "all" && user.role !== filterRole) return false
        if (filterStatus !== "all") {
        if (filterStatus === "active" && !user.is_active) return false
        if (filterStatus === "inactive" && user.is_active) return false
        }
        return true
    })

    const stats = {
        total: users.length,
        active: users.filter((u) => u.is_active).length,
        inactive: users.filter((u) => !u.is_active).length,
        admins: users.filter((u) => ["super_admin", "manager", "admin_garage"].includes(u.role || "")).length,
    }


    if (!user) {
        return null;
    }

    return (
        <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="shadow-lg bg-white border-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                        <Icon icon="lucide:users" className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">{stats.active} actifs</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg bg-white border-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">{stats.inactive} inactifs</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg bg-white border-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
                        <Crown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.admins}</div>
                        <p className="text-xs text-muted-foreground">Rôles admin</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg bg-white border-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.inactive}</div>
                        <p className="text-xs text-muted-foreground">À réactiver</p>
                    </CardContent>
                </Card>
            </div>
            <div className="w-full bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
                <div className="flex-1 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
                        <p>Gérez les utilisateurs et leurs permissions</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreateForm onUserCreated={handleUserCreated} />
                    </div>
                </div>

                

                {/* Filters */}
                <div className="flex gap-4">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="all">Tous les rôles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="manager">Manager</option>
                        <option value="admin_garage">Admin Garage</option>
                        <option value="employee_garage">Employé</option>
                        <option value="client_garage">Client</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="active">Actifs</option>
                        <option value="inactive">Inactifs</option>
                    </select>
                </div>

                <div>
                    {loading ? (
                    <div className="text-center py-4">Chargement des utilisateurs...</div>
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
                                            />
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort("fullName")}>
                                            <div className="flex items-center gap-2">
                                            Profil
                                            <Icon icon={getSortIcon("fullName")} />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                                            <div className="flex items-center gap-2">
                                                Email
                                                <Icon icon={getSortIcon("email")} />
                                            </div>
                                        </TableHead>
                                        <TableHead>Rôle</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Connexion</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers
                                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                                        .map((userData, index) => (
                                            <AnimatedTableRow key={userData.id} variants={rowVariants} custom={index}>
                                                <TableCell>
                                                    <Checkbox
                                                    checked={selectedUsers.has(userData.id)}
                                                    onCheckedChange={() => handleSelectUser(userData.id)}
                                                    aria-label={`Sélectionner ${userData.firstname} ${userData.lastname}`}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={userData.image || "/placeholder.svg"} alt="User Image" />
                                                        <AvatarFallback>
                                                        {userData.firstname?.charAt(0) || "?"}
                                                        {userData.lastname?.charAt(0) || "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">
                                                        {userData.firstname} {userData.lastname}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">@{userData.username}</div>
                                                    </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>{userData.email}</TableCell>

                                                <TableCell>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className={`${getRoleColor(userData.role || '')} text-white hover:opacity-80`}
                                                            >
                                                            {getRoleLabel(userData.role || '')}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent align="start" className="w-48">
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium">Changer le rôle</h4>
                                                                {["super_admin", "manager", "admin_garage", "employee_garage", "client_garage"].map(
                                                                    (role) => (
                                                                    <Button
                                                                        key={role}
                                                                        variant={userData.role === role ? "animated" : "animated"}
                                                                        size="sm"
                                                                        className={`w-full justify-start`}
                                                                        onClick={() => handleChangeRole(userData.id, role)}
                                                                    >
                                                                        {getRoleLabel(role)}
                                                                    </Button>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </TableCell>

                                                <TableCell>
                                                    <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={`${
                                                            userData.is_active ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                                                        } text-white`}
                                                        >
                                                        {userData.is_active ? "Actif" : "Inactif"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="start" className="w-32">
                                                        <div className="space-y-2">
                                                        <h4 className="font-medium">Statut</h4>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full justify-start text-green-600"
                                                            onClick={() => handleChangeStatus(userData.id, true)}
                                                        >
                                                            Activer
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full justify-start text-red-600"
                                                            onClick={() => handleChangeStatus(userData.id, false)}
                                                        >
                                                            Désactiver
                                                        </Button>
                                                        </div>
                                                    </PopoverContent>
                                                    </Popover>
                                                </TableCell>

                                                <TableCell>
                                                    {userData.lastLogin ? (
                                                    <div className="text-sm">{new Date(userData.lastLogin).toLocaleDateString("fr-FR")}</div>
                                                    ) : (
                                                    <span className="text-muted-foreground">Jamais</span>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                        <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="end" className="w-40">
                                                        <div className="space-y-2">
                                                        <EditForm getUser={userData} onUserUpdated={handleUserUpdated} />
                                                        <DeleteForm userId={userData.id} onUserDeleted={handleUserDeleted} />
                                                        {/* <UserLavage userId={userData.id} /> */}
                                                        </div>
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
                                    {selectedUsers.size > 0 && (
                                    <span className="text-sm text-gray-500">{selectedUsers.size} utilisateur(s) sélectionné(s)</span>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-2">
                                    {selectedUsers.size > 0 && (
                                        <Button size="sm" variant="outline">
                                            Actions groupées
                                        </Button>
                                    )}
                                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
  )
}