"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Building,
  TrendingUp,
  Euro,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { Payment } from "@/props";
import PaymentDetails from "@/components/payement/payement-detail-modal";

// Types supplémentaires
interface Commune {
  id: string;
  name: string;
}

interface Quartier {
  id: string;
  name: string;
  communeId: string;
}

// Données d'exemple
const communes: Commune[] = [
  { id: "com-1", name: "Commune A" },
  { id: "com-2", name: "Commune B" },
  { id: "com-3", name: "Commune C" },
];

const quartiers: Quartier[] = [
  { id: "q-1", name: "Quartier Centre", communeId: "com-1" },
  { id: "q-2", name: "Quartier Nord", communeId: "com-1" },
  { id: "q-3", name: "Quartier Sud", communeId: "com-2" },
  { id: "q-4", name: "Quartier Est", communeId: "com-3" },
];

const periodes = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "week", label: "Cette semaine" },
  { value: "last-week", label: "Semaine dernière" },
  { value: "month", label: "Ce mois" },
  { value: "last-month", label: "Mois dernier" },
  { value: "quarter", label: "Ce trimestre" },
  { value: "last-quarter", label: "Trimestre dernier" },
  { value: "semester", label: "Ce semestre" },
  { value: "last-semester", label: "Semestre dernier" },
  { value: "year", label: "Cette année" },
  { value: "last-year", label: "Année dernière" },
  { value: "custom", label: "Période personnalisée" },
];

const frequences = [
  // { value: "all", label: "Toutes les fréquences" },
  { value: "daily", label: "Quotidien" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "biweekly", label: "Bimensuel" },
  { value: "monthly", label: "Mensuel" },
  { value: "quarterly", label: "Trimestriel" },
  { value: "semiannual", label: "Semestriel" },
  { value: "annual", label: "Annuel" },
  { value: "punctual", label: "Ponctuel" },
];

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
    commune: "com-1",
    quartier: "q-1",
    frequence: "annual",
    service: "Lavage complet",
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
    commune: "com-2",
    quartier: "q-3",
    frequence: "punctual",
    service: "Lavage express",
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
    commune: "com-1",
    quartier: "q-2",
    frequence: "semiannual",
    service: "Lavage premium",
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
    commune: "com-3",
    quartier: "q-4",
    frequence: "punctual",
    service: "Nettoyage intérieur",
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
    commune: "com-2",
    quartier: "q-3",
    frequence: "annual",
    service: "Lavage standard",
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
    commune: "com-1",
    quartier: "q-1",
    frequence: "monthly",
    service: "Abonnement mensuel",
  },
  {
    id: "PAY-007",
    user: "Camille Petit",
    email: "camille.petit@email.com",
    amount: 199.99,
    currency: "EUR",
    status: "completed",
    method: "Carte bancaire",
    date: "2024-01-10T08:20:00Z",
    description: "Forfait famille - 3 mois",
    commune: "com-3",
    quartier: "q-4",
    frequence: "quarterly",
    service: "Lavage familial",
  },
];

const statusColors = {
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200",
  failed:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200",
  refunded:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200",
};

const statusIcons = {
  completed: <CheckCircle className="h-3 w-3 mr-1" />,
  pending: <Clock className="h-3 w-3 mr-1" />,
  failed: <AlertCircle className="h-3 w-3 mr-1" />,
  refunded: <RefreshCw className="h-3 w-3 mr-1" />,
};

const statusLabels = {
  completed: "Terminé",
  pending: "En attente",
  failed: "Échoué",
  refunded: "Remboursé",
};

const methodColors = {
  "Carte bancaire":
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200",
  PayPal:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200",
  "Virement bancaire":
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200",
};

const frequenceColors = {
  daily: "bg-indigo-100 text-indigo-800 border-indigo-200",
  weekly: "bg-pink-100 text-pink-800 border-pink-200",
  biweekly: "bg-amber-100 text-amber-800 border-amber-200",
  monthly: "bg-emerald-100 text-emerald-800 border-emerald-200",
  quarterly: "bg-cyan-100 text-cyan-800 border-cyan-200",
  semiannual: "bg-orange-100 text-orange-800 border-orange-200",
  annual: "bg-violet-100 text-violet-800 border-violet-200",
  punctual: "bg-slate-100 text-slate-800 border-slate-200",
};

const frequenceLabels = {
  daily: "Quotidien",
  weekly: "Hebdomadaire",
  biweekly: "Bimensuel",
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  semiannual: "Semestriel",
  annual: "Annuel",
  punctual: "Ponctuel",
};

// Composant Skeleton pour les cartes de statistiques
const StatCardSkeleton = () => (
  <Card className="bg-gradient-to-br from-muted/20 to-muted/50 border-muted/30">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 w-24 bg-muted/50 rounded animate-pulse"></div>
      <div className="h-4 w-4 bg-muted/50 rounded animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 w-16 bg-muted/50 rounded animate-pulse"></div>
      <div className="h-3 w-20 bg-muted/50 rounded animate-pulse mt-2"></div>
    </CardContent>
  </Card>
);

