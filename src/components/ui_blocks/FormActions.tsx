// src/components/ui_blocks/FormActions.tsx

import React, { ReactNode } from "react";
import { cn } from "@/utils/utils";

export interface FormActionsProps {
  children: ReactNode;
  align?: "left" | "center" | "right" | "between";
  className?: string;
  responsiveStack?: boolean;
  spacing?: "tight" | "normal" | "wide";
}

const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = "right",
  className,
  responsiveStack = true,
  spacing = "normal",
}) => {
  // Define alignment classes
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  // Define spacing classes
  const spacingClasses = {
    tight: "gap-2",
    normal: "gap-4",
    wide: "gap-6",
  };

  return (
    <div
      className={cn(
        "mt-6 pt-6",
        "border-t border-gray-200 dark:border-zinc-700",
        responsiveStack ? "flex flex-col sm:flex-row" : "flex flex-row",
        alignmentClasses[align],
        spacingClasses[spacing],
        responsiveStack && "gap-3 sm:gap-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export default FormActions;
