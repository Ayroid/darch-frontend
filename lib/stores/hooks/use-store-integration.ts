import { useEffect, useCallback } from "react";
import { useConfigurationStore } from "../configuration/configuration-store";
import { useValidationStore } from "../validation/validation-store";
import { AWSResourceConfiguration } from "@/lib/types/aws-resources";

/**
 * Enhanced hook to integrate existing configuration forms with multiple stores
 * This allows gradual migration without major form rewrites
 */
export const useStoreIntegration = (
	nodeId: string | null,
	serviceId: string,
	config: AWSResourceConfiguration,
	onChange: (config: AWSResourceConfiguration) => void
) => {
	const {
		getNodeConfiguration,
		updateNodeConfiguration,
	} = useConfigurationStore();

	const {
		validateConfiguration,
		setValidationErrors,
		clearValidationErrors,
	} = useValidationStore();

	// Sync configuration changes to store and validate
	const handleConfigChange = useCallback(
		(newConfig: Record<string, unknown>) => {
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
			onChange(newConfig as AWSResourceConfiguration);
		},
		[
			nodeId,
			serviceId,
			updateNodeConfiguration,
			setValidationErrors,
			clearValidationErrors,
			onChange,
			validateConfiguration,
		]
	);

	// Load from store when node changes
	useEffect(() => {
		if (nodeId) {
			const storedConfig = getNodeConfiguration(nodeId);
			if (storedConfig && Object.keys(storedConfig).length > 0) {
				// Only update if the stored config is different from current
				const configStr = JSON.stringify(config);
				const storedStr = JSON.stringify(storedConfig);
				if (configStr !== storedStr) {
					onChange(storedConfig);
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
	config: AWSResourceConfiguration,
	onChange: (config: AWSResourceConfiguration) => void
) => {
	const { handleConfigChange } = useStoreIntegration(
		nodeId,
		serviceId,
		config,
		onChange
	);

	const updateConfig = useCallback(
		(key: string, value: unknown) => {
			const newConfig = { ...config, [key]: value };
			handleConfigChange(newConfig);
		},
		[config, handleConfigChange]
	);

	return updateConfig;
};

/**
 * Simplified hook for direct store integration
 * This hook provides direct access to store configuration and update methods
 */
export const useNodeConfig = (nodeId: string | null) => {
	const {
		getNodeConfiguration,
		updateNodeConfiguration,
	} = useConfigurationStore();

	const config = nodeId ? getNodeConfiguration(nodeId) : null;

	const updateConfig = useCallback(
		(serviceId: string, updates: Record<string, unknown>) => {
			if (!nodeId) return;
			updateNodeConfiguration(nodeId, updates);
		},
		[nodeId, updateNodeConfiguration]
	);

	return {
		config,
		updateConfig,
	};
};