// Composant Skeleton pour les lignes du tableau
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <div className="h-4 w-16 bg-muted/50 rounded animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="flex flex-col space-y-2">
        <div className="h-4 w-32 bg-muted/50 rounded animate-pulse"></div>
        <div className="h-3 w-40 bg-muted/50 rounded animate-pulse"></div>
      </div>
    </TableCell>
    <TableCell>
      <div className="h-4 w-20 bg-muted/50 rounded animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-6 w-16 bg-muted/50 rounded-full animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 w-24 bg-muted/50 rounded animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 w-24 bg-muted/50 rounded animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 w-32 bg-muted/50 rounded animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-8 w-8 bg-muted/50 rounded animate-pulse ml-auto"></div>
    </TableCell>
  </TableRow>
);

export default function PaymentsPage() {
  // Ajouter dans le composant PaymentsPage
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [communeFilter, setCommuneFilter] = useState("all");
  const [quartierFilter, setQuartierFilter] = useState("all");
  const [periodeFilter, setPeriodeFilter] = useState("all");
  const [frequenceFilter, setFrequenceFilter] = useState("all");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Simuler un chargement de données
  useEffect(() => {
    const timer = setTimeout(() => {
      setPayments(paymentsData);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Filtrer les quartiers en fonction de la commune sélectionnée
  const filteredQuartiers =
    communeFilter !== "all"
      ? quartiers.filter((q) => q.communeId === communeFilter)
      : quartiers;

  const filteredPayments: Payment[] = payments.filter((payment: Payment) => {
    const matchesSearch =
      payment.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesCommune =
      communeFilter === "all" || payment.commune === communeFilter;
    const matchesQuartier =
      quartierFilter === "all" || payment.quartier === quartierFilter;
    const matchesFrequence =
      frequenceFilter === "all" || payment.frequence === frequenceFilter;

    // Filtrage par période (simplifié pour l'exemple)
    const matchesPeriode = periodeFilter === "all" || true; // Implémentation réelle nécessiterait des dates

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCommune &&
      matchesQuartier &&
      matchesFrequence &&
      matchesPeriode
    );
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCommuneFilterChange = (value: string) => {
    setCommuneFilter(value);
    setQuartierFilter("all"); // Réinitialiser le filtre quartier
    setCurrentPage(1);
  };

  const handleQuartierFilterChange = (value: string) => {
    setQuartierFilter(value);
    setCurrentPage(1);
  };

  const handlePeriodeFilterChange = (value: string) => {
    setPeriodeFilter(value);
    setCurrentPage(1);
  };

  const handleFrequenceFilterChange = (value: string) => {
    setFrequenceFilter(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const totalAmount = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const completedPayments = payments.filter(
    (p) => p.status === "completed"
  ).length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const successRate =
    payments.length > 0 ? (completedPayments / payments.length) * 100 : 0;

  // Fonction pour exporter les données
  const handleExport = () => {
    const csvContent = [
      [
        "ID",
        "Utilisateur",
        "Email",
        "Montant",
        "Devise",
        "Statut",
        "Méthode",
        "Date",
        "Description",
        "Commune",
        "Quartier",
        "Fréquence",
        "Service",
      ],
      ...filteredPayments.map((payment) => [
        payment.id,
        payment.user,
        payment.email,
        payment.amount,
        payment.currency,
        statusLabels[payment.status as keyof typeof statusLabels],
        payment.method,
        formatDate(payment.date),
        payment.description,
        communes.find((c) => c.id === payment.commune)?.name || "",
        quartiers.find((q) => q.id === payment.quartier)?.name || "",
        frequenceLabels[payment.frequence as keyof typeof frequenceLabels],
        payment.service,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `paiements_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="bg-gradient-to-br rounded-md from-gray-50/50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* En-tête */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestion des Paiements
              </h1>
              <p className="text-muted-foreground mt-1">
                Visualisez et gérez tous les paiements de vos utilisateurs
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-md text-white"
                size="sm"
                onClick={handleExport}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total des paiements
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{payments.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tous les paiements
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-green-50/50 border-green-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Revenus totaux
                    </CardTitle>
                    <Euro className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatAmount(totalAmount, "EUR")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {completedPayments} paiements validés
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-amber-50/50 border-amber-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Taux de réussite
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {successRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pendingPayments} en attente
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-purple-50/50 border-purple-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Moyenne par commande
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {completedPayments > 0
                        ? formatAmount(totalAmount / completedPayments, "EUR")
                        : formatAmount(0, "EUR")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Valeur moyenne
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Filtres et recherche */}
          <Card className="border-muted/30 shadow-sm">
            <CardHeader className="bg-muted/20 pb-4">
              <CardTitle className="flex items-center gap-2">
                <div className="h-5 w-1 bg-blue-500 rounded-full"></div>
                Liste des Paiements
              </CardTitle>
              <CardDescription>
                Gérez et suivez tous les paiements de vos utilisateurs avec des
                filtres avancés
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 w-full border-muted/50 focus:border-blue-300 transition-colors"
                    disabled={isLoading}
                  />
                </div>

                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-muted/50">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Statut" />
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
                  value={communeFilter}
                  onValueChange={handleCommuneFilterChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-muted/50">
                    <Building className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Commune" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les communes</SelectItem>
                    {communes.map((commune) => (
                      <SelectItem key={commune.id} value={commune.id}>
                        {commune.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={quartierFilter}
                  onValueChange={handleQuartierFilterChange}
                  disabled={isLoading || communeFilter === "all"}
                >
                  <SelectTrigger className="border-muted/50">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Quartier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les quartiers</SelectItem>
                    {filteredQuartiers.map((quartier) => (
                      <SelectItem key={quartier.id} value={quartier.id}>
                        {quartier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={periodeFilter}
                  onValueChange={handlePeriodeFilterChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-muted/50">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les périodes</SelectItem>
                    {periodes.map((periode) => (
                      <SelectItem key={periode.value} value={periode.value}>
                        {periode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={frequenceFilter}
                  onValueChange={handleFrequenceFilterChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-muted/50">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Fréquence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les fréquences</SelectItem>
                    {frequences.map((frequence) => (
                      <SelectItem key={frequence.value} value={frequence.value}>
                        {frequence.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-muted/50">
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
                <div className="text-sm text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-md mb-4">
                  {filteredPayments.length > 0 ? (
                    <>
                      {startIndex + 1}-
                      {Math.min(endIndex, filteredPayments.length)} sur{" "}
                      {filteredPayments.length} paiement(s)
                    </>
                  ) : (
                    "0 paiement trouvé"
                  )}
                </div>
              )}

              {/* Tableau des paiements */}
              <div className="rounded-lg border border-muted/30 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow>
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">
                        Utilisateur
                      </TableHead>
                      <TableHead className="font-semibold">Montant</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Méthode</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Fréquence</TableHead>
                      <TableHead className="font-semibold">
                        Localisation
                      </TableHead>
                      <TableHead className="font-semibold">Service</TableHead>
                      <TableHead className="text-right font-semibold">
                        Actions
                      </TableHead>
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
                      paginatedPayments.map((payment: any) => (
                        <TableRow
                          key={payment.id}
                          className="transition-colors hover:bg-muted/20 border-muted/30"
                        >
                          <TableCell className="font-mono text-sm font-medium">
                            {payment.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {payment.user}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {payment.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatAmount(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`flex items-center py-1 px-2.5 rounded-full border ${
                                statusColors[
                                  payment.status as keyof typeof statusColors
                                ]
                              }`}
                            >
                              {
                                statusIcons[
                                  payment.status as keyof typeof statusIcons
                                ]
                              }
                              {
                                statusLabels[
                                  payment.status as keyof typeof statusLabels
                                ]
                              }
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`py-1 px-2.5 rounded-full ${
                                methodColors[
                                  payment.method as keyof typeof methodColors
                                ] || "bg-gray-100 text-gray-800 border-gray-200"
                              }`}
                            >
                              {payment.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(payment.date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`py-1 px-2.5 rounded-full ${
                                frequenceColors[
                                  payment.frequence as keyof typeof frequenceColors
                                ]
                              }`}
                            >
                              {
                                frequenceLabels[
                                  payment.frequence as keyof typeof frequenceLabels
                                ]
                              }
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="flex flex-col">
                              <span>
                                {
                                  communes.find((c) => c.id === payment.commune)
                                    ?.name
                                }
                              </span>
                              <span className="text-xs">
                                {
                                  quartiers.find(
                                    (q) => q.id === payment.quartier
                                  )?.name
                                }
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {payment.service}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
                              aria-label={`Voir les détails de ${payment.id}`}
                              onClick={() => {
                                setSelectedPayment(payment);
                                setDetailOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      // Aucune donnée trouvée
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                            <Search className="h-10 w-10 mb-2 opacity-30" />
                            <p>
                              Aucun paiement trouvé avec les critères de
                              recherche actuels.
                            </p>
                            <p className="text-sm mt-1">
                              Essayez de modifier vos filtres ou votre
                              recherche.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {!isLoading && filteredPayments.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      aria-label="Page précédente"
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNumber}
                              variant={
                                currentPage === pageNumber
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className="w-8 h-8 p-0 flex items-center justify-center"
                              aria-label={`Page ${pageNumber}`}
                              aria-current={
                                currentPage === pageNumber ? "page" : undefined
                              }
                            >
                              {pageNumber}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      aria-label="Page suivante"
                      className="flex items-center gap-1"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <PaymentDetails
      payment={selectedPayment}
      open={detailOpen}
      onOpenChange={setDetailOpen}
      />
    </>
  );
}
