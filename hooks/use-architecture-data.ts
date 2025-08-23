/**
 * React Hook for Architecture Data Management
 */

import { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { architectureDataManager } from '../lib/architecture-data-manager';
import { ArchitectureData, ArchitectureMetadata } from '../lib/types/architecture';

export interface UseArchitectureDataReturn {
  // Data
  currentData: ArchitectureData | null;
  isLoading: boolean;

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
  const [currentData, setCurrentData] = useState<ArchitectureData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data manager and subscribe to changes
  useEffect(() => {
    setIsLoading(true);

    // Get initial data
    const data = architectureDataManager.getCurrentData();
    setCurrentData(data);
    setIsLoading(false);

    // Subscribe to changes
    const unsubscribe = architectureDataManager.subscribe((updatedData: ArchitectureData) => {
      setCurrentData(updatedData);
    });

    return unsubscribe;
  }, []);

  // Create new architecture
  const createNew = useCallback((metadata?: Partial<ArchitectureMetadata>) => {
    const newData = architectureDataManager.createNew(metadata);
    setCurrentData(newData);
  }, []);

  // Update from ReactFlow state
  const updateFromReactFlow = useCallback((nodes: Node[], edges: Edge[]) => {
    architectureDataManager.updateFromReactFlow(nodes, edges);
  }, []);

  // Add node
  const addNode = useCallback((node: Node): string => {
    return architectureDataManager.addNode(node);
  }, []);

  // Remove node
  const removeNode = useCallback((nodeId: string) => {
    architectureDataManager.removeNode(nodeId);
  }, []);

  // Update node configuration
  const updateNodeConfiguration = useCallback((nodeId: string, configuration: Record<string, string | number | boolean | string[] | number[] | boolean[] | Record<string, unknown>>) => {
    architectureDataManager.updateNodeConfiguration(nodeId, configuration);
  }, []);

  // Update node position
  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    architectureDataManager.updateNodePosition(nodeId, position);
  }, []);

  // Add connection
  const addConnection = useCallback((edge: Edge) => {
    architectureDataManager.addConnection(edge);
  }, []);

  // Remove connection
  const removeConnection = useCallback((connectionId: string) => {
    architectureDataManager.removeConnection(connectionId);
  }, []);

  // Load from JSON
  const loadFromJSON = useCallback((jsonData: ArchitectureData) => {
    return architectureDataManager.loadFromJSON(jsonData);
  }, []);

  // Export to JSON
  const exportToJSON = useCallback(() => {
    return architectureDataManager.exportToJSON();
  }, []);

  // Import from file
  const importFromFile = useCallback(async (file: File) => {
    return architectureDataManager.importFromFile(file);
  }, []);

  // Export to file
  const exportToFile = useCallback((filename?: string) => {
    architectureDataManager.exportToFile(filename);
  }, []);

  // Save to file (explicit save)
  const saveToFile = useCallback((filename?: string) => {
    architectureDataManager.saveToFile(filename);
  }, []);

  // Load from file (replace current data)
  const loadFromFile = useCallback(async (file: File) => {
    await architectureDataManager.loadFromFile(file);
    // Return the updated data
    if (currentData) {
      const nodes = currentData.nodes.map((node) =>
        architectureDataManager.convertArchNodeToReactFlowNode(node)
      );
      const edges = currentData.connections.map((conn) =>
        architectureDataManager.convertConnectionToReactFlowEdge(conn)
      );
      return { nodes, edges };
    }
    return { nodes: [], edges: [] };
  }, [currentData]);

  // Clear all data
  const clear = useCallback(() => {
    architectureDataManager.clear();
  }, []);

  // Convert current data to ReactFlow format
  const convertToReactFlow = useCallback((): { nodes: Node[], edges: Edge[] } => {
    if (!currentData) {
      return { nodes: [], edges: [] };
    }

    const nodes = currentData.nodes.map((node) =>
      architectureDataManager.convertArchNodeToReactFlowNode(node)
    );

    const edges = currentData.connections.map((conn) =>
      architectureDataManager.convertConnectionToReactFlowEdge(conn)
    );

    return { nodes, edges };
  }, [currentData]);

  return {
    // Data
    currentData,
    isLoading,

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
