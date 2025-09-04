"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Calendar,
  MapPin,
  Building,
  Euro,
  CreditCard,
  User,
  Mail,
  FileText,
  X,
  ArrowLeft,
  Download,
  Printer,
  Send,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Payment } from "@/props";

// Types pour les données
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

const statusColors = {
  completed:
    "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200",
  pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200",
  failed: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200",
  refunded: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200",
};

const statusIcons = {
  completed: <CheckCircle className="h-4 w-4" />,
  pending: <Clock className="h-4 w-4" />,
  failed: <AlertCircle className="h-4 w-4" />,
  refunded: <RefreshCw className="h-4 w-4" />,
};

const statusLabels = {
  completed: "Terminé",
  pending: "En attente",
  failed: "Échoué",
  refunded: "Remboursé",
};

const methodColors = {
  "Carte bancaire": "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200",
  "PayPal": "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200",
  "Virement bancaire": "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200",
};

const methodIcons = {
  "Carte bancaire": <CreditCard className="h-4 w-4" />,
  "PayPal": <ExternalLink className="h-4 w-4" />,
  "Virement bancaire": <Euro className="h-4 w-4" />,
};

const frequenceColors = {
  "daily": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "weekly": "bg-pink-50 text-pink-700 border-pink-200",
  "biweekly": "bg-amber-50 text-amber-700 border-amber-200",
  "monthly": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "quarterly": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "semiannual": "bg-orange-50 text-orange-700 border-orange-200",
  "annual": "bg-violet-50 text-violet-700 border-violet-200",
  "punctual": "bg-slate-50 text-slate-700 border-slate-200",
};

const frequenceLabels = {
  "daily": "Quotidien",
  "weekly": "Hebdomadaire",
  "biweekly": "Bimensuel",
  "monthly": "Mensuel",
  "quarterly": "Trimestriel",
  "semiannual": "Semestriel",
  "annual": "Annuel",
  "punctual": "Ponctuel",
};

interface PaymentDetailsProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
}

export default function PaymentDetails({ payment, open, onOpenChange, onBack }: PaymentDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<"download" | "email" | null>(null);
  
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    if (!payment) return;
    
    setActionType("download");
    setIsLoading(true);
    
    // Simuler la génération d'un reçu
    setTimeout(() => {
      const receiptContent = `
        Reçu de Paiement - ${payment.id}
        ================================
        
        Client: ${payment.user}
        Email: ${payment.email}
        
        Montant: ${formatAmount(payment.amount, payment.currency)}
        Statut: ${statusLabels[payment.status as keyof typeof statusLabels]}
        Méthode: ${payment.method}
        
        Date: ${formatDate(payment.date)}
        Service: ${payment.service}
        Fréquence: ${frequenceLabels[payment.frequence as keyof typeof frequenceLabels]}
        
        Localisation: 
        - Commune: ${communes.find(c => c.id === payment.commune)?.name}
        - Quartier: ${quartiers.find(q => q.id === payment.quartier)?.name}
        
        Description: ${payment.description}
        
        Merci pour votre confiance!
      `;
      
      const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `reçu_${payment.id}.txt`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsLoading(false);
      setActionType(null);
    }, 1000);
  };

  const handleResendEmail = () => {
    if (!payment) return;
    
    setActionType("email");
    setIsLoading(true);
    
    // Simuler l'envoi d'email
    setTimeout(() => {
      alert(`Email de confirmation envoyé à ${payment.email}`);
      setIsLoading(false);
      setActionType(null);
    }, 1500);
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* En-tête avec dégradé */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {onBack && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onBack} 
                    className="h-8 w-8 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <DialogTitle className="text-2xl font-semibold text-white">
                  Détails du Paiement
                </DialogTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onOpenChange(false)} 
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                {/* <X className="h-5 w-5" /> */}
              </Button>
            </div>
            <DialogDescription className="text-blue-100">
              Informations complètes sur le paiement {payment.id}
            </DialogDescription>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Carte de résumé */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Résumé du Paiement
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 py-1.5 px-3 rounded-full border ${statusColors[payment.status as keyof typeof statusColors]}`}
                    >
                      {statusIcons[payment.status as keyof typeof statusIcons]}
                      {statusLabels[payment.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatAmount(payment.amount, payment.currency)}
                    </div>
                    <Badge
                      variant="outline"
                      className={`py-1.5 px-3 rounded-full flex items-center gap-1 ${methodColors[payment.method as keyof typeof methodColors] || "bg-gray-100 text-gray-800 border-gray-200"}`}
                    >
                      {methodIcons[payment.method as keyof typeof methodIcons]}
                      {payment.method}
                    </Badge>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs uppercase tracking-wide font-medium">ID de transaction</div>
                      <div className="font-medium text-base">{payment.id}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs uppercase tracking-wide font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Date et heure
                      </div>
                      <div className="font-medium text-base">{formatDate(payment.date)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs uppercase tracking-wide font-medium">Service</div>
                      <div className="font-medium text-base">{payment.service}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs uppercase tracking-wide font-medium">Fréquence</div>
                      <Badge
                        variant="outline"
                        className={`py-1.5 px-3 rounded-full ${frequenceColors[payment.frequence as keyof typeof frequenceColors]}`}
                      >
                        {frequenceLabels[payment.frequence as keyof typeof frequenceLabels]}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <div className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-2">Description</div>
                    <div className="font-medium text-gray-700 dark:text-gray-300 bg-muted/30 p-3 rounded-lg">{payment.description}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Carte d'informations client */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Informations Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs uppercase tracking-wide font-medium">Nom complet</div>
                      <div className="font-medium text-base">{payment.user}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs uppercase tracking-wide font-medium flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                      <div className="font-medium text-base break-all">{payment.email}</div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <div className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-2 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Localisation
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-muted-foreground text-xs">Commune</div>
                        <div className="font-medium text-base flex items-center gap-1">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {communes.find(c => c.id === payment.commune)?.name}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground text-xs">Quartier</div>
                        <div className="font-medium text-base">{quartiers.find(q => q.id === payment.quartier)?.name}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colonne latérale - Actions */}
            <div className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-muted/30 rounded-t-lg">
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 h-11"
                    onClick={handleDownloadReceipt}
                    disabled={isLoading}
                  >
                    {isLoading && actionType === "download" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Télécharger le reçu
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 h-11"
                    onClick={handlePrint}
                    disabled={isLoading}
                  >
                    <Printer className="h-4 w-4" />
                    Imprimer
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 h-11"
                    onClick={handleResendEmail}
                    disabled={isLoading}
                  >
                    {isLoading && actionType === "email" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Renvoyer l'email
                  </Button>
                </CardContent>
              </Card>

              {/* Carte d'informations supplémentaires */}
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-muted/30 rounded-t-lg">
                  <CardTitle className="text-lg">Informations Techniques</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Devise:</span>
                    <span className="font-medium">{payment.currency}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Identifiant de transaction:</span>
                    <span className="font-medium text-xs">txn_{payment.id.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Dernière mise à jour:</span>
                    <span className="font-medium text-xs">{formatDate(payment.date)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}