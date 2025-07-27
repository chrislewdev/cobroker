// src/components/userprofile/EditPersonalInfo.tsx

import React, { useState, useEffect } from "react";
import FormField from "@/components/ui_blocks/FormField";
import TextAreaField from "@/components/ui_blocks/TextAreaField";
import FormButton from "@/components/ui_blocks/FormButton";
import FormActions from "@/components/ui_blocks/FormActions";
import FormStatus from "@/components/ui_blocks/FormStatus";
import { useForm } from "@/hooks/useForm";
import { User } from "@/stores/authStore";

interface EditPersonalInfoProps {
  profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
  };
  onCancel: () => void;
  onSubmit: (data: Partial<User>) => Promise<void>;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  isSuccess?: boolean;
}

export default function EditPersonalInfo({
  profileData,
  onCancel,
  onSubmit,
  isLoading = false,
  isError = false,
  errorMessage = "",
  isSuccess = false,
}: EditPersonalInfoProps) {
  // Track local form submission to prevent double clicks
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track validation errors
  const [validationFailed, setValidationFailed] = useState(false);
  // Track if form submission was attempted
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Form validation rules
  const validationRules = {
    firstName: {
      required: "First name is required",
    },
    lastName: {
      required: "Last name is required",
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email address",
      },
    },
    phone: {
      pattern: {
        value: /^[0-9+\-\s]*$/,
        message: "Invalid phone number format",
      },
    },
  };

  // Initialize form with useForm hook
  const form = useForm({
    initialValues: {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone,
      bio: profileData.bio,
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
        message: "Profile updated successfully.",
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
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Edit Personal Information
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
            label="First Name"
            id="firstName"
            name="firstName"
            type="text"
            value={form.values.firstName}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("firstName")}
            error={form.errors.firstName}
            touched={form.touched.firstName}
            required
            disabled={isFormDisabled}
          />

          <FormField
            label="Last Name"
            id="lastName"
            name="lastName"
            type="text"
            value={form.values.lastName}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("lastName")}
            error={form.errors.lastName}
            touched={form.touched.lastName}
            required
            disabled={isFormDisabled}
          />

          <FormField
            label="Email address"
            id="email"
            name="email"
            type="email"
            value={form.values.email}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("email")}
            error={form.errors.email}
            touched={form.touched.email}
            required
            disabled={true} // Email is typically not editable
          />

          <FormField
            label="Phone"
            id="phone"
            name="phone"
            type="tel"
            value={form.values.phone}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("phone")}
            error={form.errors.phone}
            touched={form.touched.phone}
            disabled={isFormDisabled}
          />

          <TextAreaField
            label="Bio"
            id="bio"
            name="bio"
            value={form.values.bio}
            onChange={form.handleChange}
            onBlur={() => form.handleBlur("bio")}
            error={form.errors.bio}
            touched={form.touched.bio}
            rows={3}
            className="md:col-span-2"
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
