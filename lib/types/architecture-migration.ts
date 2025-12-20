/**
 * Migration utilities for converting between architecture format versions
 * Handles migration from v1 (legacy camelCase) to v2 (snake_case) 
 * 
 * @version 2.0.0
 * @date December 2025
 */

import type { 
  ArchitectureData, 
  ArchitectureNode,
  ResourceConnection 
} from "./architecture";

// =====================================================================
// Legacy V1 Type Definitions (for backward compatibility)
// =====================================================================

interface ArchitectureResourceV1 {
  id: string;
  nodeType: 'awsService' | 'awsContainer';
  resourceType: string; // e.g., 'aws-ec2', 'aws-vpc', 'aws-s3'
  name: string;
  icon: string;
  position: { x: number; y: number };
  dimensions?: { width: number; height: number };
  configuration: Record<string, unknown>;
  parentId?: string;
}

interface ArchitectureDataV1 {
  metadata: {
    name: string;
    description?: string;
    version: string;
    createdAt: string;
    lastModified: string;
    provider: string;
  };
  resources: ArchitectureResourceV1[];
  connections: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    type?: string;
  }>;
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

// =====================================================================
// Format Detection
// =====================================================================

export type ArchitectureFormat = "v1" | "v2" | "unknown";

export function detectArchitectureFormat(data: unknown): ArchitectureFormat {
  if (!data || typeof data !== 'object') {
    return "unknown";
  }

  const obj = data as Record<string, unknown>;

  // Check for explicit format_version field
  if ('format_version' in obj) {
    const version = obj.format_version;
    if (version === "2.0.0") return "v2";
  }

  // Both v1 and v2 use 'resources' field
  if ('resources' in obj) {
    // Check if it has format_version (v2) or not (v1)
    return 'format_version' in obj ? "v2" : "v1";
  }

  // Check nested objects for resource type patterns
  const resources = obj.resources as unknown[] | undefined;
  if (Array.isArray(resources) && resources.length > 0) {
    const firstResource = resources[0] as Record<string, unknown>;
    if (firstResource.resourceType && typeof firstResource.resourceType === 'string') {
      // Check if using old format (aws- prefix)
      if ((firstResource.resourceType as string).startsWith('aws-')) {
        return "v1";
      }
    }
    if (firstResource.resource_type && typeof firstResource.resource_type === 'string') {
      // New format (no aws- prefix)
      return "v2";
    }
  }

  return "unknown";
}

// =====================================================================
// Field Name Conversion Utilities
// =====================================================================

/**
 * Convert camelCase to snake_case
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively convert object keys from camelCase to snake_case
 */
function convertKeysToSnakeCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnakeCase(item));
  }
  
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = camelToSnake(key);
      result[newKey] = convertKeysToSnakeCase(value);
    }
    return result;
  }
  
  return obj;
}

/**
 * Recursively convert object keys from snake_case to camelCase
 */
function convertKeysToCamelCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item));
  }
  
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = snakeToCamel(key);
      result[newKey] = convertKeysToCamelCase(value);
    }
    return result;
  }
  
  return obj;
}

// =====================================================================
// Resource Type Conversion
// =====================================================================

/**
 * Convert old resource type (with aws- prefix) to new resource type
 */
function convertResourceTypeV1ToV2(oldType: string): string {
  // Remove aws- prefix
  const withoutPrefix = oldType.replace(/^aws-/, '');
  
  // Handle special cases
  if (withoutPrefix === 'public-subnet' || withoutPrefix === 'private-subnet') {
    return 'subnet'; // Unified subnet type
  }
  
  return withoutPrefix;
}

/**
 * Convert new resource type to old resource type (with aws- prefix)
 * Requires subnet configuration to determine public/private
 */
