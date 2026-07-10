import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, GraduationCap, UserCheck } from "lucide-react";
import type { FormationPratique } from "../types";

interface StageInfoCardProps {
  formationPratique: FormationPratique | null;
}

export const StageInfoCard = ({ formationPratique }: StageInfoCardProps) => {
  const encadreur = formationPratique?.encadreur_pedagogique;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b">
          <div className="p-1.5 bg-gray-100 rounded-lg">
            <GraduationCap className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Mon stage</h3>
            <p className="text-muted-foreground text-xs">
              {formationPratique?.theme || "Aucune formation pratique trouvée"}
            </p>
          </div>
        </div>

        {encadreur ? (
          <div className="flex items-center gap-2 text-sm">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-muted-foreground">Encadreur pédagogique :</span>
            <span className="font-medium text-foreground">
              {encadreur.user
                ? `${encadreur.user.nom ?? ""} ${encadreur.user.prenoms ?? ""}`.trim()
                : encadreur.sigle_ens}
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Aucun encadreur pédagogique ne vous est encore assigné. La
              sélection d'une date de soutenance sera disponible une fois votre
              encadreur désigné.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
