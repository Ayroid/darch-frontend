import { useEffect, useCallback } from "react";
import { useArchitectureStore } from "../architecture/architecture-store";
import { useValidationStore } from "../validation/validation-store";
import { AWSResourceConfiguration } from "@/lib/types/aws-resources";
import { filterValidFields } from "../configuration/configuration-utils";

/**
 * Enhanced hook to integrate existing configuration forms with multiple stores
 * Uses the unified ArchitectureStore for configuration management
 */
export const useStoreIntegration = (
	nodeId: string | null,
	serviceId: string,
	config: AWSResourceConfiguration,
	onChange: (config: AWSResourceConfiguration) => void
) => {
	const {
		getResourceConfiguration,
		updateResourceConfiguration,
	} = useArchitectureStore();

	const {
		validateConfiguration,
		setValidationErrors,
		clearValidationErrors,
	} = useValidationStore();

	// Sync configuration changes to store and validate
	const handleConfigChange = useCallback(
		(newConfig: Record<string, unknown>) => {
			if (!nodeId) return;

			// Use serviceId as the resource type since we removed resourceType from configurations
			const resourceType = serviceId;

			// Filter the new configuration to only include valid fields for this resource type
			const filteredConfig = filterValidFields(resourceType, newConfig);

			// Update the store with filtered configuration
			updateResourceConfiguration(nodeId, filteredConfig);

			// Validate and set errors
			const errors = validateConfiguration(serviceId, filteredConfig as AWSResourceConfiguration);
			if (errors.length > 0) {
				setValidationErrors(nodeId, errors);
			} else {
				clearValidationErrors(nodeId);
			}

			// Call the original onChange with the filtered config
			onChange(filteredConfig as AWSResourceConfiguration);
		},
		[
			nodeId,
			serviceId,
			updateResourceConfiguration,
			setValidationErrors,
			clearValidationErrors,
			onChange,
			validateConfiguration,
		]
	);

	// Load from store when node changes
	useEffect(() => {
		if (nodeId) {
			const storedConfig = getResourceConfiguration(nodeId);
			if (storedConfig && Object.keys(storedConfig).length > 0) {
				// Only update if the stored config is different from current
				// Also ensure we're not in an infinite loop by checking if the stored config
				// actually has meaningful data beyond just the resourceType
				const hasConfigurationData = Object.keys(storedConfig).some(
					key => key !== 'resourceType' && storedConfig[key as keyof typeof storedConfig] !== undefined
				);

				if (hasConfigurationData) {
					const configStr = JSON.stringify(config);
					const storedStr = JSON.stringify(storedConfig);
					if (configStr !== storedStr) {
						onChange(storedConfig);
					}
				}
			}
		}
	}, [nodeId, getResourceConfiguration, config, onChange]);

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
		getResourceConfiguration,
		updateResourceConfiguration,
	} = useArchitectureStore();

	const config = nodeId ? getResourceConfiguration(nodeId) : null;

	const updateConfig = useCallback(
		(_serviceId: string, updates: Record<string, unknown>) => {
			if (!nodeId) return;
			updateResourceConfiguration(nodeId, updates);
		},
		[nodeId, updateResourceConfiguration]
	);

	return {
		config,
		updateConfig,
	};
};
