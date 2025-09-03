/**
 * Hook for managing auto-configuration in forms
 * Provides field disability status and auto-configuration information
 */

import { useMemo } from 'react';
import { useArchitectureStore } from '@/lib/stores/architecture/architecture-store';
import { isFieldDisabled, getAutoConfigurationInfo } from '@/lib/auto-configuration';

export interface UseAutoConfigurationOptions {
  nodeId: string;
  resourceType: string;
}

export interface FieldInfo {
  isDisabled: boolean;
  isAutoConfigured: boolean;
  sourceType?: string;
  sourceName?: string;
}

export function useAutoConfiguration({ nodeId, resourceType }: UseAutoConfigurationOptions) {
  const { convertToReactFlow } = useArchitectureStore();

  // Get field information
  const fieldInfo = useMemo(() => {
    const { nodes } = convertToReactFlow();
    const autoConfigInfo = getAutoConfigurationInfo(nodeId, resourceType, nodes);

    const result: Record<string, FieldInfo> = {};

    // Get all possible fields from auto-configuration rules
    for (const [fieldName, info] of Object.entries(autoConfigInfo)) {
      const disabled = isFieldDisabled(nodeId, fieldName, resourceType, nodes);

      result[fieldName] = {
        isDisabled: disabled,
        isAutoConfigured: info.isAutoConfigured,
        sourceType: info.sourceType,
        sourceName: info.sourceName,
      };
    }

    return result;
  }, [nodeId, resourceType, convertToReactFlow]);

  // Helper function to check if a specific field is disabled
  const isFieldDisabledCheck = (fieldName: string): boolean => {
    return fieldInfo[fieldName]?.isDisabled || false;
  };

  // Helper function to get auto-configuration info for a field
  const getFieldInfo = (fieldName: string): FieldInfo | null => {
    return fieldInfo[fieldName] || null;
  };

  // Helper function to get all disabled fields
  const getDisabledFields = (): string[] => {
    return Object.entries(fieldInfo)
      .filter(([, info]) => info.isDisabled)
      .map(([fieldName]) => fieldName);
  };

  // Helper function to get all auto-configured fields
  const getAutoConfiguredFields = (): string[] => {
    return Object.entries(fieldInfo)
      .filter(([, info]) => info.isAutoConfigured)
      .map(([fieldName]) => fieldName);
  };

  return {
    fieldInfo,
    isFieldDisabled: isFieldDisabledCheck,
    getFieldInfo,
    getDisabledFields,
    getAutoConfiguredFields,
  };
}
