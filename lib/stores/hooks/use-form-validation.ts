import { useMemo } from 'react';
import { useValidationStore } from '../validation/validation-store';
import { AWSResourceConfiguration } from '@/lib/types/aws-resources';

/**
 * Custom hook for form validation
 * Provides field-level and form-level validation with real-time error reporting
 */
export const useFormValidation = (
  nodeId: string | null,
  serviceId: string,
  config: AWSResourceConfiguration
) => {
  const {
    validationErrors,
    fieldErrors,
    setValidationErrors,
    clearValidationErrors,
    setFieldError,
    clearFieldError,
    validateConfiguration,
    validateField,
  } = useValidationStore();

  // Get validation errors for the current node
  const errors = nodeId ? validationErrors[nodeId] || [] : [];

  const nodeFieldErrors = useMemo(() => {
    return nodeId ? fieldErrors[nodeId] || {} : {};
  }, [nodeId, fieldErrors]);

  // Real-time form validation
  const formErrors = useMemo(() => {
    if (!config || !serviceId) return {};

    const validationResult: Record<string, string> = {};

    // Get all possible field names for this resource type
    const fieldNames = Object.keys(config);

    fieldNames.forEach(fieldName => {
      const value = (config as Record<string, unknown>)[fieldName];
      const error = validateField(serviceId, fieldName, value);
      if (error) {
        validationResult[fieldName] = error;
      }
    });

    return validationResult;
  }, [config, serviceId, validateField]);

  // Combined errors (store + real-time)
  const allFieldErrors = useMemo(() => {
    return { ...nodeFieldErrors, ...formErrors };
  }, [nodeFieldErrors, formErrors]);

  // Validation functions
  const validateForm = () => {
    if (!nodeId || !serviceId || !config) return [];

    const validationResult = validateConfiguration(serviceId, config);

    if (validationResult.length > 0) {
      setValidationErrors(nodeId, validationResult);
    } else {
      clearValidationErrors(nodeId);
    }

    return validationResult;
  };

  const validateSingleField = (fieldName: string, value: unknown) => {
    if (!nodeId || !serviceId) return null;

    const error = validateField(serviceId, fieldName, value);

    if (error) {
      setFieldError(nodeId, fieldName, error);
    } else {
      clearFieldError(nodeId, fieldName);
    }

    return error;
  };

  const hasErrors = errors.length > 0 || Object.keys(allFieldErrors).length > 0;

  return {
    // Error states
    errors,
    fieldErrors: allFieldErrors,
    hasErrors,

    // Validation functions
    validateForm,
    validateField: validateSingleField,

    // Store actions
    setFieldError: (fieldName: string, error: string) => {
      if (nodeId) setFieldError(nodeId, fieldName, error);
    },
    clearFieldError: (fieldName: string) => {
      if (nodeId) clearFieldError(nodeId, fieldName);
    },
    clearAllErrors: () => {
      if (nodeId) {
        clearValidationErrors(nodeId);
        // Clear all field errors for this node
        Object.keys(allFieldErrors).forEach(fieldName => {
          clearFieldError(nodeId, fieldName);
        });
      }
    },
  };
};

/**
 * Hook to get validation state for a specific field
 */
export const useFieldValidation = (
  nodeId: string | null,
  serviceId: string,
  fieldName: string,
  value: unknown
) => {
  const { validateField } = useValidationStore();

  const error = useMemo(() => {
    if (!serviceId || !fieldName) return null;
    return validateField(serviceId, fieldName, value);
  }, [serviceId, fieldName, value, validateField]);

  const hasError = !!error;

  return {
    error,
    hasError,
    isValid: !hasError,
  };
};
