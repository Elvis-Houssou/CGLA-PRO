"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Target, 
  Mail, 
  CalendarIcon, 
  TrendingUp,
  X,
  DollarSign,
  Users,
  Clock,
  User,
  Sparkles,
  BarChart3
} from "lucide-react";
import { ManagerProps } from "@/props";
import UserAPI from "@/api/User";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface QuotaData {
  quota: number;
  period_start: string;
  period_end: string;
  remuneration_target: number;
}

interface AssignQuotaModalProps {
  manager: ManagerProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotaAssigned: () => void;
}

export default function AssignQuotaModal({
  manager,
  open,
  onOpenChange,
  onQuotaAssigned,
}: AssignQuotaModalProps) {
  const [quotaData, setQuotaData] = useState<QuotaData>({
    quota: 0,
    period_start: "",
    period_end: "",
    remuneration_target: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Fonction pour obtenir les initiales en toute sécurité
  const getInitials = (firstName: string | null, lastName: string | null) => {
    const firstInitial = firstName ? firstName[0] : '';
    const lastInitial = lastName ? lastName[0] : '';
    return `${firstInitial}${lastInitial}`;
  };

  // Initialiser les données avec celles du manager
  useEffect(() => {
    if (open && manager) {
      const currentQuota = manager.quota?.quota || 0;
      const currentRemuneration = manager.quota?.remuneration || 0;
      
      setQuotaData({
        quota: currentQuota,
        period_start: manager.quota?.period_start || "",
        period_end: manager.quota?.period_end || "",
        remuneration_target: currentRemuneration
      });

      // Convertir les dates string en Date objects pour le calendrier
      if (manager.quota?.period_start) {
        setStartDate(new Date(manager.quota.period_start));
      }
      if (manager.quota?.period_end) {
        setEndDate(new Date(manager.quota.period_end));
      }
    }
  }, [open, manager]);

  // Mettre à jour les dates string quand les Date objects changent
  useEffect(() => {
    if (startDate) {
      setQuotaData(prev => ({
        ...prev,
        period_start: format(startDate, 'yyyy-MM-dd')
      }));
    }
  }, [startDate]);

  useEffect(() => {
    if (endDate) {
      setQuotaData(prev => ({
        ...prev,
        period_end: format(endDate, 'yyyy-MM-dd')
      }));
    }
  }, [endDate]);

  const handleAssignQuota = async () => {
    if (!manager) return;

    // Validation des données
    if (quotaData.quota <= 0) {
      toast.error("Le quota doit être supérieur à 0.");
      return;
    }

    if (!quotaData.period_start || !quotaData.period_end) {
      toast.error("Veuillez sélectionner une date de début et de fin.");
      return;
    }

    if (new Date(quotaData.period_start) >= new Date(quotaData.period_end)) {
      toast.error("La date de fin doit être après la date de début.");
      return;
    }

    if (quotaData.remuneration_target < 0) {
      toast.error("La rémunération cible ne peut pas être négative.");
      return;
    }

    setIsLoading(true);
    try {
      // Préparer les données selon le format attendu par l'API
      const requestData = {
        quota: quotaData.quota,
        period_start: quotaData.period_start,
        period_end: quotaData.period_end,
        remuneration: quotaData.remuneration_target
      };

      const response = await UserAPI.assignQuotaToManager(manager.manager.id, requestData);
      
      if (response.status === 200) {
        toast.success("Quota assigné avec succès.");
        onQuotaAssigned();
        onOpenChange(false);
        
        // Réinitialiser les données
        setQuotaData({
          quota: 0,
          period_start: "",
          period_end: "",
          remuneration_target: 0
        });
        setStartDate(undefined);
        setEndDate(undefined);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la mise à jour du quota.";
      toast.error(errorMessage);
      console.error("Erreur lors de la mise à jour du quota:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuotaChange = (value: number) => {
    setQuotaData(prev => ({ ...prev, quota: value }));
  };

  const handleRemunerationChange = (value: number) => {
    setQuotaData(prev => ({ ...prev, remuneration_target: value }));
  };

  const calculateDailyQuota = () => {
    if (!quotaData.period_start || !quotaData.period_end || quotaData.quota <= 0) {
      return 0;
    }

    const start = new Date(quotaData.period_start);
    const end = new Date(quotaData.period_end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return Math.ceil(quotaData.quota / diffDays);
  };

  const calculateRemunerationPerQuota = () => {
    if (quotaData.quota <= 0 || quotaData.remuneration_target <= 0) {
      return 0;
    }
    return quotaData.remuneration_target / quotaData.quota;
  };

  const getDurationDays = () => {
    if (!quotaData.period_start || !quotaData.period_end) {
      return 0;
    }
    const start = new Date(quotaData.period_start);
    const end = new Date(quotaData.period_end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const isFormValid = () => {
    return (
      quotaData.quota > 0 &&
      quotaData.period_start &&
      quotaData.period_end &&
      new Date(quotaData.period_start) < new Date(quotaData.period_end) &&
      quotaData.remuneration_target >= 0
    );
  };

  const clearDates = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setQuotaData(prev => ({
      ...prev,
      period_start: "",
      period_end: ""
    }));
  };

  if (!manager) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0">
        <div className="relative">
          {/* Header avec dégradé */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-lg">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Target className="h-6 w-6" />
                </div>
                <DialogTitle className="text-2xl font-bold">Assigner un objectif</DialogTitle>
              </div>
              <DialogDescription className="text-blue-100">
                Définissez les objectifs et la période pour {manager.manager.firstname} {manager.manager.lastname}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* Informations du manager */}
            <div className="space-y-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 relative">
                  <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {getInitials(manager.manager.firstname, manager.manager.lastname)}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <Badge variant={manager.manager.is_active ? "default" : "destructive"} className="gap-1 px-2 py-1 text-xs">
                      <div className={`h-2 w-2 rounded-full ${manager.manager.is_active ? "bg-white" : "bg-white"}`} />
                      {manager.manager.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {manager.manager.firstname} {manager.manager.lastname}
                  </h4>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {manager.manager.email}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5 text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700 font-medium">{manager.count_wash_records}</span>
                      <span className="text-blue-600">utilisateurs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ancien quota si existant */}
              {manager.quota && (
                <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200 mt-4">
                  <h5 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Objectif actuel
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-amber-600 text-xs font-medium">Objectif</span>
                      <span className="font-semibold text-amber-800">{manager.quota.quota} utilisateurs</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-amber-600 text-xs font-medium">Rémunération</span>
                      <span className="font-semibold text-amber-800">{manager.quota.remuneration?.toLocaleString() || 0} XOF</span>
                    </div>
                    {manager.quota.period_start && manager.quota.period_end && (
                      <>
                        <div className="flex flex-col">
                          <span className="text-amber-600 text-xs font-medium">Début</span>
                          <span className="text-amber-700">{new Date(manager.quota.period_start).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-amber-600 text-xs font-medium">Fin</span>
                          <span className="text-amber-700">{new Date(manager.quota.period_end).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Formulaire d'assignation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche - Quota et rémunération */}
              <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-5">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Objectifs quantitatifs
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="quota" className="text-sm font-medium text-gray-700">Quota à atteindre *</Label>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {quotaData.quota} utilisateurs
                        </span>
                      </div>
                      <Input
                        id="quota"
                        type="number"
                        min="1"
                        value={quotaData.quota}
                        onChange={(e) => handleQuotaChange(parseInt(e.target.value) || 0)}
                        placeholder="Nombre d'utilisateurs à ajouter"
                        className="w-full py-4 text-center text-lg font-semibold border-gray-300 focus:border-blue-500"
                      />
                      
                      <div className="pt-1">
                        <Slider
                          value={[quotaData.quota]}
                          onValueChange={([value]) => handleQuotaChange(value)}
                          max={1000}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>0</span>
                          <span>500</span>
                          <span>1000</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="remuneration" className="text-sm font-medium text-gray-700">Rémunération cible *</Label>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          {quotaData.remuneration_target.toLocaleString()} XOF
                        </span>
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="remuneration"
                          type="number"
                          min="0"
                          value={quotaData.remuneration_target}
                          onChange={(e) => handleRemunerationChange(parseInt(e.target.value) || 0)}
                          placeholder="Montant total de la rémunération"
                          className="w-full pl-10 py-4 text-lg font-semibold border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Dates */}
              <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                      Période de l'objectif *
                    </h3>
                    {(startDate || endDate) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearDates}
                        className="h-8 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Effacer
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Date de début</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-12 border-gray-300 hover:border-blue-500",
                              !startDate && "text-gray-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                            className="rounded-md border"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Date de fin</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-12 border-gray-300 hover:border-blue-500",
                              !endDate && "text-gray-400"
                            )}
                            disabled={!startDate}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            disabled={(date) => startDate ? date < startDate : false}
                            className="rounded-md border"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Période sélectionnée */}
                  {startDate && endDate && (
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-700 font-medium text-sm">Durée de la période:</span>
                        <span className="text-emerald-600 font-semibold bg-emerald-100 px-2 py-1 rounded-full">
                          {getDurationDays()} jours
                        </span>
                      </div>
                      <div className="text-xs text-emerald-600 mt-2 flex justify-between">
                        <span>Du {format(startDate, "dd/MM/yyyy")}</span>
                        <span>au {format(endDate, "dd/MM/yyyy")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistiques et aperçu */}
            {(quotaData.quota > 0 || quotaData.remuneration_target > 0) && (
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Aperçu des objectifs
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quotaData.quota > 0 && quotaData.period_start && quotaData.period_end && (
                    <div className="text-center p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateDailyQuota()}
                      </div>
                      <div className="text-blue-500 text-sm mt-1 font-medium">
                        utilisateurs/jour
                      </div>
                      <div className="text-gray-400 text-xs mt-2">
                        Moyenne nécessaire
                      </div>
                    </div>
                  )}
                  
                  {quotaData.remuneration_target > 0 && quotaData.quota > 0 && (
                    <div className="text-center p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateRemunerationPerQuota().toFixed(0)} XOF
                      </div>
                      <div className="text-blue-500 text-sm mt-1 font-medium">
                        par utilisateur
                      </div>
                      <div className="text-gray-400 text-xs mt-2">
                        Total: {quotaData.remuneration_target.toLocaleString()} XOF
                      </div>
                    </div>
                  )}
                  
                  {quotaData.period_start && quotaData.period_end && (
                    <div className="text-center p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        {getDurationDays()}
                      </div>
                      <div className="text-blue-500 text-sm mt-1 font-medium">
                        jours total
                      </div>
                      <div className="text-gray-400 text-xs mt-2">
                        Pour compléter l'objectif
                      </div>
                    </div>
                  )}
                </div>

                {/* Résumé */}
                <div className="mt-5 p-4 bg-blue-100/50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    <strong>Résumé:</strong> {manager.manager.firstname} devra ajouter{" "}
                    <strong>{quotaData.quota} utilisateurs</strong> entre le{" "}
                    {startDate ? format(startDate, "dd/MM/yyyy") : "?"} et le{" "}
                    {endDate ? format(endDate, "dd/MM/yyyy") : "?"} pour obtenir{" "}
                    <strong>{quotaData.remuneration_target.toLocaleString()} XOF</strong>.
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t px-6 pb-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-gray-300 hover:bg-gray-50"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAssignQuota}
              disabled={isLoading || !isFormValid()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assignation...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {manager.quota ? "Mettre à jour" : "Assigner"} l'objectif
                </>
              )}
            </Button>
          </DialogFooter>

          <div className="text-xs text-gray-500 text-center pb-4">
            * Champs obligatoires
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}