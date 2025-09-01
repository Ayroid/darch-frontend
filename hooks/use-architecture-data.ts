/**
 * React Hook for Architecture Data Management
 * Now powered by the unified Zustand store
 */

import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { ArchitectureData, ArchitectureMetadata } from '../lib/types/architecture';
import { useArchitectureStore } from '../lib/stores/architecture/architecture-store';

export interface UseArchitectureDataReturn {
  // Data
  currentData: ArchitectureData | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  createNew: (metadata?: Partial<ArchitectureMetadata>) => void;
  updateFromReactFlow: (nodes: Node[], edges: Edge[]) => void;
  addNode: (node: Node) => string;
  removeNode: (nodeId: string) => void;
  updateNodeConfiguration: (nodeId: string, configuration: Record<string, string | number | boolean | string[] | number[] | boolean[] | Record<string, unknown>>) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
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
    addNode: storeAddNode,
    removeNode: storeRemoveNode,
    updateNodeConfiguration: storeUpdateNodeConfiguration,
    updateNodePosition: storeUpdateNodePosition,
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

  const addNode = useCallback((node: Node): string => {
    return storeAddNode(node);
  }, [storeAddNode]);

  const removeNode = useCallback((nodeId: string) => {
    storeRemoveNode(nodeId);
  }, [storeRemoveNode]);

  const updateNodeConfiguration = useCallback((
    nodeId: string, 
    configuration: Record<string, string | number | boolean | string[] | number[] | boolean[] | Record<string, unknown>>
  ) => {
    storeUpdateNodeConfiguration(nodeId, configuration);
  }, [storeUpdateNodeConfiguration]);

  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    storeUpdateNodePosition(nodeId, position);
  }, [storeUpdateNodePosition]);

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
    addNode,
    removeNode,
    updateNodeConfiguration,
    updateNodePosition,
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