function convertResourceTypeV2ToV1(
  newType: string, 
  config?: Record<string, unknown>
): string {
  // Handle special cases
  if (newType === 'subnet') {
    // Determine public/private from configuration
    const subnetType = (config as { subnet_type?: string })?.subnet_type;
    if (subnetType === 'public') {
      return 'aws-public-subnet';
    }
    if (subnetType === 'private') {
      return 'aws-private-subnet';
    }
    return 'aws-subnet'; // Fallback
  }
  
  // Add aws- prefix
  return `aws-${newType}`;
}

// =====================================================================
// Node Type Conversion
// =====================================================================

function convertNodeTypeV1ToV2(oldType: string): 'aws_service' | 'aws_container' {
  if (oldType === 'awsService') return 'aws_service';
  if (oldType === 'awsContainer') return 'aws_container';
  return 'aws_service'; // Default
}

function convertNodeTypeV2ToV1(newType: string): 'awsService' | 'awsContainer' {
  if (newType === 'aws_service') return 'awsService';
  if (newType === 'aws_container') return 'awsContainer';
  return 'awsService'; // Default
}

// =====================================================================
// Configuration Conversion
// =====================================================================

/**
 * Migrate configuration from v1 to v2
 */
function migrateConfigurationV1ToV2(
  v1Config: Record<string, unknown>,
  resourceType: string
): Record<string, unknown> {
  // Start with basic conversion
  let v2Config = convertKeysToSnakeCase(v1Config) as Record<string, unknown>;

  // Remove ID fields (backend generates these)
  const idFieldsToRemove = [
    'aws_vpc_id', 'aws_ec2_id', 'aws_public_subnet_id', 'aws_private_subnet_id',
    'aws_security_group_id', 'aws_internet_gateway_id', 'aws_nat_gateway_id',
    'aws_route_table_id', 'aws_region_id', 'aws_availability_zone_id'
  ];
  
  idFieldsToRemove.forEach(field => {
    delete v2Config[field];
  });

  // Handle subnet type unification
  if (resourceType === 'aws-public-subnet') {
    v2Config.subnet_type = 'public';
  } else if (resourceType === 'aws-private-subnet') {
    v2Config.subnet_type = 'private';
  }

  // Rename region field for regions
  if (resourceType === 'aws-region' && 'region_code' in v2Config) {
    const { region_code, ...rest } = v2Config as Record<string, unknown> & { region_code?: string };
    v2Config = { ...rest, region: region_code };
  }

  // Convert route table arrays to objects
  if (resourceType === 'aws-route-table') {
    if (Array.isArray(v2Config.routes)) {
      const routesObj: Record<string, unknown> = {};
      (v2Config.routes as unknown[]).forEach((route, index) => {
        routesObj[`route_${index}`] = route;
      });
      v2Config.routes = routesObj;
    }
    
    if (Array.isArray(v2Config.associations)) {
      const assocObj: Record<string, unknown> = {};
      (v2Config.associations as unknown[]).forEach((assoc, index) => {
        assocObj[`association_${index}`] = assoc;
      });
      v2Config.associations = assocObj;
    }
  }

  // Always ensure tags include ResourceId (will be set by caller)
  if (!v2Config.tags || typeof v2Config.tags !== 'object') {
    v2Config.tags = {};
  }

  return v2Config;
}

/**
 * Migrate configuration from v2 to v1 (for backward compatibility)
 */
