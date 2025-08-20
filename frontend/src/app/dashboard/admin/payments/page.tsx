"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, Eye, ChevronLeft, ChevronRight } from "lucide-react"

// Données d'exemple des paiements
const paymentsData = [
  {
    id: "PAY-001",
    user: "Marie Dubois",
    email: "marie.dubois@email.com",
    amount: 299.99,
    currency: "EUR",
    status: "completed",
    method: "Carte bancaire",
    date: "2024-01-15T10:30:00Z",
    description: "Abonnement Premium - 1 an",
  },
  {
    id: "PAY-002",
    user: "Jean Martin",
    email: "jean.martin@email.com",
    amount: 49.99,
    currency: "EUR",
    status: "pending",
    method: "PayPal",
    date: "2024-01-14T15:45:00Z",
    description: "Achat de crédits",
  },
  {
    id: "PAY-003",
    user: "Sophie Laurent",
    email: "sophie.laurent@email.com",
    amount: 149.99,
    currency: "EUR",
    status: "failed",
    method: "Carte bancaire",
    date: "2024-01-14T09:20:00Z",
    description: "Abonnement Pro - 6 mois",
  },
  {
    id: "PAY-004",
    user: "Pierre Moreau",
    email: "pierre.moreau@email.com",
    amount: 19.99,
    currency: "EUR",
    status: "completed",
    method: "Virement bancaire",
    date: "2024-01-13T14:15:00Z",
    description: "Achat unique",
  },
  {
    id: "PAY-005",
    user: "Emma Rousseau",
    email: "emma.rousseau@email.com",
    amount: 99.99,
    currency: "EUR",
    status: "refunded",
    method: "Carte bancaire",
    date: "2024-01-12T11:30:00Z",
    description: "Abonnement Basic - 1 an",
  },
  {
    id: "PAY-006",
    user: "Lucas Bernard",
    email: "lucas.bernard@email.com",
    amount: 79.99,
    currency: "EUR",
    status: "completed",
    method: "PayPal",
    date: "2024-01-11T16:45:00Z",
    description: "Pack de fonctionnalités",
  },
]

const statusColors = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
}

const statusLabels = {
  completed: "Terminé",
  pending: "En attente",
  failed: "Échoué",
  refunded: "Remboursé",
}

// Composant Skeleton pour les cartes de statistiques
const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
    </CardContent>
  </Card>
)

// Composant Skeleton pour les lignes du tableau
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse"></div></TableCell>
    <TableCell>
      <div className="flex flex-col space-y-2">
        <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
        <div className="h-3 w-40 bg-muted rounded animate-pulse"></div>
      </div>
    </TableCell>
    <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse"></div></TableCell>
    <TableCell><div className="h-6 w-16 bg-muted rounded-full animate-pulse"></div></TableCell>
    <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse"></div></TableCell>
    <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse"></div></TableCell>
    <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse"></div></TableCell>
    <TableCell><div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto"></div></TableCell>
  </TableRow>
)

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Simuler un chargement de données
  useEffect(() => {
    const timer = setTimeout(() => {
      setPayments(paymentsData)
      setIsLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  const filteredPayments = payments.filter((payment: any) => {
    const matchesSearch =
      payment.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const totalAmount = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0)

  // Fonction pour exporter les données
  const handleExport = () => {
    const csvContent = [
      ["ID", "Utilisateur", "Email", "Montant", "Devise", "Statut", "Méthode", "Date", "Description"],
      ...filteredPayments.map(payment => [
        payment.id,
        payment.user,
        payment.email,
        payment.amount,
        payment.currency,
        statusLabels[payment.status],
        payment.method,
        formatDate(payment.date),
        payment.description
      ])
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `paiements_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="rounded-md bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Paiements</h1>
            <p className="text-muted-foreground">Visualisez et gérez tous les paiements de vos utilisateurs</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total des paiements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{payments.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatAmount(totalAmount, "EUR")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paiements réussis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {payments.filter((p) => p.status === "completed").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En attente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {payments.filter((p) => p.status === "pending").length}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Paiements</CardTitle>
            <CardDescription>Gérez et suivez tous les paiements de vos utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, email ou ID..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 w-full md:w-80 border-zinc-800"
                    disabled={isLoading}
                  />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange} disabled={isLoading}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="failed">Échoué</SelectItem>
                    <SelectItem value="refunded">Remboursé</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 par page</SelectItem>
                    <SelectItem value="10">10 par page</SelectItem>
                    <SelectItem value="20">20 par page</SelectItem>
                    <SelectItem value="50">50 par page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!isLoading && (
                <div className="text-sm text-muted-foreground">
                  {filteredPayments.length > 0 ? (
                    <>
                      {startIndex + 1}-{Math.min(endIndex, filteredPayments.length)} sur {filteredPayments.length}{" "}
                      paiement(s)
                    </>
                  ) : (
                    "0 paiement trouvé"
                  )}
                </div>
              )}
            </div>

            {/* Tableau des paiements */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Squelette pendant le chargement
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))
                  ) : paginatedPayments.length > 0 ? (
                    // Données chargées
                    paginatedPayments.map((payment:any) => (
                      <TableRow key={payment.id} className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{payment.user}</span>
                            <span className="text-sm text-muted-foreground">{payment.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{formatAmount(payment.amount, payment.currency)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusColors[payment.status]}
                          >
                            {statusLabels[payment.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell className="text-sm">{formatDate(payment.date)}</TableCell>
                        <TableCell className="max-w-xs truncate" title={payment.description}>{payment.description}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" aria-label={`Voir les détails de ${payment.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // Aucune donnée trouvée
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Aucun paiement trouvé avec les critères de recherche actuels.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {!isLoading && filteredPayments.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber
                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className="w-8 h-8 p-0"
                          aria-label={`Page ${pageNumber}`}
                          aria-current={currentPage === pageNumber ? "page" : undefined}
                        >
                          {pageNumber}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Page suivante"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}