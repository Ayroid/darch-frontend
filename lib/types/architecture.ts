/**
 * Types for Architecture JSON Data Management
 */

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

// TODO: Replace with AWSResourceConfiguration Type
export interface NodeConfiguration {
  [key: string]: string | number | boolean | string[] | number[] | boolean[] | Record<string, unknown>;
}

export interface NodeConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
}

export interface ArchitectureNode {
  id: string;
  type: 'awsService' | 'awsContainer';
  serviceType: string; // e.g., 'ec2', 'vpc', 's3'
  name: string;
  icon: string;
  position: Position;
  dimensions?: Dimensions;
  configuration: NodeConfiguration;
  isContainer?: boolean;
  parentId?: string; // For nodes inside containers
}

export interface ArchitectureData {
  metadata: {
    name: string;
    description?: string;
    version: string;
    createdAt: string;
    lastModified: string;
    provider: string; // e.g., 'aws', 'azure', 'gcp'
  };
  nodes: ArchitectureNode[];
  connections: NodeConnection[];
  variables?: {
    [key: string]: {
      description: string;
      type: string;
      default?: string | number | boolean;
    };
  };
  outputs?: {
    [key: string]: {
      description: string;
      value: string;
    };
  };
}

export interface ArchitectureMetadata {
  name: string;
  description?: string;
  version: string;
  createdAt: string;
  lastModified: string;
  provider: string;
}
