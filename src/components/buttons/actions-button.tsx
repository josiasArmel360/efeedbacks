"use client";

import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  CircleMinus,
  Info,
  CheckCheck,
  CheckCircle2,
  XCircle,
  KeyRound,
  UserCheck,
  AlertTriangle,
  QrCode,
  FileText,
  ArrowBigRightDash,
  Replace,
  ArrowRightLeft,
  ShieldCheck,
  SquareArrowRightExit,
  Stamp,
  ReceiptText,
  Send,
  PackagePlus,
  Eye,
  Ban,
  Wrench,
  FlaskConical,
  ClipboardPen,
  ClipboardList,
  Truck,
  PackageCheck,
  Package,
  RotateCcw,
  Link,
  Wallet,
  X,
  Copy,
  ScanBarcode,
  CreditCard,
  TestTube2,
  Lock,
  UserPlus,
  Printer,
  Download,
  FileSignature,
  FileCheck,
  Images,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UNAUTHORIZED_MESSAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ActionIcon =
  | "Pencil"
  | "Trash2"
  | "CircleMinus"
  | "Info"
  | "CheckCheck"
  | "CheckCircle2"
  | "XCircle"
  | "KeyRound"
  | "UserCheck"
  | "AlertTriangle"
  | "QrCode"
  | "FileText"
  | "ArrowBigRightDash"
  | "Replace"
  | "ArrowRightLeft"
  | "ShieldCheck"
  | "SquareArrowRightExit"
  | "Stamp"
  | "ReceiptText"
  | "Send"
  | "Eye"
  | "Ban"
  | "Wrench"
  | "FlaskConical"
  | "ClipboardPen"
  | "ClipboardList"
  | "Truck"
  | "PackageCheck"
  | "Package"
  | "PackagePlus"
  | "RotateCcw"
  | "Link"
  | "Wallet"
  | "Copy"
  | "ScanBarcode"
  | "X"
  | "CreditCard"
  | "TestTube2"
  | "UserPlus"
  | "Lock"
  | "Printer"
  | "Download"
  | "FileSignature"
  | "FileCheck"
  | "Images";

const ICON_MAP: Record<ActionIcon, React.ReactNode> = {
  Images: <Images className="h-4 w-4" />,
  Lock: <Lock className="h-4 w-4" />,
  Printer: <Printer className="h-4 w-4" />,
  Download: <Download className="h-4 w-4" />,
  FileSignature: <FileSignature className="h-4 w-4" />,
  FileCheck: <FileCheck className="h-4 w-4" />,
  UserPlus: <UserPlus className="h-4 w-4" />,
  TestTube2: <TestTube2 className="h-4 w-4" />,
  CreditCard: <CreditCard className="h-4 w-4" />,
  Pencil: <Pencil className="h-4 w-4" />,
  Trash2: <Trash2 className="h-4 w-4" />,
  CircleMinus: <CircleMinus className="h-4 w-4" />,
  Info: <Info className="h-4 w-4" />,
  CheckCheck: <CheckCheck className="h-4 w-4" />,
  CheckCircle2: <CheckCircle2 className="h-4 w-4" />,
  XCircle: <XCircle className="h-4 w-4" />,
  KeyRound: <KeyRound className="h-4 w-4" />,
  UserCheck: <UserCheck className="h-4 w-4" />,
  AlertTriangle: <AlertTriangle className="h-4 w-4" />,
  QrCode: <QrCode className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  ArrowBigRightDash: <ArrowBigRightDash className="h-4 w-4" />,
  Replace: <Replace className="h-4 w-4" />,
  ArrowRightLeft: <ArrowRightLeft className="h-4 w-4" />,
  ShieldCheck: <ShieldCheck className="h-4 w-4" />,
  SquareArrowRightExit: <SquareArrowRightExit className="h-4 w-4" />,
  Stamp: <Stamp className="h-4 w-4" />,
  ReceiptText: <ReceiptText className="h-4 w-4" />,
  Send: <Send className="h-4 w-4" />,
  Eye: <Eye className="h-4 w-4" />,
  Ban: <Ban className="h-4 w-4" />,
  Wrench: <Wrench className="h-4 w-4" />,
  FlaskConical: <FlaskConical className="h-4 w-4" />,
  ClipboardPen: <ClipboardPen className="h-4 w-4" />,
  ClipboardList: <ClipboardList className="h-4 w-4" />,
  Truck: <Truck className="h-4 w-4" />,
  PackageCheck: <PackageCheck className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  PackagePlus: <PackagePlus className="w-4 h-4" />,
  RotateCcw: <RotateCcw className="w-4 h-4" />,
  Link: <Link className="w-4 h-4" />,
  Wallet: <Wallet className="w-4 h-4" />,
  Copy: <Copy className="w-4 h-4" />,
  X: <X className="w-4 h-4" />,
  ScanBarcode: <ScanBarcode className="w-4 h-4" />,
};

type ActionColor =
  | "blue"
  | "red"
  | "green"
  | "orange"
  | "amber"
  | "purple"
  | "indigo"
  | "emerald"
  | "teal"
  | "cyan"
  | "pink"
  | "destructive"
  | "default";

const COLOR_MAP: Record<ActionColor, string> = {
  blue: "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
  red: "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300",
  green:
    "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300",
  orange:
    "text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300",
  amber:
    "text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300",
  purple:
    "text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300",
  indigo:
    "text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300",
  emerald:
    "text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300",
  teal: "text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300",
  cyan: "text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300",
  pink: "text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300",
  destructive:
    "text-destructive hover:text-destructive/80 dark:text-red-400 dark:hover:text-red-300",
  default: "text-muted-foreground hover:text-foreground",
};

interface ActionsButtonProps {
  hasAccess?: boolean;
  onClick?: () => void;
  icon?: ActionIcon;
  tooltipLabel?: string;
  color?: ActionColor;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "outline" | "default" | "secondary" | "destructive" | "link";
}

export const ActionsButton = ({
  onClick,
  icon,
  hasAccess = true,
  tooltipLabel,
  color = "default",
  label,
  disabled = false,
  size = "sm",
  className,
  variant = "outline",
}: ActionsButtonProps) => {
  const resolvedIcon = icon ? ICON_MAP[icon as ActionIcon] : null;

  const handleClick = () => {
    if (!hasAccess) {
      toast.error(UNAUTHORIZED_MESSAGE);
      return;
    }
    onClick?.();
  };

  const resolvedTooltip = hasAccess ? tooltipLabel : UNAUTHORIZED_MESSAGE;
  const isDisabled = disabled || !hasAccess;

  // 1. On extrait le bouton dans une constante pour éviter la duplication
  const buttonElement = (
    <Button
      type="button"
      variant={variant}
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        COLOR_MAP[color],
        label && "gap-1.5",
        size === "sm" && "h-8 w-8",
        size === "md" && "h-9 w-9",
        size === "lg" && "h-10 w-10",
        className,
      )}
    >
      {resolvedIcon}
      {label && <span>{label}</span>}
    </Button>
  );

  // 2. Si resolvedTooltip est vide/null, on retourne juste le bouton
  if (!resolvedTooltip) {
    return buttonElement;
  }

  // 3. Sinon, on retourne le bouton enveloppé dans le Tooltip
  return (
    <Tooltip>
      <TooltipTrigger render={buttonElement} />
      <TooltipContent>
        <p className="text-[10px] italic">{resolvedTooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};
