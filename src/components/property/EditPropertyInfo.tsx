// src/components/property/EditPropertyInfo.tsx

import React, { useState, useEffect } from "react";
import FormField from "@/components/ui_blocks/FormField";
import FormButton from "@/components/ui_blocks/FormButton";
import FormActions from "@/components/ui_blocks/FormActions";
import FormStatus from "@/components/ui_blocks/FormStatus";
import { useForm } from "@/hooks/useForm";
import { PropertyListing } from "@/stores/propertyStore";

interface EditPropertyInfoProps {
  propertyData: {
    title: string;
    type: string;
    subtype: string;
    area: string;
    status: "active" | "inactive";
  };
  onCancel: () => void;
  onSubmit: (data: Partial<PropertyListing>) => Promise<void>;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  isSuccess?: boolean;
}

export default function EditPropertyInfo({
  propertyData,
  onCancel,
  onSubmit,
  isLoading = false,
  isError = false,
  errorMessage = "",
  isSuccess = false,
}: EditPropertyInfoProps) {
  // Track local form submission to prevent double clicks
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track validation errors
  const [validationFailed, setValidationFailed] = useState(false);
  // Track if form submission was attempted
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Form validation rules
  const validationRules = {
    title: {
      required: "Property title is required",
      minLength: {
        value: 3,
        message: "Title must be at least 3 characters",
      },
    },
    type: {
      required: "Property type is required",
    },
    subtype: {
      required: "Property subtype is required",
    },
    area: {
      required: "Area is required",
    },
    status: {
      required: "Status is required",
    },
  };

  // Initialize form with useForm hook
  const form = useForm({
    initialValues: {
      title: propertyData.title,
      type: propertyData.type,
      subtype: propertyData.subtype,
      area: propertyData.area,
      status: propertyData.status,
    },
    validationRules,
    onSubmit: async (values) => {
      console.log("Form is valid, submitting data:", values);
      await onSubmit(values);
      console.log("Form submitted successfully");
    },
  });

  // Reset isSubmitting if parent reports success or error
  useEffect(() => {
    if (isSuccess || isError) {
      setIsSubmitting(false);
    }
  }, [isSuccess, isError]);

  // Watch form.isSubmitting to reset our local isSubmitting state
  useEffect(() => {
    if (!form.isSubmitting && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [form.isSubmitting, isSubmitting]);

  // Watch form errors and check if validation failed after submission attempt
  useEffect(() => {
    if (submitAttempted) {
      const hasErrors = Object.keys(form.errors).length > 0;
      setValidationFailed(hasErrors);

      // If no errors, reset submitAttempted
      if (!hasErrors) {
        setSubmitAttempted(false);
      }
    }
  }, [form.errors, submitAttempted]);

  // Determine form status based on error or success
  const getFormStatus = () => {
    if (isError) {
      return {
        type: "error" as const,
        message: errorMessage,
      };
    }

    if (validationFailed) {
      return {
        type: "error" as const,
        message: "Please fix the errors before submitting the form.",
      };
    }

    if (isSuccess) {
      return {
        type: "success" as const,
        message: "Property updated successfully.",
      };
    }

    // Show no status if no condition met
    return undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submit triggered");

    // Prevent double submission
    if (isSubmitting || isLoading || form.isSubmitting) {
      console.log("Submission already in progress, skipping");
      return;
    }

    // Mark that user attempted to submit
    setSubmitAttempted(true);

    // Set local isSubmitting state
    setIsSubmitting(true);

    // Call form's handleSubmit
    form.handleSubmit(e);
  };

  // Check if the form should be disabled
  const isFormDisabled =
    isLoading || isSubmitting || form.isSubmitting || isSuccess;

  // Property type options
  const typeOptions = [
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
    { value: "Industrial", label: "Industrial" },
  ];

  // Property subtype options
  const subtypeOptions = [
    { value: "Apartment/Flat", label: "Apartment/Flat" },
    { value: "Condominium", label: "Condominium" },
    { value: "Terraced House", label: "Terraced House" },
    { value: "Semi-Detached House", label: "Semi-Detached House" },
    { value: "Detached House", label: "Detached House" },
    { value: "Townhouse", label: "Townhouse" },
  ];

  // Status options
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Edit Basic Information
      </h2>

      {getFormStatus() && (
        <FormStatus
          type={getFormStatus()!.type}
          message={getFormStatus()!.message}
          className="mb-6"
        />
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormField
              label="Property Title"
              id="title"
              name="title"
              type="text"
              value={form.values.title}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur("title")}
              error={form.errors.title}
              touched={form.touched.title}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Property Type <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="type"
              value={form.values.type}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur("type")}
              disabled={isFormDisabled}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <option value="">Select type...</option>
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {form.touched.type && form.errors.type && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.errors.type}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Property Subtype <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="subtype"
              value={form.values.subtype}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur("subtype")}
              disabled={isFormDisabled}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <option value="">Select subtype...</option>
              {subtypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {form.touched.subtype && form.errors.subtype && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.errors.subtype}
              </p>
            )}
          </div>

          <FormField
            label="Area"
            id="area"
            name="area"
            type="text"
            value={form.values.area}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("area")}
            error={form.errors.area}
            touched={form.touched.area}
            required
            disabled={isFormDisabled}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="status"
              value={form.values.status}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur("status")}
              disabled={isFormDisabled}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {form.touched.status && form.errors.status && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.errors.status}
              </p>
            )}
          </div>
        </div>

        <FormActions>
          <FormButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isFormDisabled}
          >
            Cancel
          </FormButton>
          <FormButton
            type="submit"
            isLoading={isLoading || isSubmitting || form.isSubmitting}
            loadingText="Saving..."
            disabled={isFormDisabled}
          >
            Save Changes
          </FormButton>
        </FormActions>
      </form>
    </div>
  );
}
