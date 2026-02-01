import { useCallback, useMemo, useState } from 'react';
import { useArchitectureStore } from '../architecture/architecture-store';
import { useValidationStore } from '../validation/validation-store';

/**
 * Custom hook for configuration forms to interact with the stores
 * Uses the unified ArchitectureStore for configuration management
 */
export const useConfigurationForm = (nodeId: string) => {
  const {
    getResourceConfiguration,
    updateResourceConfiguration,
  } = useArchitectureStore();

  // Draft configuration is now managed locally instead of in a separate store
  const [draftConfiguration, setDraftConfigurationState] = useState<Record<string, unknown> | null>(null);

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

  // Get current configuration for the node
  const config = useMemo(() => getResourceConfiguration(nodeId) || {}, [getResourceConfiguration, nodeId]);

  // Get validation errors for the node
  const errors = validationErrors[nodeId] || [];
  const nodeFieldErrors = fieldErrors[nodeId] || {};

  // Update a specific field in the configuration
  const updateField = useCallback((field: string, value: unknown) => {
    updateResourceConfiguration(nodeId, { [field]: value });
  }, [nodeId, updateResourceConfiguration]);

  // Update multiple fields at once
  const updateFields = useCallback((updates: Record<string, unknown>) => {
    updateResourceConfiguration(nodeId, updates);
  }, [nodeId, updateResourceConfiguration]);

  // Set validation errors for specific fields
  const setFieldValidationError = useCallback((field: string, error: string) => {
    setFieldError(nodeId, field, error);
  }, [nodeId, setFieldError]);

  // Clear validation errors for specific fields
  const clearFieldValidationError = useCallback((field: string) => {
    clearFieldError(nodeId, field);
  }, [nodeId, clearFieldError]);

  // Validate the entire configuration
  const validateConfig = useCallback((serviceId: string) => {
    const errors = validateConfiguration(serviceId, config);
    if (errors.length > 0) {
      setValidationErrors(nodeId, errors);
    } else {
      clearValidationErrors(nodeId);
    }
    return errors;
  }, [nodeId, config, validateConfiguration, setValidationErrors, clearValidationErrors]);

  // Validate a single field
  const validateSingleField = useCallback((serviceId: string, field: string, value: unknown) => {
    const error = validateField(serviceId, field, value);
    if (error) {
      setFieldError(nodeId, field, error);
    } else {
      clearFieldError(nodeId, field);
    }
    return error;
  }, [nodeId, validateField, setFieldError, clearFieldError]);

  // Draft operations (now managed locally)
  const setDraft = useCallback((draftConfig: Record<string, unknown>) => {
    setDraftConfigurationState(draftConfig);
  }, []);

  const clearDraft = useCallback(() => {
    setDraftConfigurationState(null);
  }, []);

  return {
    config,
    errors,
    fieldErrors: nodeFieldErrors,
    draftConfiguration,
    updateField,
    updateFields,
    setFieldValidationError,
    clearFieldValidationError,
    validateConfig,
    validateSingleField,
    setDraft,
    clearDraft,
  };
};
