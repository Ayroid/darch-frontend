import { useCallback, useMemo } from 'react';
import { useConfigurationStore } from '../configuration/configuration-store';
import { useValidationStore } from '../validation/validation-store';

/**
 * Custom hook for configuration forms to interact with the stores
 */
export const useConfigurationForm = (nodeId: string) => {
  const {
    getNodeConfiguration,
    updateNodeConfiguration,
    setDraftConfiguration,
    clearDraftConfiguration,
  } = useConfigurationStore();

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
  const config = useMemo(() => getNodeConfiguration(nodeId) || {}, [getNodeConfiguration, nodeId]);

  // Get validation errors for the node
  const errors = validationErrors[nodeId] || [];
  const nodeFieldErrors = fieldErrors[nodeId] || {};

  // Update a specific field in the configuration
  const updateField = useCallback((field: string, value: unknown) => {
    updateNodeConfiguration(nodeId, { [field]: value });
  }, [nodeId, updateNodeConfiguration]);

  // Update multiple fields at once
  const updateFields = useCallback((updates: Record<string, unknown>) => {
    updateNodeConfiguration(nodeId, updates);
  }, [nodeId, updateNodeConfiguration]);

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

  // Draft operations
  const setDraft = useCallback((draftConfig: Record<string, unknown>) => {
    setDraftConfiguration(draftConfig);
  }, [setDraftConfiguration]);

  const clearDraft = useCallback(() => {
    clearDraftConfiguration();
  }, [clearDraftConfiguration]);

  return {
    config,
    errors,
    fieldErrors: nodeFieldErrors,
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
