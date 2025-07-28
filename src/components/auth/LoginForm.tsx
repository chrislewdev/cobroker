// src/components/auth/LoginForm.tsx

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthFormBase from "@/components/auth/AuthFormBase";
import useAuthStore from "@/stores/authStore";
import FormField from "@/components/ui_blocks/FormField";
import FormButton from "@/components/ui_blocks/FormButton";
import { useForm, FieldValues } from "@/hooks/useForm";
import { useFormSubmission } from "@/hooks/useFormSubmission";
import { useResetOnUnmount } from "@/hooks/useStateReset";

interface LoginFormValues extends FieldValues {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated, authState, resetState } = useAuthStore();
  const { loading, error } = authState;

  // Reset auth state on component unmount
  useResetOnUnmount(resetState.auth);

  // Form validation rules
  const validationRules = {
    email: {
      required: "Email is required",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email address",
      },
    },
    password: {
      required: "Password is required",
      minLength: {
        value: 6,
        message: "Password must be at least 6 characters",
      },
    },
  };

  // Initialize form with useForm hook
  const form = useForm<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationRules,
  });

  // Handle form submission
  const formSubmission = useFormSubmission<LoginFormValues>({
    onSubmit: async (data) => {
      await login(data.email, data.password);
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/userdashboard");
    }
  }, [isAuthenticated, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only reset if we had a previous error
    if (authState.error) {
      resetState.auth();
    }

    await form.handleSubmit(e);

    // If form is valid, submit it
    if (Object.keys(form.errors).length === 0) {
      await formSubmission.submit(form.values);
    }
  };

  // Determine form status based on error or loading state
  const getFormStatus = () => {
    if (error) {
      return {
        type: "error" as const,
        message: error,
      };
    }

    return undefined;
  };

  return (
    <AuthFormBase
      title="Sign in to your account"
      subtitle="Welcome back! Please enter your details."
      formStatus={getFormStatus()}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={() => form.handleBlur("email")}
          error={form.errors.email}
          touched={form.touched.email}
          required
          disabled={loading || formSubmission.isSubmitting}
        />

        <FormField
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.values.password}
          onChange={form.handleChange}
          onBlur={() => form.handleBlur("password")}
          error={form.errors.password}
          touched={form.touched.password}
          required
          disabled={loading || formSubmission.isSubmitting}
        />

        <FormButton
          type="submit"
          fullWidth
          isLoading={loading || formSubmission.isSubmitting}
          loadingText="Signing in..."
        >
          Sign in to account
        </FormButton>
      </form>
    </AuthFormBase>
  );
};

export default LoginForm;