function migrateConfigurationV2ToV1(
  v2Config: Record<string, unknown>,
  resourceType: string,
  resourceId: string
): Record<string, unknown> {
  // Start with basic conversion
  let v1Config = convertKeysToCamelCase(v2Config) as Record<string, unknown>;

  // Add ID fields based on resource type
  if (resourceType === 'vpc') {
    v1Config.awsVpcId = resourceId;
  } else if (resourceType === 'ec2') {
    v1Config.awsEc2Id = resourceId;
  } else if (resourceType === 'subnet') {
    const subnetType = (v2Config as { subnet_type?: string }).subnet_type;
    if (subnetType === 'public') {
      v1Config.awsPublicSubnetId = resourceId;
    } else {
      v1Config.awsPrivateSubnetId = resourceId;
    }
  } else if (resourceType === 'security-group') {
    v1Config.awsSecurityGroupId = resourceId;
  } else if (resourceType === 'internet-gateway') {
    v1Config.awsInternetGatewayId = resourceId;
  } else if (resourceType === 'nat-gateway') {
    v1Config.awsNatGatewayId = resourceId;
  } else if (resourceType === 'route-table') {
    v1Config.awsRouteTableId = resourceId;
  } else if (resourceType === 'region') {
    v1Config.awsRegionId = resourceId;
  } else if (resourceType === 'availability-zone') {
    v1Config.awsAvailabilityZoneId = resourceId;
  }

  // Convert route table objects back to arrays
  if (resourceType === 'route-table') {
    if (v1Config.routes && typeof v1Config.routes === 'object' && !Array.isArray(v1Config.routes)) {
      v1Config.routes = Object.values(v1Config.routes as Record<string, unknown>);
    }
    
    if (v1Config.associations && typeof v1Config.associations === 'object' && !Array.isArray(v1Config.associations)) {
      v1Config.associations = Object.values(v1Config.associations as Record<string, unknown>);
    }
  }

  return v1Config;
}

// =====================================================================
// Resource/Node Conversion
// =====================================================================

/**
 * Migrate resource from v1 to v2 (resource → node)
 */
function migrateResourceV1ToV2(v1Resource: ArchitectureResourceV1): ArchitectureNode {
  const resourceType = convertResourceTypeV1ToV2(v1Resource.resourceType);
  const configuration = migrateConfigurationV1ToV2(
    v1Resource.configuration, 
    v1Resource.resourceType
  );

  // Ensure tags include ResourceId
  if (!configuration.tags || typeof configuration.tags !== 'object') {
    configuration.tags = {};
  }
  (configuration.tags as Record<string, string>).ResourceId = v1Resource.id;

  return {
    id: v1Resource.id,
    node_type: convertNodeTypeV1ToV2(v1Resource.nodeType),
    resource_type: resourceType,
    name: v1Resource.name,
    icon: v1Resource.icon,
    position: v1Resource.position,
    dimensions: v1Resource.dimensions,
    configuration: configuration,
    parent_id: v1Resource.parentId,
  };
}

/**
 * Migrate node from v2 to v1 (node → resource)
 */
function migrateNodeV2ToV1(v2Node: ArchitectureNode): ArchitectureResourceV1 {
  const resourceType = convertResourceTypeV2ToV1(
    v2Node.resource_type, 
    v2Node.configuration as Record<string, unknown>
  );
  const configuration = migrateConfigurationV2ToV1(
    v2Node.configuration as Record<string, unknown>,
    v2Node.resource_type,
    v2Node.id
  );

  return {
    id: v2Node.id,
    nodeType: convertNodeTypeV2ToV1(v2Node.node_type),
    resourceType: resourceType,
    name: v2Node.name,
    icon: v2Node.icon,
    position: v2Node.position,
    dimensions: v2Node.dimensions,
    configuration: configuration,
    parentId: v2Node.parent_id,
  };
}

// =====================================================================
// Connection Conversion
// =====================================================================

function migrateConnectionV1ToV2(v1Connection: {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
}): ResourceConnection {
  return {
    id: v1Connection.id,
    source: v1Connection.source,
    target: v1Connection.target,
    source_handle: v1Connection.sourceHandle,
    target_handle: v1Connection.targetHandle,
    type: v1Connection.type,
  };
}

function migrateConnectionV2ToV1(v2Connection: ResourceConnection): {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
} {
  return {
    id: v2Connection.id,
    source: v2Connection.source,
    target: v2Connection.target,
    sourceHandle: v2Connection.source_handle,
    targetHandle: v2Connection.target_handle,
    type: v2Connection.type,
  };
}

