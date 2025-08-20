import { ManagerProps } from "@/props";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
// import { formatDate } from "@/lib/utils";

interface ManagerDetailsModalProps {
  manager: ManagerProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManagerDetailsModal({
  manager,
  open,
  onOpenChange,
}: ManagerDetailsModalProps) {
  if (!manager) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-6 w-6 text-blue-600" />
            Détails du Manager
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Colonne de gauche - Profil */}
          <div className="md:col-span-1 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="items-center">
                <Avatar className="h-24 w-24 border-2 border-blue-100">
                  <AvatarImage
                    src={manager.manager || "/placeholder.svg"}
                    alt={`${manager.manager.firstname} ${manager.manager.lastname}`}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-2xl font-medium">
                    {manager.manager.firstname?.charAt(0)}
                    {manager.manager.lastname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-center mt-4">
                  {manager.manager.firstname} {manager.manager.lastname}
                </CardTitle>
                <div className="flex justify-center">
                  {manager.manager.is_active ? (
                    <Badge variant="outline" className="gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      Inactif
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{manager.manager.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>
                    {manager.manager.phone || "Non renseigné"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    Créé le
                     {/* {formatDate(manager.manager.createdAt)} */}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Rémunération
                </CardTitle>
                <div className="text-2xl font-bold">
                  {manager.quota?.remuneration?.toLocaleString() || 0} XOF
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>Objectif</span>
                  <span>{manager.quota?.quota || 0}</span>
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
            </Card>
          </div>

          {/* Colonne de droite - Détails */}
          <div className="md:col-span-2 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Utilisateurs ajoutés
                  </div>
                  <div className="text-2xl font-bold">
                    {manager.count_wash_records}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Taux de réalisation
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.min(manager.quota?.quota || 0, 100)}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Dernières activités</CardTitle>
              </CardHeader>
              <CardContent>
                {manager.recent_activities?.length > 0 ? (
                  <div className="space-y-4">
                    {manager.recent_activities.map((activity, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {activity.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium">
                              {activity.action}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(activity.date)}
                          </span>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Aucune activité récente
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline">Voir l'historique complet</Button>
              {/* <Button className="bg-blue-600 hover:bg-blue-700">
                Exporter les données
              </Button> */}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}