import * as React from "react";
import { LucideIcon } from "lucide-react";

import {
  Tabs as UITabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: LucideIcon;
  content: React.ReactNode;
}

interface AppTabsProps {
  className?: string;
  defaultValue: string;
  size?: "sm" | "lg";
  tabs: TabItem[];
}

export const Tabs = ({
  className,
  defaultValue,
  size = "lg",
  tabs,
}: AppTabsProps) => {
  if (!tabs?.length) return null;

  return (
    <UITabs
      defaultValue={defaultValue}
      className="w-full"
    >
      <TabsList
        className={cn(
          "mb-2 gap-4",
          size === "sm" ? "h-8" : "h-9",
          className,
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "flex items-center gap-1",
              size === "sm" ? "h-9" : "h-10",
            )}
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </UITabs>
  );
};
