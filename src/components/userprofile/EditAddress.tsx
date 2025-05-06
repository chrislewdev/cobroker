// src/components/userprofile/EditAddress.tsx

import React, { useState, useEffect } from "react";
import FormField from "@/components/ui_blocks/FormField";
import FormButton from "@/components/ui_blocks/FormButton";
import FormActions from "@/components/ui_blocks/FormActions";
import FormStatus from "@/components/ui_blocks/FormStatus";
import { useForm } from "@/hooks/useForm";

interface EditAddressProps {
  addressData: {
    country: string;
    cityState: string;
    postalCode: string;
    taxId: string;
  };
  onCancel: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  isSuccess?: boolean;
}

export default function EditAddress({
  addressData,
  onCancel,
  onSubmit,
  isLoading = false,
  isError = false,
  errorMessage = "",
  isSuccess = false,
}: EditAddressProps) {
  // Track local form submission to prevent double clicks
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track validation errors
  const [validationFailed, setValidationFailed] = useState(false);
  // Track if form submission was attempted
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Form validation rules
  const validationRules = {
    country: {
      required: "Country is required",
    },
    cityState: {
      required: "City/State is required",
    },
    postalCode: {
      required: "Postal code is required",
      pattern: {
        value: /^[0-9]*$/,
        message: "Postal code must contain only numbers",
      },
    },
    taxId: {
      pattern: {
        value: /^[A-Z0-9\-]*$/i,
        message: "Invalid TAX ID format",
      },
    },
  };

  // Initialize form with useForm hook
  const form = useForm({
    initialValues: {
      country: addressData.country,
      cityState: addressData.cityState,
      postalCode: addressData.postalCode,
      taxId: addressData.taxId,
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

  // Watch form.isSubmitting to reset local isSubmitting state
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
        message: "Address updated successfully.",
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

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Edit Address
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
            label="Country"
            id="country"
            name="country"
            type="text"
            value={form.values.country}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("country")}
            error={form.errors.country}
            touched={form.touched.country}
            required
            disabled={isFormDisabled}
          />

          <FormField
            label="City/State"
            id="cityState"
            name="cityState"
            type="text"
            value={form.values.cityState}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("cityState")}
            error={form.errors.cityState}
            touched={form.touched.cityState}
            required
            disabled={isFormDisabled}
          />

          <FormField
            label="Postal Code"
            id="postalCode"
            name="postalCode"
            type="text"
            value={form.values.postalCode}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("postalCode")}
            error={form.errors.postalCode}
            touched={form.touched.postalCode}
            required
            disabled={isFormDisabled}
          />

          <FormField
            label="TAX ID"
            id="taxId"
            name="taxId"
            type="text"
            value={form.values.taxId}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("taxId")}
            error={form.errors.taxId}
            touched={form.touched.taxId}
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
