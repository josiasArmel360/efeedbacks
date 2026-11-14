import { Info } from "lucide-react";
import * as React from "react";

export const Notice = ({
  description,
}: {
  description: string | React.ReactNode;
}) => {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
      <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <span>{description}</span>
    </div>
  );
};
