import {
  Building2,
  Hospital,
  LayoutDashboard,
  LucideIcon,
  MessageSquareMore,
  MessageSquareText,
  QrCode,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { RESOURCE as R, type Resource } from "./access.modules";

export interface MenuItem {
  title: string;
  icon?: LucideIcon;
  href: string;
  resources?: Resource[];
  badge?: string | number;
  children?: MenuItem[];
}

export const SIDEBAR_MODULES: MenuItem[] = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    resources: [R.DASHBOARD],
  },
  {
    title: "Avis & Réponses",
    href: "/feedbacks",
    icon: MessageSquareMore,
    resources: [R.FEEDBACK],
  },
  {
    title: "Gestion Hospitalière",
    href: "/hospital-management",
    icon: Hospital,
    resources: [R.HOSPITAL_ROOT],
    children: [
      {
        title: "Services de soins",
        href: "/hospital-management/departments",
        icon: Building2,
        resources: [R.DEPARTMENT],
      },
      {
        title: "QR Codes & Affichage",
        href: "/hospital-management/qr-codes",
        icon: QrCode,
        resources: [R.QR_CODES],
      },
      {
        title: "Questionnaire",
        href: "/hospital-management/forms-builder",
        icon: MessageSquareText,
        resources: [R.FORM_BUILDER],
      },
    ],
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: Settings,
    resources: [R.SETTING_ROOT],
    children: [
      {
        title: "Mon établissement",
        href: "/settings/my-establishment",
        icon: Hospital,
        resources: [R.SETTING],
      },
      {
        title: "Utilisateurs",
        href: "/settings/users",
        icon: Users,
        resources: [R.USER],
      },
      {
        title: "Droits d'accès",
        href: "/settings/access-rights",
        icon: ShieldCheck,
        resources: [R.ACC_RIGHT],
      },
    ],
  },
];
