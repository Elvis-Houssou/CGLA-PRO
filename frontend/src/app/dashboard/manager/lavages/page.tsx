"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Users,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  X,
} from "lucide-react"

interface WashCompany {
  id: string
  name: string
  referent: string
  email: string
  phone: string
  address: string
  city: string
  status: "active" | "inactive"
  formulesCount: number
  createdAt: string
}

export default function WashManagementDashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [newCompany, setNewCompany] = useState({
    name: "",
    referent: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  })

  const [washCompanies, setWashCompanies] = useState<WashCompany[]>([
    {
      id: "1",
      name: "AutoLavage Express",
      referent: "Jean Dupont",
      email: "jean.dupont@autolavage-express.fr",
      phone: "01 23 45 67 89",
      address: "15 Rue de la Paix",
      city: "Paris",
      status: "active",
      formulesCount: 5,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Clean Car Pro",
      referent: "Marie Martin",
      email: "marie.martin@cleancar-pro.fr",
      phone: "02 34 56 78 90",
      address: "42 Avenue des Champs",
      city: "Lyon",
      status: "active",
      formulesCount: 8,
      createdAt: "2024-02-20",
    },
    {
      id: "3",
      name: "Lavage Premium",
      referent: "Pierre Durand",
      email: "pierre.durand@lavage-premium.fr",
      phone: "03 45 67 89 01",
      address: "8 Boulevard Saint-Michel",
      city: "Marseille",
      status: "active",
      formulesCount: 3,
      createdAt: "2024-03-10",
    },
    {
      id: "4",
      name: "EcoWash Solutions",
      referent: "Sophie Leblanc",
      email: "sophie.leblanc@ecowash.fr",
      phone: "04 56 78 90 12",
      address: "25 Rue Verte",
      city: "Toulouse",
      status: "inactive",
      formulesCount: 2,
      createdAt: "2024-01-30",
    },
    {
      id: "5",
      name: "Station Lavage Plus",
      referent: "Michel Rousseau",
      email: "michel.rousseau@station-lavage.fr",
      phone: "05 67 89 01 23",
      address: "12 Place du Marché",
      city: "Nantes",
      status: "active",
      formulesCount: 6,
      createdAt: "2024-02-05",
    },
  ])

  const handleAddCompany = () => {
    if (newCompany.name && newCompany.referent && newCompany.email && newCompany.phone) {
      const company: WashCompany = {
        id: Date.now().toString(),
        name: newCompany.name,
        referent: newCompany.referent,
        email: newCompany.email,
        phone: newCompany.phone,
        address: newCompany.address,
        city: newCompany.city,
        status: "active",
        formulesCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setWashCompanies([...washCompanies, company])
      setNewCompany({ name: "", referent: "", email: "", phone: "", address: "", city: "" })
      setIsAddModalOpen(false)
    }
  }

  const handleDeleteCompany = (companyId: string) => {
    setWashCompanies(washCompanies.filter((company) => company.id !== companyId))
  }

  const handleToggleStatus = (companyId: string) => {
    setWashCompanies(
      washCompanies.map((company) =>
        company.id === companyId
          ? { ...company, status: company.status === "active" ? "inactive" : ("active" as "active" | "inactive") }
          : company,
      ),
    )
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Actif</Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-600 hover:bg-gray-200">Inactif</Badge>
    )
  }

  const filteredCompanies = useMemo(() => {
    return washCompanies.filter((company) => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.referent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || company.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [washCompanies, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const totalCompanies = washCompanies.length
    const activeCompanies = washCompanies.filter((c) => c.status === "active").length
    const totalFormules = washCompanies.reduce((sum, company) => sum + company.formulesCount, 0)
    
    return {
      totalCompanies,
      activeCompanies,
      totalFormules,
      activityRate: Math.round((activeCompanies / totalCompanies) * 100)
    }
  }, [washCompanies])

  const clearSearch = () => setSearchTerm("")

  return (
    <div className=" rounded-md min-h-fit bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <header className="rounded-lg  border-b border-gray-200 bg-white shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Entreprises de Lavage</h1>
              <p className="text-sm text-gray-500">Gestion des entreprises partenaires</p>
            </div>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une entreprise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Ajouter une nouvelle entreprise</DialogTitle>
                <DialogDescription>Enregistrez une nouvelle entreprise de lavage partenaire.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nom de l'entreprise <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                      placeholder="Ex: AutoLavage Express"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="referent">Référent <span className="text-red-500">*</span></Label>
                    <Input
                      id="referent"
                      value={newCompany.referent}
                      onChange={(e) => setNewCompany({ ...newCompany, referent: e.target.value })}
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCompany.email}
                      onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                      placeholder="contact@entreprise.fr"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Téléphone <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      value={newCompany.phone}
                      onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                      placeholder="01 23 45 67 89"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={newCompany.address}
                    onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                    placeholder="15 Rue de la Paix"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={newCompany.city}
                    onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                    placeholder="Paris"
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="w-full sm:w-auto">
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddCompany} 
                  className="bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto"
                  disabled={!newCompany.name || !newCompany.referent || !newCompany.email || !newCompany.phone}
                >
                  Ajouter l'entreprise
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50 p-4">
              <CardTitle className="text-sm font-medium text-blue-800">Total Entreprises</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</div>
              <p className="text-xs text-gray-500 mt-1">{stats.activeCompanies} actives</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50 p-4">
              <CardTitle className="text-sm font-medium text-green-800">Formules Total</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.totalFormules}</div>
              <p className="text-xs text-gray-500 mt-1">Tous partenaires confondus</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-50 p-4">
              <CardTitle className="text-sm font-medium text-purple-800">Taux d'Activité</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.activityRate}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Entreprises actives</p>
            </CardContent>
          </Card>
        </div>

        {/* Companies List */}
        <Card className="bg-white border border-gray-200 shadow-sm h-fit">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Liste des Entreprises de Lavage
                </CardTitle>
                <CardDescription className="mt-1">
                  Gérez vos entreprises partenaires et leurs informations de contact
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Rechercher par nom, référent ou ville..."
                    className="pl-9 pr-9 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button 
                      onClick={clearSearch}
                      className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-1 w-full sm:w-auto">
                      <Filter className="h-4 w-4" />
                      Statut
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[150px]">
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter("all")}
                      className={statusFilter === "all" ? "bg-gray-100" : ""}
                    >
                      Tous
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter("active")}
                      className={statusFilter === "active" ? "bg-gray-100" : ""}
                    >
                      Actifs
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setStatusFilter("inactive")}
                      className={statusFilter === "inactive" ? "bg-gray-100" : ""}
                    >
                      Inactifs
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 p-3">Entreprise</TableHead>
                    <TableHead className="font-semibold text-gray-700 p-3 hidden md:table-cell">Référent</TableHead>
                    <TableHead className="font-semibold text-gray-700 p-3 hidden lg:table-cell">Contact</TableHead>
                    <TableHead className="font-semibold text-gray-700 p-3 hidden lg:table-cell">Localisation</TableHead>
                    <TableHead className="font-semibold text-gray-700 p-3">Formules</TableHead>
                    <TableHead className="font-semibold text-gray-700 p-3">Statut</TableHead>
                    <TableHead className="font-semibold text-gray-700 p-3 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                        {searchTerm || statusFilter !== "all" 
                          ? "Aucune entreprise ne correspond à vos critères de recherche." 
                          : "Aucune entreprise enregistrée."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                        <TableCell className="p-3">
                          <div>
                            <div className="font-medium text-gray-900">{company.name}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-1 md:hidden">
                              <Users className="h-3 w-3 mr-1" />
                              {company.referent}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              Créée le {new Date(company.createdAt).toLocaleDateString("fr-FR")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-3 hidden md:table-cell">
                          <div className="font-medium text-gray-900">{company.referent}</div>
                        </TableCell>
                        <TableCell className="p-3 hidden lg:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600 truncate max-w-[160px]">{company.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{company.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-3 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div className="truncate max-w-[140px]">
                              <div className="text-sm text-gray-600 truncate">{company.address}</div>
                              <div className="text-sm font-medium text-gray-900">{company.city}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-3">
                          <Badge 
                            variant="outline" 
                            className={company.formulesCount > 0 
                              ? "bg-blue-50 text-blue-700 border-blue-200" 
                              : "bg-gray-50 text-gray-600 border-gray-200"
                            }
                          >
                            {company.formulesCount} formules
                          </Badge>
                        </TableCell>
                        <TableCell className="p-3">{getStatusBadge(company.status)}</TableCell>
                        <TableCell className="p-3">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Ouvrir le menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="cursor-pointer text-gray-600">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir les détails
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-gray-600">
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="cursor-pointer text-gray-600" 
                                  onClick={() => handleToggleStatus(company.id)}
                                >
                                  {company.status === "active" ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Désactiver
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Activer
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                  onClick={() => handleDeleteCompany(company.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}