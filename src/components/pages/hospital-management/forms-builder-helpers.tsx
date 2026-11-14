import { Badge } from "@/components/badge";
import type { ActorType, SurveyFieldType } from "@/lib/types";
import { ACTOR_OPTIONS } from "./survey-section-form";

export const ACTOR_LABEL_MAP: Record<ActorType, string> = {
  malade: "Patient",
  parent_malade: "Proche",
  personnel_soignant: "Soignant",
  personnel: "Personnel",
};

export const FIELD_TYPE_LABEL_MAP: Record<SurveyFieldType, string> = {
  rating_5: "Étoiles (1-5)",
  text: "Texte court",
  textarea: "Texte long",
  number: "Nombre",
  radio: "Choix unique",
  select: "Liste déroulante",
  date: "Date",
};

export const ACTOR_FILTER_OPTIONS = [
  { value: "all", label: "Tous les profils" },
  ...ACTOR_OPTIONS,
];

export const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "actif", label: "Éléments actifs" },
  { value: "inactif", label: "Éléments masqués" },
];

export const renderStatusBadge = (status: boolean) => {
  const label = status ? "Actif" : "Inactif";
  return status ? (
    <Badge
      variant="outline"
      className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] font-medium"
    >
      {label}
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[11px] font-medium"
    >
      {label}
    </Badge>
  );
};

export const renderActorsBadges = (actors: ActorType[] = []) => (
  <div className="flex flex-wrap gap-1">
    {actors.map((actor) => (
      <Badge
        key={actor}
        variant="secondary"
        className="text-[10px] font-normal px-1.5 py-0"
      >
        {ACTOR_LABEL_MAP[actor] || actor}
      </Badge>
    ))}
  </div>
);
