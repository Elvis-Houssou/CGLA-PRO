/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import User from "@/api/User";
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
} from "@/components/ui/popover";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import { PageSizeSelector } from "@/components/ui/page-size-selector";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { MoreVertical, Crown, UserCheck, UserX, Filter, UserPlus } from "lucide-react";
import CreateForm from "@/components/user/CreateForm";
import EditForm from "@/components/user/EditForm";
import DeleteForm from "@/components/user/DeleteForm";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Animation variants
const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
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
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const AnimatedTableRow = motion(TableRow);

export default function UsersPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProps[]>([]);
  const [originalUsers, setOriginalUsers] = useState<UserProps[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [tableKey, setTableKey] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserProps | "fullName" | null;
    direction: "asc" | "desc" | null;
  }>({ key: null, direction: null });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-gradient-to-r from-red-600 to-red-500";
      case "manager":
        return "bg-gradient-to-r from-orange-600 to-orange-500";
      case "admin_garage":
        return "bg-gradient-to-r from-blue-600 to-blue-500";
      case "employee_garage":
        return "bg-gradient-to-r from-green-600 to-green-500";
      case "client_garage":
        return "bg-gradient-to-r from-gray-600 to-gray-500";
      default:
        return "bg-gradient-to-r from-gray-600 to-gray-500";
    }
  };

  const getRoleLabel = (role: string) => {
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
  };

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !["super_admin", "manager"].includes(user?.role || ""))) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || isLoading) return;

      setLoading(true);
      try {
        const response = await User.getAllUsers();
        if (response.status === 200) {
          setUsers(response.data.users);
          setOriginalUsers(response.data.users);
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
    };

    fetchUsers();
  }, [isAuthenticated, isLoading]);

  const handleUserCreated = (newUser: UserProps) => {
    setUsers((prevUsers) => [newUser, ...prevUsers]);
    setOriginalUsers((prevUsers) => [newUser, ...prevUsers]);
    setTableKey((prev) => prev + 1);
  };

  const handleUserUpdated = (updated: UserProps) =>
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

  const handleUserDeleted = (deletedUserId: number) => {
    setUsers((prev) => prev.filter((user) => user.id !== deletedUserId));
    setOriginalUsers((prev) => prev.filter((user) => user.id !== deletedUserId));

    if (selectedUsers.has(deletedUserId)) {
      const newSelected = new Set(selectedUsers);
      newSelected.delete(deletedUserId);
      setSelectedUsers(newSelected);
    }

    setTableKey((prev) => prev + 1);
  };

  const handleChangeStatus = async (userId: number, status: boolean) => {
    setLoading(true);
    try {
      const response = await User.updateStatus(userId, status);

      if (response.status === 200) {
        toast.success("Statut mis à jour avec succès.");
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? { ...u, is_active: status } : u))
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour du statut.");
      console.error("Erreur lors de la mise à jour du statut:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: number, role: any) => {
    setLoading(true);
    try {
      const response = await User.updateRole(userId, role);

      if (response.status === 200) {
        toast.success("Role mis à jour avec succès.");
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? { ...u, role: role } : u))
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour du statut.");
      console.error("Erreur lors de la mise à jour du statut:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
      setSelectAll(false);
    } else {
      newSelected.add(userId);
      if (newSelected.size === users.length) {
        setSelectAll(true);
      }
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
    } else {
      const allUserIds = users.map((user) => user.id);
      setSelectedUsers(new Set(allUserIds));
    }
    setSelectAll(!selectAll);
  };

  const isSelected = (userId: number) => selectedUsers.has(userId);

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
        valueA = a[key] ? 1 : 0;
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

  const getSortIcon = (columnKey: keyof UserProps | "fullName") => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === "asc" ? "bx:sort-up" : "bx:sort-down";
    }
    return "bx:sort";
  };

  useEffect(() => {
    setTotalPages(Math.ceil(users.length / pageSize));
    if (currentPage > Math.ceil(users.length / pageSize) && users.length > 0) {
      setCurrentPage(1);
    }
  }, [users, pageSize, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) => {
    if (filterRole !== "all" && user.role !== filterRole) return false;
    if (filterStatus !== "all") {
      if (filterStatus === "active" && !user.is_active) return false;
      if (filterStatus === "inactive" && user.is_active) return false;
    }
    return true;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
    admins: users.filter((u) =>
      ["super_admin", "manager", "admin_garage"].includes(u.role || "")
    ).length,
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto  ">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="shadow-lg bg-white border-none transition-all hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Icon icon="lucide:users" className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.active} actifs</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-white border-none transition-all hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <UserCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{stats.inactive} inactifs</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-white border-none transition-all hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
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

      <div className="w-full bg-white p-6 rounded-xl shadow-md flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
            <p className="text-gray-600">Gérez les utilisateurs et leurs permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <CreateForm onUserCreated={handleUserCreated}>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Nouvel utilisateur
              </Button>
            </CreateForm>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px] border-none bg-transparent">
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
              <SelectTrigger className="w-[180px] border-none bg-transparent">
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

        <div>
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
              <div className="overflow-x-auto">
                <Table className="min-w-[800px]">
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
                          Profil
                          <Icon icon={getSortIcon("fullName")} />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center gap-2">
                          Email
                          <Icon icon={getSortIcon("email")} />
                        </div>
                      </TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dernière connexion</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers
                      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                      .map((userData, index) => (
                        <AnimatedTableRow
                          key={userData.id}
                          variants={rowVariants}
                          custom={index}
                          className="border-t hover:bg-gray-50"
                        >
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
                                <div className="font-medium">
                                  {userData.firstname} {userData.lastname}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  @{userData.username}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-gray-700">{userData.email}</TableCell>

                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`${getRoleColor(
                                    userData.role || ""
                                  )} text-white hover:opacity-90`}
                                >
                                  {getRoleLabel(userData.role || "")}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="start" className="w-48 p-2">
                                <div className="space-y-1">
                                  <h4 className="font-medium px-2 py-1">
                                    Changer le rôle
                                  </h4>
                                  {[
                                    "super_admin",
                                    "manager",
                                    "admin_garage",
                                    "employee_garage",
                                    "client_garage",
                                  ].map((role) => (
                                    <Button
                                      key={role}
                                      variant="ghost"
                                      size="sm"
                                      className={`w-full justify-start ${
                                        userData.role === role
                                          ? "bg-gray-100"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handleChangeRole(userData.id, role)
                                      }
                                    >
                                      {getRoleLabel(role)}
                                    </Button>
                                  ))}
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
                                    userData.is_active
                                      ? "bg-green-500 hover:bg-green-600"
                                      : "bg-red-500 hover:bg-red-600"
                                  } text-white`}
                                >
                                  {userData.is_active ? "Actif" : "Inactif"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="start" className="w-32 p-2">
                                <div className="space-y-1">
                                  <h4 className="font-medium px-2 py-1">Statut</h4>
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

                          <TableCell>
                            {userData.lastLogin ? (
                              <div className="text-sm text-gray-600">
                                {new Date(userData.lastLogin).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Jamais
                              </span>
                            )}
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
                      ))}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun utilisateur trouvé
                </div>
              )}

              {/* Footer de pagination */}
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

                <div className="flex gap-2">
                  {selectedUsers.size > 0 && (
                    <Button size="sm" variant="outline">
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
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}