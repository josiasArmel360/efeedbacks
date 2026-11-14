"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  children: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  contentScrollable?: boolean;
}

export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
  className,
  contentScrollable = true,
}: DialogProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen && details.reason === "outside-press") return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className={cn("p-0 gap-2!", className)}>
        <DialogHeader className="bg-slate-50 dark:bg-slate-900 p-4 rounded-t-md border-b-2 shadow-md pr-13">
          <div className={cn(Icon && "flex items-center gap-2")}>
            {Icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 shrink-0">
                <Icon className="h-6 w-6" />
              </div>
            )}
            <div className="space-y-1">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-sm text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <div
          className={cn(
            "p-4 pt-0.5",
            contentScrollable && "max-h-[82vh] overflow-y-auto scrollbar-hide",
          )}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
