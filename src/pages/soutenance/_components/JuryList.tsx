import { Users } from "lucide-react";
import type { JuryMembre } from "../types";

interface JuryListProps {
  membres: JuryMembre[];
}

const enseignantName = (m: JuryMembre) => {
  const u = m.enseignant?.user;
  const full = `${u?.nom ?? ""} ${u?.prenoms ?? ""}`.trim();
  return full || m.enseignant?.sigle_ens || "Enseignant";
};

export const JuryList = ({ membres }: JuryListProps) => {
  if (!membres.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Users className="h-4 w-4 text-gray-500" />
        Membres du jury
      </div>
      <ul className="divide-y rounded-lg border">
        {membres.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
          >
            <span className="font-medium">{enseignantName(m)}</span>
            <span className="text-xs text-muted-foreground">
              {m.role_membre_jury?.description_role_jury ??
                m.role_membre_jury?.code_role_jury}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
