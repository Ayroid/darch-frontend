/**
 * React Hook for Architecture Data Management
 * Now powered by the unified Zustand store
 */

import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { ArchitectureData, ArchitectureMetadata } from '@/lib/types/architecture';
import { useArchitectureStore } from '@/lib/stores/architecture/architecture-store';

export interface UseArchitectureDataReturn {
  // Data
  currentData: ArchitectureData | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  createNew: (metadata?: Partial<ArchitectureMetadata>) => void;
  updateFromReactFlow: (nodes: Node[], edges: Edge[]) => void;
  addResource: (node: Node) => string;
  removeResource: (nodeId: string) => void;
  updateResourceConfiguration: (nodeId: string, configuration: Record<string, string | number | boolean | string[] | number[] | boolean[] | Record<string, unknown>>) => void;
  updateResourcePosition: (nodeId: string, position: { x: number; y: number }) => void;
  addConnection: (edge: Edge) => void;
  removeConnection: (connectionId: string) => void;

  // Import/Export
  loadFromJSON: (jsonData: ArchitectureData) => { nodes: Node[], edges: Edge[] };
  exportToJSON: () => ArchitectureData | null;
  importFromFile: (file: File) => Promise<{ nodes: Node[], edges: Edge[] }>;
  exportToFile: (filename?: string) => void;
  saveToFile: (filename?: string) => void;
  loadFromFile: (file: File) => Promise<{ nodes: Node[], edges: Edge[] }>;

  // Utility
  clear: () => void;
  convertToReactFlow: () => { nodes: Node[], edges: Edge[] };
}

export function useArchitectureData(): UseArchitectureDataReturn {
  // Get state and actions from the unified store
  const {
    currentData,
    isLoading,
    hasUnsavedChanges,
    createNew: storeCreateNew,
    clear: storeClear,
    updateFromReactFlow: storeUpdateFromReactFlow,
    addResource: storeAddResource,
    removeResource: storeRemoveResource,
    updateResourceConfiguration: storeUpdateResourceConfiguration,
    updateResourcePosition: storeUpdateResourcePosition,
    addConnection: storeAddConnection,
    removeConnection: storeRemoveConnection,
    loadFromJSON: storeLoadFromJSON,
    exportToJSON: storeExportToJSON,
    importFromFile: storeImportFromFile,
    exportToFile: storeExportToFile,
    saveToFile: storeSaveToFile,
    loadFromFile: storeLoadFromFile,
    convertToReactFlow: storeConvertToReactFlow,
  } = useArchitectureStore();

  // Wrap actions in useCallback for performance
  const createNew = useCallback((metadata?: Partial<ArchitectureMetadata>) => {
    storeCreateNew(metadata);
  }, [storeCreateNew]);

  const updateFromReactFlow = useCallback((nodes: Node[], edges: Edge[]) => {
    storeUpdateFromReactFlow(nodes, edges);
  }, [storeUpdateFromReactFlow]);

  const addResource = useCallback((node: Node): string => {
    return storeAddResource(node);
  }, [storeAddResource]);

  const removeResource = useCallback((nodeId: string) => {
    storeRemoveResource(nodeId);
  }, [storeRemoveResource]);

  const updateResourceConfiguration = useCallback((
    nodeId: string,
    configuration: Record<string, string | number | boolean | string[] | number[] | boolean[] | Record<string, unknown>>
  ) => {
    storeUpdateResourceConfiguration(nodeId, configuration);
  }, [storeUpdateResourceConfiguration]);

  const updateResourcePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    storeUpdateResourcePosition(nodeId, position);
  }, [storeUpdateResourcePosition]);

  const addConnection = useCallback((edge: Edge) => {
    storeAddConnection(edge);
  }, [storeAddConnection]);

  const removeConnection = useCallback((connectionId: string) => {
    storeRemoveConnection(connectionId);
  }, [storeRemoveConnection]);

  const loadFromJSON = useCallback((jsonData: ArchitectureData) => {
    return storeLoadFromJSON(jsonData);
  }, [storeLoadFromJSON]);

  const exportToJSON = useCallback(() => {
    return storeExportToJSON();
  }, [storeExportToJSON]);

  const importFromFile = useCallback(async (file: File) => {
    return storeImportFromFile(file);
  }, [storeImportFromFile]);

  const exportToFile = useCallback((filename?: string) => {
    storeExportToFile(filename);
  }, [storeExportToFile]);

  const saveToFile = useCallback((filename?: string) => {
    storeSaveToFile(filename);
  }, [storeSaveToFile]);

  const loadFromFile = useCallback(async (file: File) => {
    return storeLoadFromFile(file);
  }, [storeLoadFromFile]);

  const clear = useCallback(() => {
    storeClear();
  }, [storeClear]);

  const convertToReactFlow = useCallback(() => {
    return storeConvertToReactFlow();
  }, [storeConvertToReactFlow]);

  return {
    // Data
    currentData,
    isLoading,
    hasUnsavedChanges,

    // Actions
    createNew,
    updateFromReactFlow,
    addResource,
    removeResource,
    updateResourceConfiguration,
    updateResourcePosition,
    addConnection,
    removeConnection,

    // Import/Export
    loadFromJSON,
    exportToJSON,
    importFromFile,
    exportToFile,
    saveToFile,
    loadFromFile,

    // Utility
    clear,
    convertToReactFlow,
  };
}
