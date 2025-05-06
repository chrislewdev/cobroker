// src/components/ui_blocks/FormField.tsx

"use client";

import React, { forwardRef, InputHTMLAttributes, useState } from "react";
import { cn } from "@/utils/utils";

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  touched?: boolean;
  helper?: string;
  showErrorOnly?: boolean;
  fullWidth?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      touched,
      helper,
      showErrorOnly = false,
      fullWidth = true,
      containerClassName,
      labelClassName,
      inputClassName,
      errorClassName,
      helperClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if not provided
    const [uniqueId] = useState(
      () => id || `field-${Math.random().toString(36).substring(2, 9)}`
    );
    const showError = showErrorOnly ? !!error : touched && !!error;

    return (
      <div
        className={cn("mb-4", fullWidth ? "w-full" : "", containerClassName)}
      >
        {label && (
          <label
            htmlFor={uniqueId}
            className={cn(
              "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
              labelClassName
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <input
          id={uniqueId}
          ref={ref}
          className={cn(
            "w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md",
            "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:opacity-70 disabled:cursor-not-allowed",
            showError ? "border-red-500 dark:border-red-400" : "",
            inputClassName,
            className
          )}
          {...props}
        />

        {showError && (
          <p
            className={cn(
              "mt-1 text-sm text-red-600 dark:text-red-400",
              errorClassName
            )}
          >
            {error}
          </p>
        )}

        {!showError && helper && (
          <p
            className={cn(
              "mt-1 text-sm text-gray-500 dark:text-gray-400",
              helperClassName
            )}
          >
            {helper}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
