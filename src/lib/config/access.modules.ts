export interface ModuleItem {
  resource: Resource;
  label: string;
  supportsCrud?: boolean;
  children?: ModuleItem[];
}

export const RESOURCE = {
  DASHBOARD: "dashboard",
  FEEDBACK: "feedback",

  HOSPITAL_ROOT: "hospital_root",
  DEPARTMENT: "department",
  QR_CODES: "qr_codes",
  FORM_BUILDER: "form_builder",

  SETTING_ROOT: "setting_root",
  USER: "user",
  ACC_RIGHT: "access_right",
  SETTING: "setting",
} as const;

export type Resource = (typeof RESOURCE)[keyof typeof RESOURCE];

const R = RESOURCE;

export const ACCES_MODULE_ITEMS: ModuleItem[] = [
  {
    resource: R.DASHBOARD,
    label: "Tableau de bord",
    supportsCrud: false,
  },
  {
    resource: R.FEEDBACK,
    label: "Avis & Réponses",
    supportsCrud: true,
  },
  {
    resource: R.HOSPITAL_ROOT,
    label: "Gestion hospitalière",
    children: [
      {
        resource: R.DEPARTMENT,
        label: "Services de soins",
        supportsCrud: true,
      },
      {
        resource: R.QR_CODES,
        label: "QR Codes & Fiches d'affichage",
        supportsCrud: true,
      },
      {
        resource: R.FORM_BUILDER,
        label: "Questionnaire",
        supportsCrud: true,
      },
    ],
  },
  {
    resource: R.SETTING_ROOT,
    label: "Administration & Sécurité",
    children: [
      {
        resource: R.USER,
        label: "Gestion des utilisateurs",
        supportsCrud: true,
      },
      {
        resource: R.ACC_RIGHT,
        label: "Droits d'accès & Rôles",
        supportsCrud: true,
      },
      {
        resource: R.SETTING,
        label: "Configuration de l'établissement",
        supportsCrud: true,
      },
    ],
  },
];
