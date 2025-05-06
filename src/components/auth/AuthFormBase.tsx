// src/components/auth/AuthFormBase.tsx

// base component for authentication-related forms

"use client";

import React, { ReactNode } from "react";
import { cn } from "@/utils/utils";
import FormStatus from "@/components/ui_blocks/FormStatus";

export interface AuthFormBaseProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  formStatus?: {
    type: "success" | "error" | "info" | "loading";
    message: string;
    title?: string;
  };
  logo?: React.ReactNode;
  logoText?: string;
  footer?: React.ReactNode;
  className?: string;
  formClassName?: string;
  width?: "narrow" | "normal" | "wide";
}

const AuthFormBase: React.FC<AuthFormBaseProps> = ({
  children,
  title,
  subtitle,
  formStatus,
  logo,
  logoText = "Asia Influencer X Talent Deck",
  footer,
  className,
  formClassName,
  width = "normal",
}) => {
  const widthClasses = {
    narrow: "max-w-sm",
    normal: "max-w-md",
    wide: "max-w-lg",
  };

  const defaultLogo = (
    <div className="flex items-center">
      <span className="ml-2 text-xl font-bold">{logoText}</span>
    </div>
  );

  return (
    <div className={cn("w-full", widthClasses[width], className)}>
      {/* Logo */}
      <div className="flex justify-center mb-8">{logo || defaultLogo}</div>

      {/* Form Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </div>

      {/* Form Status (Success/Error messages) */}
      {formStatus && (
        <FormStatus
          type={formStatus.type}
          message={formStatus.message}
          title={formStatus.title}
        />
      )}

      {/* Form Content */}
      <div className={cn(formClassName)}>{children}</div>

      {/* Form Footer */}
      {footer && <div className="text-center mt-6">{footer}</div>}
    </div>
  );
};

export default AuthFormBase;
