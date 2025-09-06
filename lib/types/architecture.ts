/**
 * Types for Architecture JSON Data Management
 */

import { AWSResourceConfiguration } from "./aws-resources";

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
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
  nodeType: 'awsService' | 'awsContainer';
  resourceType: string; // e.g., 'aws-ec2', 'aws-vpc', 'aws-s3'
  name: string;
  icon: string;
  position: Position;
  dimensions?: Dimensions;
  configuration: AWSResourceConfiguration;
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
