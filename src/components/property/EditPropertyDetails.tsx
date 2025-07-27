// src/components/property/EditPropertyDetails.tsx

import React, { useState, useEffect } from "react";
import FormField from "@/components/ui_blocks/FormField";
import FormButton from "@/components/ui_blocks/FormButton";
import FormActions from "@/components/ui_blocks/FormActions";
import FormStatus from "@/components/ui_blocks/FormStatus";
import { useForm } from "@/hooks/useForm";
import { PropertyListing } from "@/stores/propertyStore";

interface EditPropertyDetailsProps {
  propertyData: {
    bedroom: number;
    bathroom: number;
    carpark: number;
    furnishing: "fully" | "partially" | "unfurnished";
    "built-up": string;
    "rent price": number;
    "sale price": number;
  };
  onCancel: () => void;
  onSubmit: (data: Partial<PropertyListing>) => Promise<void>;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  isSuccess?: boolean;
}

export default function EditPropertyDetails({
  propertyData,
  onCancel,
  onSubmit,
  isLoading = false,
  isError = false,
  errorMessage = "",
  isSuccess = false,
}: EditPropertyDetailsProps) {
  // Track local form submission to prevent double clicks
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track validation errors
  const [validationFailed, setValidationFailed] = useState(false);
  // Track if form submission was attempted
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Form validation rules
  const validationRules = {
    bedroom: {
      required: "Number of bedrooms is required",
      validate: (value: number) => {
        if (value < 1) return "Must have at least 1 bedroom";
        if (value > 10) return "Maximum 10 bedrooms allowed";
        return true;
      },
    },
    bathroom: {
      required: "Number of bathrooms is required",
      validate: (value: number) => {
        if (value < 1) return "Must have at least 1 bathroom";
        if (value > 10) return "Maximum 10 bathrooms allowed";
        return true;
      },
    },
    carpark: {
      required: "Number of car parks is required",
      validate: (value: number) => {
        if (value < 0) return "Car parks cannot be negative";
        if (value > 20) return "Maximum 20 car parks allowed";
        return true;
      },
    },
    furnishing: {
      required: "Furnishing status is required",
    },
    "built-up": {
      required: "Built-up size is required",
      pattern: {
        value: /^\d+$/,
        message: "Built-up size must be a number",
      },
    },
    "rent price": {
      required: "Rent price is required",
      validate: (value: number) => {
        if (value < 0) return "Rent price cannot be negative";
        if (value > 100000) return "Rent price seems too high";
        return true;
      },
    },
    "sale price": {
      required: "Sale price is required",
      validate: (value: number) => {
        if (value < 0) return "Sale price cannot be negative";
        if (value > 10000000) return "Sale price seems too high";
        return true;
      },
    },
  };

  // Initialize form with useForm hook
  const form = useForm({
    initialValues: {
      bedroom: propertyData.bedroom,
      bathroom: propertyData.bathroom,
      carpark: propertyData.carpark,
      furnishing: propertyData.furnishing,
      "built-up": propertyData["built-up"],
      "rent price": propertyData["rent price"],
      "sale price": propertyData["sale price"],
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
        message: "Property details updated successfully.",
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

  // Furnishing options
  const furnishingOptions = [
    { value: "fully", label: "Fully Furnished" },
    { value: "partially", label: "Partially Furnished" },
    { value: "unfurnished", label: "Unfurnished" },
  ];

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Edit Property Details
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
          <FormField
            label="Bedrooms"
            id="bedroom"
            name="bedroom"
            type="number"
            min="1"
            max="10"
            value={form.values.bedroom}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("bedroom")}
            error={form.errors.bedroom}
            touched={form.touched.bedroom}
            required
            disabled={isFormDisabled}
          />

          <FormField
            label="Bathrooms"
            id="bathroom"
            name="bathroom"
            type="number"
            min="1"
            max="10"
            value={form.values.bathroom}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("bathroom")}
            error={form.errors.bathroom}
            touched={form.touched.bathroom}
            required
            disabled={isFormDisabled}
          />

          <FormField
            label="Car Parks"
            id="carpark"
            name="carpark"
            type="number"
            min="0"
            max="20"
            value={form.values.carpark}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("carpark")}
            error={form.errors.carpark}
            touched={form.touched.carpark}
            required
            disabled={isFormDisabled}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Furnishing <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="furnishing"
              value={form.values.furnishing}
              onChange={form.handleChange}
              onBlur={() => form.handleBlur("furnishing")}
              disabled={isFormDisabled}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {furnishingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {form.touched.furnishing && form.errors.furnishing && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.errors.furnishing}
              </p>
            )}
          </div>

          <FormField
            label="Built-up Size (sq ft)"
            id="built-up"
            name="built-up"
            type="text"
            value={form.values["built-up"]}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("built-up")}
            error={form.errors["built-up"]}
            touched={form.touched["built-up"]}
            required
            disabled={isFormDisabled}
            helper="Enter size in square feet (numbers only)"
          />

          <FormField
            label="Rent Price (RM/month)"
            id="rent-price"
            name="rent price"
            type="number"
            min="0"
            step="0.01"
            value={form.values["rent price"]}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("rent price")}
            error={form.errors["rent price"]}
            touched={form.touched["rent price"]}
            required
            disabled={isFormDisabled}
          />

          <FormField
            label="Sale Price (RM)"
            id="sale-price"
            name="sale price"
            type="number"
            min="0"
            step="0.01"
            value={form.values["sale price"]}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("sale price")}
            error={form.errors["sale price"]}
            touched={form.touched["sale price"]}
            required
            disabled={isFormDisabled}
          />
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
