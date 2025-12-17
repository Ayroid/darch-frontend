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

export interface ResourceConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
}

export interface ArchitectureResource {
  id: string;
  nodeType: 'awsService' | 'awsContainer';
  resourceType: string; // e.g., 'aws-ec2', 'aws-vpc', 'aws-s3'
  name: string;
  icon: string;
  position: Position;
  dimensions?: Dimensions;
  configuration: AWSResourceConfiguration;
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
  resources: ArchitectureResource[];
  connections: ResourceConnection[];
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
