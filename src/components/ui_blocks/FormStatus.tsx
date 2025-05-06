// src/components/ui_blocks/FormStatus.tsx

import React from "react";
import { cn } from "@/utils/utils";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export type FormStatusType = "success" | "error" | "info" | "loading";

export interface FormStatusProps {
  type: FormStatusType;
  title?: string;
  message: string;
  className?: string;
  icon?: React.ReactNode;
}

const FormStatus: React.FC<FormStatusProps> = ({
  type,
  title,
  message,
  className,
  icon,
}) => {
  // Define status styles
  const statusStyles = {
    success:
      "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    error:
      "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    info: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    loading:
      "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200",
  };

  // Default icons based on type
  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case "success":
        return (
          <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
        );
      case "error":
        return (
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
        );
      case "info":
        return (
          <InformationCircleIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        );
      case "loading":
        return (
          <svg
            className="animate-spin h-5 w-5 text-gray-500 dark:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
    }
  };

  return (
    <div
      className={cn(
        "flex p-4 mb-6 rounded-md border",
        statusStyles[type],
        className
      )}
    >
      <div className="flex-shrink-0 mr-3">{getIcon()}</div>
      <div>
        {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
        <div className="text-sm">{message}</div>
      </div>
    </div>
  );
};

export default FormStatus;