// =====================================================================
// Full Architecture Migration
// =====================================================================

/**
 * Migrate full architecture from v1 to v2
 */
export function migrateArchitectureV1ToV2(v1Data: ArchitectureDataV1): ArchitectureData {
  return {
    format_version: "2.0.0",
    metadata: {
      name: v1Data.metadata.name,
      description: v1Data.metadata.description,
      version: v1Data.metadata.version,
      created_at: v1Data.metadata.createdAt,
      last_modified: new Date().toISOString(), // Update timestamp
      provider: v1Data.metadata.provider,
    },
    resources: v1Data.resources.map(migrateResourceV1ToV2),
    connections: v1Data.connections.map(migrateConnectionV1ToV2),
    variables: v1Data.variables,
    outputs: v1Data.outputs,
  };
}

/**
 * Migrate full architecture from v2 to v1 (for backward compatibility export)
 */
export function migrateArchitectureV2ToV1(v2Data: ArchitectureData): ArchitectureDataV1 {
  return {
    metadata: {
      name: v2Data.metadata.name,
      description: v2Data.metadata.description,
      version: v2Data.metadata.version,
      createdAt: v2Data.metadata.created_at,
      lastModified: new Date().toISOString(), // Update timestamp
      provider: v2Data.metadata.provider,
    },
    resources: v2Data.resources.map(migrateNodeV2ToV1),
    connections: v2Data.connections.map(migrateConnectionV2ToV1),
    variables: v2Data.variables,
    outputs: v2Data.outputs,
  };
}

// =====================================================================
// Auto Migration Wrapper
// =====================================================================

/**
 * Automatically detect format and migrate to v2 if needed
 */
export function autoMigrateToV2(data: unknown): ArchitectureData {
  const format = detectArchitectureFormat(data);
  
  if (format === "v2") {
    return data as ArchitectureData;
  }
  
  if (format === "v1") {
    return migrateArchitectureV1ToV2(data as ArchitectureDataV1);
  }
  
  throw new Error("Unknown or invalid architecture format");
}

/**
 * Check if migration is needed
 */
export function needsMigration(data: unknown): boolean {
  const format = detectArchitectureFormat(data);
  return format === "v1";
}

// =====================================================================
// Migration Metadata
// =====================================================================

export interface MigrationInfo {
  fromVersion: ArchitectureFormat;
  toVersion: ArchitectureFormat;
  migratedAt: string;
  resourceCount: number;
  warnings: string[];
}

/**
 * Perform migration with detailed info
 */
export function migrateWithInfo(data: unknown): {
  data: ArchitectureData;
  info: MigrationInfo;
} {
  const format = detectArchitectureFormat(data);
  const warnings: string[] = [];
  
  if (format === "v2") {
    return {
      data: data as ArchitectureData,
      info: {
        fromVersion: "v2",
        toVersion: "v2",
        migratedAt: new Date().toISOString(),
        resourceCount: (data as ArchitectureData).resources.length,
        warnings: ["No migration needed - already v2 format"],
      },
    };
  }
  
  if (format === "v1") {
    const v1Data = data as ArchitectureDataV1;
    const v2Data = migrateArchitectureV1ToV2(v1Data);
    
    // Check for potential issues
    v2Data.resources.forEach(node => {
      const subnetType = (node.configuration as Record<string, unknown>).subnet_type;
      if (node.resource_type === 'subnet' && !subnetType) {
        warnings.push(`Subnet ${node.id} may need subnet_type verification`);
      }
    });
    
    return {
      data: v2Data,
      info: {
        fromVersion: "v1",
        toVersion: "v2",
        migratedAt: new Date().toISOString(),
        resourceCount: v2Data.resources.length,
        warnings,
      },
    };
  }
  
  throw new Error("Unknown or invalid architecture format");
}
