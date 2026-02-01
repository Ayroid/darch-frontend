/**
 * Types for Architecture JSON Data Management
 * Aligned with Terraform conventions using snake_case naming
 *
 * @version 2.0.0
 * @date December 2025
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
  source_handle?: string;
  target_handle?: string;
  type?: string;
}

export interface ArchitectureNode {
  id: string;
  node_type: 'aws_service' | 'aws_container';
  resource_type: string; // e.g., 'ec2', 'vpc', 's3' (without aws- prefix)
  name: string;
  icon: string;
  position: Position;
  dimensions?: Dimensions;
  configuration: AWSResourceConfiguration;
  parent_id?: string; // For nodes inside containers
}

export interface ArchitectureData {
  metadata: {
    name: string;
    description?: string;
    version: string;
    created_at: string;
    last_modified: string;
    provider: string; // e.g., 'aws', 'azure', 'gcp'
  };
  resources: ArchitectureNode[]; // Keeping 'resources' for consistency
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
  created_at: string;
  last_modified: string;
  provider: string;
}

// Type alias for consistency
export type ArchitectureResource = ArchitectureNode;
