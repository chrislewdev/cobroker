// src/hooks/useForm.ts

"use client";

import { useState, useCallback, ChangeEvent } from "react";

export type FieldValues = Record<string, any>;
export type FieldErrors<T extends FieldValues = FieldValues> = Partial<
  Record<keyof T, string>
>;

export type ValidationRules<T extends FieldValues = FieldValues> = {
  [K in keyof T]?: {
    required?: boolean | string;
    pattern?: {
      value: RegExp;
      message: string;
    };
    minLength?: {
      value: number;
      message: string;
    };
    maxLength?: {
      value: number;
      message: string;
    };
    validate?: (value: T[K], formValues: T) => string | true;
  };
};

interface UseFormProps<T extends FieldValues = FieldValues> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T extends FieldValues = FieldValues> {
  values: T;
  errors: FieldErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  setFieldValue: (name: keyof T, value: any) => void;
  handleBlur: (name: keyof T) => void;
  handleSubmit: (e: React.FormEvent) => void;
  reset: () => void;
  setErrors: (errors: FieldErrors<T>) => void;
}

export function useForm<T extends FieldValues = FieldValues>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormProps<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: any): string | undefined => {
      const rules = validationRules[name];
      if (!rules) return undefined;

      // Required validation
      if (rules.required) {
        const isEmptyValue =
          value === undefined || value === null || value === "";
        if (isEmptyValue) {
          return typeof rules.required === "string"
            ? rules.required
            : `${String(name)} is required`;
        }
      }

      // Pattern validation
      if (rules.pattern && value) {
        const { value: pattern, message } = rules.pattern;
        if (!pattern.test(value)) {
          return message;
        }
      }

      // Min length validation
      if (rules.minLength && typeof value === "string") {
        const { value: minLength, message } = rules.minLength;
        if (value.length < minLength) {
          return message;
        }
      }

      // Max length validation
      if (rules.maxLength && typeof value === "string") {
        const { value: maxLength, message } = rules.maxLength;
        if (value.length > maxLength) {
          return message;
        }
      }

      // Custom validation
      if (rules.validate) {
        const result = rules.validate(value, values);
        if (result !== true) {
          return result;
        }
      }

      return undefined;
    },
    [validationRules, values]
  );

  const validateForm = useCallback((): FieldErrors<T> => {
    const newErrors: FieldErrors<T> = {};

    Object.keys(values).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    return newErrors;
  }, [validateField, values]);

  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value, type } = e.target;
      const fieldName = name as keyof T;

      // Handle different input types
      let fieldValue: any = value;
      if ((e.target as HTMLInputElement).type === "checkbox") {
        fieldValue = (e.target as HTMLInputElement).checked;
      } else if (type === "number") {
        fieldValue = value === "" ? "" : Number(value);
      }

      setValues((prev) => ({ ...prev, [fieldName]: fieldValue }));

      // Validate field on change
      if (touched[fieldName]) {
        const error = validateField(fieldName, fieldValue);
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error,
        }));
      }
    },
    [touched, validateField]
  );

  const setFieldValue = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Validate field when directly setting value
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name, values[name]);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [validateField, values]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);

      // Validate all fields
      const formErrors = validateForm();
      setErrors(formErrors);

      // If there are errors, don't submit
      if (Object.keys(formErrors).length > 0) {
        return;
      }

      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          // Handle submission error
          console.error("Form submission error:", error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [validateForm, values, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    setFieldValue,
    handleBlur,
    handleSubmit,
    reset,
    setErrors,
  };
}
