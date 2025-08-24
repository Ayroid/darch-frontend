import { useCallback } from 'react';
import { useConfigurationStore } from './configuration-store';

/**
 * Custom hook for configuration forms to interact with the store
 */
export const useConfigurationForm = (nodeId: string) => {
  const {
    getNodeConfiguration,
    updateNodeConfiguration,
    setValidationErrors,
    clearValidationErrors,
    validationErrors,
  } = useConfigurationStore();

  // Get current configuration for the node
  const config = getNodeConfiguration(nodeId) || {};

  // Get validation errors for the node
  const errors = validationErrors[nodeId] || [];

  // Update a specific field in the configuration
  const updateField = useCallback((field: string, value: unknown) => {
    updateNodeConfiguration(nodeId, { [field]: value });
  }, [nodeId, updateNodeConfiguration]);

  // Update multiple fields at once
  const updateFields = useCallback((updates: Record<string, unknown>) => {
    updateNodeConfiguration(nodeId, updates);
  }, [nodeId, updateNodeConfiguration]);

  // Set validation errors for specific fields
  const setFieldErrors = useCallback((fieldErrors: string[]) => {
    setValidationErrors(nodeId, fieldErrors);
  }, [nodeId, setValidationErrors]);

  // Clear all validation errors
  const clearErrors = useCallback(() => {
    clearValidationErrors(nodeId);
  }, [nodeId, clearValidationErrors]);

  return {
    config,
    errors,
    updateField,
    updateFields,
    setFieldErrors,
    clearErrors,
    hasErrors: errors.length > 0,
  };
};

/**
 * Hook for managing form state with validation
 */
export const useFormValidation = <T extends Record<string, unknown>>(
  initialConfig: T,
  validationRules: (config: T) => string[]
) => {
  const validate = useCallback((config: T): string[] => {
    return validationRules(config);
  }, [validationRules]);

  return {
    validate,
  };
};
