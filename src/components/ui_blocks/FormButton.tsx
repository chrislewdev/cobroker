// src/components/ui_blocks/FormButton.tsx

"use client";

import React, {
  forwardRef,
  ButtonHTMLAttributes,
  ElementType,
  ComponentPropsWithRef,
  ReactElement,
} from "react";
import { cn } from "@/utils/utils";
import Link from "next/link";

// Define props for the FormButton component
export interface FormButtonBaseProps {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  as?: ElementType;
  href?: string; // Add href for Link usage
}

// Extend different HTML element props based on the 'as' prop
export type FormButtonProps<T extends ElementType = "button"> =
  FormButtonBaseProps &
    Omit<ComponentPropsWithRef<T>, keyof FormButtonBaseProps>;

// Default type is button
export type DefaultFormButtonProps = FormButtonProps<"button">;

// Helper to get the appropriate props object based on component type
const getElementProps = (
  variant: string,
  size: string,
  fullWidth: boolean,
  isDisabled: boolean,
  className?: string
) => {
  // Common classnames
  return cn(
    // Base styles
    "font-medium rounded-md focus:outline-none transition-colors",
    // Default styles
    "inline-flex items-center justify-center",
    // Variant styles
    variantStyles[variant as keyof typeof variantStyles],
    // Size styles
    sizeStyles[size as keyof typeof sizeStyles],
    // Width styles
    fullWidth ? "w-full" : "",
    // Disabled styles
    isDisabled && "opacity-70 cursor-not-allowed",
    // Custom className
    className
  );
};

// Variant styles
const variantStyles = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800",
  secondary:
    "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-100",
  outline:
    "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700",
  destructive:
    "bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800",
};

// Size styles
const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

// Loading spinner component
const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4"
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

// Button content component
const ButtonContent = ({
  isLoading,
  loadingText,
  children,
  icon,
  iconPosition,
}: {
  isLoading: boolean;
  loadingText: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}) => {
  if (isLoading) {
    return (
      <>
        <LoadingSpinner />
        {loadingText || children}
      </>
    );
  }

  return (
    <>
      {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </>
  );
};

// The FormButton component
const FormButton = forwardRef<HTMLButtonElement, DefaultFormButtonProps>(
  (
    {
      children,
      isLoading = false,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loadingText = "Loading...",
      icon,
      iconPosition = "left",
      className,
      disabled,
      as,
      href,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const computedClassName = getElementProps(
      variant,
      size,
      fullWidth,
      isDisabled,
      className
    );

    // Handle Next.js Link component
    if (as === Link) {
      return (
        <Link
          href={href || "#"}
          className={computedClassName}
          {...(props as any)}
        >
          <ButtonContent
            isLoading={isLoading}
            loadingText={loadingText}
            icon={icon}
            iconPosition={iconPosition}
          >
            {children}
          </ButtonContent>
        </Link>
      );
    }

    // Handle custom component
    if (as && as !== "button") {
      const Component = as;
      return (
        <Component
          className={computedClassName}
          disabled={isDisabled}
          {...(props as any)}
        >
          <ButtonContent
            isLoading={isLoading}
            loadingText={loadingText}
            icon={icon}
            iconPosition={iconPosition}
          >
            {children}
          </ButtonContent>
        </Component>
      );
    }

    // Default button component
    return (
      <button
        ref={ref}
        type="button"
        className={computedClassName}
        disabled={isDisabled}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <ButtonContent
          isLoading={isLoading}
          loadingText={loadingText}
          icon={icon}
          iconPosition={iconPosition}
        >
          {children}
        </ButtonContent>
      </button>
    );
  }
);

FormButton.displayName = "FormButton";

export default FormButton;
