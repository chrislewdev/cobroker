// src/hooks/useFormSubmission.ts

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UseFormSubmissionProps<T> {
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectPath?: string;
  redirectDelay?: number;
}

interface UseFormSubmissionReturn<T> {
  submit: (data: T) => Promise<void>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: Error | null;
  reset: () => void;
}

export function useFormSubmission<T>({
  onSubmit,
  onSuccess,
  onError,
  redirectPath,
  redirectDelay = 2000,
}: UseFormSubmissionProps<T>): UseFormSubmissionReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const submit = useCallback(
    async (data: T) => {
      setIsSubmitting(true);
      setError(null);

      try {
        await onSubmit(data);
        setIsSubmitted(true);

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Handle redirect if path is provided
        if (redirectPath) {
          setTimeout(() => {
            router.push(redirectPath);
          }, redirectDelay);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        // Call error callback if provided
        if (onError) {
          onError(error);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, onSuccess, onError, redirectPath, redirectDelay, router]
  );

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsSubmitted(false);
    setError(null);
  }, []);

  return {
    submit,
    isSubmitting,
    isSubmitted,
    error,
    reset,
  };
}
