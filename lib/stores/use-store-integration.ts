import { useEffect, useCallback } from 'react';
import { useConfigurationStore, validateConfiguration } from './configuration-store';

/**
 * Simple hook to integrate existing configuration forms with Zustand store
 * This allows gradual migration without major form rewrites
 */
export const useStoreIntegration = (
  nodeId: string | null,
  serviceId: string,
  config: Record<string, unknown>,
  onChange: (config: Record<string, unknown>) => void
) => {
  const {
    getNodeConfiguration,
    updateNodeConfiguration,
    setValidationErrors,
    clearValidationErrors,
  } = useConfigurationStore();

  // Sync configuration changes to store and validate
  const handleConfigChange = useCallback((newConfig: Record<string, unknown>) => {
    if (!nodeId) return;

    // Update the store
    updateNodeConfiguration(nodeId, newConfig);

    // Validate and set errors
    const errors = validateConfiguration(serviceId, newConfig);
    if (errors.length > 0) {
      setValidationErrors(nodeId, errors);
    } else {
      clearValidationErrors(nodeId);
    }

    // Call the original onChange
    onChange(newConfig);
  }, [nodeId, serviceId, updateNodeConfiguration, setValidationErrors, clearValidationErrors, onChange]);

  // Load from store when node changes
  useEffect(() => {
    if (nodeId) {
      const storedConfig = getNodeConfiguration(nodeId);
      if (storedConfig && Object.keys(storedConfig).length > 0) {
        // Only update if the stored config is different from current
        const configStr = JSON.stringify(config);
        const storedStr = JSON.stringify(storedConfig);
        if (configStr !== storedStr) {
          onChange(storedConfig as Record<string, unknown>);
        }
      }
    }
  }, [nodeId, getNodeConfiguration, config, onChange]);

  return {
    handleConfigChange,
  };
};

/**
 * Hook to create a store-aware version of updateConfig
 */
export const useStoreAwareConfig = (
  nodeId: string | null,
  serviceId: string,
  config: Record<string, unknown>,
  onChange: (config: Record<string, unknown>) => void
) => {
  const { handleConfigChange } = useStoreIntegration(nodeId, serviceId, config, onChange);

  const updateConfig = useCallback((key: string, value: unknown) => {
    const newConfig = { ...config, [key]: value };
    handleConfigChange(newConfig);
  }, [config, handleConfigChange]);

  return updateConfig;
};
