// New modular store exports
export { useConfigurationStore } from './configuration/configuration-store';
export { getDefaultConfiguration, defaultConfigurations } from './configuration/default-configurations';
export { useUIStore } from './ui/ui-store';
export { useCanvasStore } from './canvas/canvas-store';
export { useValidationStore } from './validation/validation-store';
export type { ValidationRule } from './validation/validation-store';

// New unified architecture store
export { 
	useArchitectureStore,
	useArchitectureData,
	useArchitectureActions,
	useNodeConfiguration 
} from './architecture/architecture-store';

// Enhanced hooks
export { useConfigurationForm } from './hooks/use-configuration-form';
export { useStoreIntegration, useStoreAwareConfig, useNodeConfig } from './hooks/use-store-integration';
export { useFormValidation, useFieldValidation } from './hooks/use-form-validation';

// Context
export { ConfigurationProvider, useConfigurationContext } from './configuration-context';

// Development utilities
export { StoreDebugger } from './debug/store-debugger';
