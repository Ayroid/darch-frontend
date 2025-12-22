# Frontend Format Alignment Migration Guide - v2.0.0

## Overview

This document outlines the migration from camelCase/AWS-prefixed fields to snake_case/simplified naming to align with Terraform conventions and reduce backend transformation overhead by ~70%.

## Migration Status

**Current Version**: v1.0.0
**Target Version**: v2.0.0
**Migration Date**: December 2025
**Backward Compatibility**: 2 releases (v2.0.0, v2.1.0)

---

## Key Changes Summary

### 1. Field Naming Convention
- **Before**: `camelCase` (e.g., `cidrBlock`, `enableDnsSupport`)
- **After**: `snake_case` (e.g., `cidr_block`, `enable_dns_support`)

### 2. Resource Type Identifiers
- **Before**: `aws-ec2`, `aws-vpc`, `aws-public-subnet`, `aws-private-subnet`
- **After**: `ec2`, `vpc`, `subnet` (with `subnet_type` property)

### 3. ID Field Naming
- **Before**: Resource-specific IDs (e.g., `awsEc2Id`, `awsVpcId`, `awsPublicSubnetId`)
- **After**: Removed from frontend (backend generates Terraform resource names)

### 4. Root Property
- **Before**: `resources` array
- **After**: `nodes` array (aligned with canvas terminology)

### 5. Subnet Unification
- **Before**: Two separate types (`aws-public-subnet`, `aws-private-subnet`)
- **After**: Single `subnet` type with `subnet_type: "public" | "private"` in configuration

### 6. Security Group Rules
- **Before**: `ingressRules`, `egressRules`
- **After**: `ingress_rules`, `egress_rules`

### 7. Route Table Structure
- **Before**: Arrays (`routes: []`, `associations: []`)
- **After**: Object maps with named keys

---

## Detailed Field Mapping

### VPC Configuration

| Old Field (v1) | New Field (v2) | Notes |
|----------------|----------------|-------|
| `awsVpcId` | *removed* | Backend generates |
| `cidrBlock` | `cidr_block` | Required |
| `awsRegionId` | `region` | Optional |
| `enableDnsSupport` | `enable_dns_support` | Default: true |
| `enableDnsHostnames` | `enable_dns_hostnames` | Default: false |
| `instanceTenancy` | `instance_tenancy` | Default: "default" |
| `assignGeneratedIpv6CidrBlock` | `assign_generated_ipv6_cidr_block` | Default: false |

### EC2 Configuration

| Old Field (v1) | New Field (v2) | Notes |
|----------------|----------------|-------|
| `awsEc2Id` | *removed* | Backend generates |
| `instanceType` | `instance_type` | Required |
| `amiId` | `ami_id` | Required |
| `keyPairName` | `key_pair_name` | Optional |
| `awsRegionId` | `region` | Optional |
| `awsAvailabilityZone` | `availability_zone` | Optional |
| `subnetId` | `subnet_id` | Optional |
| `securityGroups` | `security_groups` | Array |
| `iamInstanceProfile` | `iam_instance_profile` | Optional |
| `rootVolumeSize` | `root_volume_size` | Default: 8 |
| `rootVolumeType` | `root_volume_type` | Default: "gp3" |
| `deleteOnTermination` | `delete_on_termination` | Default: true |
| `ebsOptimized` | `ebs_optimized` | Default: false |
| `detailedMonitoring` | `detailed_monitoring` | Default: false |
| `terminationProtection` | `termination_protection` | Default: false |
| `userData` | `user_data` | Base64 encoded |
| `associatePublicIpAddress` | `associate_public_ip_address` | Default: false |
| `volumeTags` | `volume_tags` | Object |

### Subnet Configuration

| Old Field (v1) | New Field (v2) | Notes |
|----------------|----------------|-------|
| `awsPublicSubnetId` / `awsPrivateSubnetId` | *removed* | Backend generates |
| `resourceType: "aws-public-subnet"` | `resourceType: "subnet"` | Unified |
| `resourceType: "aws-private-subnet"` | `resourceType: "subnet"` | Unified |
| *N/A* | `subnet_type: "public" \| "private"` | **NEW** - Required |
| `cidrBlock` | `cidr_block` | Required |
| `awsVpcId` | `vpc_id` | Required |
| `awsRegionId` | `region` | Optional |
| `awsAvailabilityZone` | `availability_zone` | Required |
| `mapPublicIpOnLaunch` | `map_public_ip_on_launch` | Boolean |
| `enableNatGateway` | `enable_nat_gateway` | Private only |

### Security Group Configuration

| Old Field (v1) | New Field (v2) | Notes |
|----------------|----------------|-------|
| `awsSecurityGroupId` | *removed* | Backend generates |
| `awsVpcId` | `vpc_id` | Required |
| `ingressRules` | `ingress_rules` | Array |
| `egressRules` | `egress_rules` | Array |
| `revokeRulesOnDelete` | `revoke_rules_on_delete` | Default: false |

### Security Group Rule

| Old Field (v1) | New Field (v2) | Notes |
|----------------|----------------|-------|
| `fromPort` | `from_port` | Required for tcp/udp |
| `toPort` | `to_port` | Required for tcp/udp |
| `cidrBlocks` | `cidr_blocks` | Array |
| `ipv6CidrBlocks` | `ipv6_cidr_blocks` | Array |
| `sourceSecurityGroupId` | `source_security_group_id` | Optional |
| `selfReference` | `self_reference` | Boolean |

### Internet Gateway Configuration

| Old Field (v1) | New Field (v2) | Notes |
|----------------|----------------|-------|
| `awsInternetGatewayId` | *removed* | Backend generates |
| `awsVpcId` | `vpc_id` | Optional |

### NAT Gateway Configuration

| Old Field (v1) | New Field (v2) | Notes |
|----------------|----------------|-------|
| `awsNatGatewayId` | *removed* | Backend generates |
| `awsSubnetId` | `subnet_id` | Required |
| `allocationId` | `allocation_id` | Required for public |
| `connectivityType` | `connectivity_type` | Default: "public" |
| `privateIp` | `private_ip` | For private NAT |
| `createEip` | `create_eip` | Default: true |

### Route Table Configuration

| Old Field (v1) | New Field (v2) | Notes |
|----------------|----------------|-------|
| `awsRouteTableId` | *removed* | Backend generates |
| `awsVpcId` | `vpc_id` | Required |
| `awsInternetGatewayId` | `internet_gateway_id` | Optional |
| `awsSubnetId` | `subnet_id` | Optional |
| `routes: []` | `routes: {}` | **Array → Object** |
| `associations: []` | `associations: {}` | **Array → Object** |
| `propagatingVgws` | `propagating_vgws` | Array |

### Route Object (in Route Table)

| Old Field (v1) | New Field (v2) | Notes |
|----------------|----------------|-------|
| `destinationCidrBlock` | `destination_cidr_block` | IPv4 CIDR |
| `destinationIpv6CidrBlock` | `destination_ipv6_cidr_block` | IPv6 CIDR |
| `destinationPrefixListId` | `destination_prefix_list_id` | Prefix list |
| `gatewayId` | `gateway_id` | Target gateway |
| `egressOnlyGatewayId` | `egress_only_gateway_id` | IPv6 egress |
| `instanceId` | `instance_id` | EC2 instance |
| `natGatewayId` | `nat_gateway_id` | NAT Gateway |
| `localGatewayId` | `local_gateway_id` | Local gateway |
| `networkInterfaceId` | `network_interface_id` | Network interface |
| `transitGatewayId` | `transit_gateway_id` | Transit gateway |
| `vpcEndpointId` | `vpc_endpoint_id` | VPC endpoint |
| `vpcPeeringConnectionId` | `vpc_peering_connection_id` | VPC peering |
| `carrierGatewayId` | `carrier_gateway_id` | Carrier gateway |
| `coreNetworkArn` | `core_network_arn` | Core network |

### Route Table Association (in Route Table)

| Old Field (v1) | New Field (v2) | Notes |
|----------------|----------------|-------|
| `associationId` | `association_id` | Output |
| `subnetId` | `subnet_id` | Subnet to associate |
| `gatewayId` | `gateway_id` | Gateway to associate |
| `main` | `main` | Main route table flag |

### Region & Availability Zone

| Old Field (v1) | New Field (v2) | Notes |
|----------------|----------------|-------|
| `awsRegionId` | *removed* | Backend generates |
| `regionName` | `region_name` | Human-readable |
| `isEnabled` | `is_enabled` | Boolean |
| `isDefault` | `is_default` | Boolean |
| `awsAvailabilityZoneId` | *removed* | Backend generates |
| `awsAvailabilityZone` | `availability_zone` | Zone code |
| `isPreferred` | `is_preferred` | Boolean |

---

## Migration Strategy

### Phase 1: Preparation (Week 1)
1. ✅ Create migration documentation
2. Create backward compatibility layer
3. Add format version detection
4. Update TypeScript interfaces

### Phase 2: Core Migration (Week 2)
1. Update type definitions
2. Update stores and state management
3. Update default configurations
4. Update validation logic

### Phase 3: Component Updates (Week 3)
1. Update all configuration forms
2. Update resource initialization
3. Update drag-and-drop handlers
4. Update icon/label mappings

### Phase 4: Testing & Rollout (Week 4)
1. Test migration utility with real architectures
2. Add migration notifications in UI
3. Deploy v2.0.0 with backward compatibility
4. Monitor and fix issues

### Phase 5: Cleanup (2 releases later)
1. Deprecate old format support (v2.2.0)
2. Remove migration utilities (v3.0.0)

---

## Backward Compatibility

### Format Detection
```typescript
interface ArchitectureDataV1 {
  resources: ArchitectureResource[];
  // Old field names (camelCase)
}

interface ArchitectureDataV2 {
  nodes: ArchitectureNode[];
  // New field names (snake_case)
  format_version: "2.0.0";
}

function detectFormat(data: unknown): "v1" | "v2" {
  if (data && typeof data === 'object') {
    // Check for format_version field
    if ('format_version' in data) return "v2";

    // Check for old vs new property names
    if ('resources' in data) return "v1";
    if ('nodes' in data) return "v2";
  }
  return "v1"; // Default to v1
}
```

### Migration Utility
```typescript
function migrateArchitectureV1ToV2(v1Data: ArchitectureDataV1): ArchitectureDataV2 {
  return {
    format_version: "2.0.0",
    metadata: migrateMetadata(v1Data.metadata),
    nodes: v1Data.resources.map(migrateResource),
    connections: v1Data.connections.map(migrateConnection),
    variables: v1Data.variables,
    outputs: v1Data.outputs,
  };
}
```

---

## API Version Headers

### Request Headers
```typescript
// Frontend sends format version to backend
headers: {
  'X-Architecture-Format-Version': '2.0.0',
  'Content-Type': 'application/json',
}
```

### Response Handling
```typescript
// Backend can return both formats during transition
interface APIResponse {
  data: ArchitectureData;
  format_version: string;
  migration_required?: boolean;
}
```

---

## Data Export Compatibility

### Export Options
1. **v2 Format** (default) - New snake_case format
2. **v1 Format** (legacy) - For compatibility with older frontends
3. **Both** - Export both formats as separate files

### Export Implementation
```typescript
export function exportArchitecture(
  data: ArchitectureDataV2,
  options: {
    format: 'v1' | 'v2' | 'both';
    includeMetadata?: boolean;
  }
) {
  switch (options.format) {
    case 'v1':
      return migrateArchitectureV2ToV1(data);
    case 'v2':
      return data;
    case 'both':
      return {
        v1: migrateArchitectureV2ToV1(data),
        v2: data,
      };
  }
}
```

---

## User Communication

### Migration Notice
Display to users when loading old format architectures:

> **Architecture Update Required**
>
> This architecture uses an older format. We've automatically migrated it to the new format which is optimized for Terraform generation.
>
> - Improved backend compatibility
> - Reduced transformation overhead by 70%
> - Better alignment with Terraform conventions
>
> Please save your architecture to update to the new format.
>
> [Save Now] [Learn More]

### Deprecation Notice (v2.1.0)
> **Deprecated Format Support**
>
> Support for the old architecture format will be removed in version 2.2.0 (February 2026).
>
> Please save all your architectures to migrate them to the new format.
>
> [Migration Guide]

---

## Implementation Checklist

### Core Types
- [ ] Update `architecture.ts` interfaces
- [ ] Update `aws-resources.ts` interfaces
- [ ] Update resource type constants
- [ ] Add format version field

### Stores
- [ ] Update architecture store
- [ ] Update configuration store
- [ ] Update canvas store
- [ ] Update validation store

### Components
- [ ] Update VPC configuration form
- [ ] Update EC2 configuration form
- [ ] Update Subnet configuration forms (merge public/private)
- [ ] Update Security Group configuration form
- [ ] Update Route Table configuration form
- [ ] Update NAT Gateway configuration form
- [ ] Update Internet Gateway configuration form

### Utilities
- [ ] Update auto-configuration logic
- [ ] Update default configurations
- [ ] Update validation rules
- [ ] Update export/import handlers

### Migration
- [ ] Create format detection utility
- [ ] Create v1→v2 migration utility
- [ ] Create v2→v1 backward compatibility utility
- [ ] Add migration UI notifications

### Testing
- [ ] Unit tests for type conversions
- [ ] Integration tests for stores
- [ ] E2E tests for UI components
- [ ] Migration tests with real data

### Documentation
- [ ] Update API documentation
- [ ] Update user documentation
- [ ] Create migration guide
- [ ] Update README

---

## Example Migrations

### VPC Resource
```typescript
// Before (v1)
{
  id: "vpc-1",
  nodeType: "awsContainer",
  resourceType: "aws-vpc",
  name: "Main VPC",
  configuration: {
    awsVpcId: "main-vpc",
    cidrBlock: "10.0.0.0/16",
    awsRegionId: "us-east-1",
    enableDnsSupport: true,
    enableDnsHostnames: false,
    instanceTenancy: "default",
  }
}

// After (v2)
{
  id: "vpc-1",
  node_type: "aws_container",
  resource_type: "vpc",
  name: "Main VPC",
  configuration: {
    cidr_block: "10.0.0.0/16",
    region: "us-east-1",
    enable_dns_support: true,
    enable_dns_hostnames: false,
    instance_tenancy: "default",
    tags: {
      ResourceId: "vpc-1",
      Name: "Main VPC",
    }
  }
}
```

### Subnet Resource (Unified)
```typescript
// Before (v1) - Public Subnet
{
  id: "subnet-1",
  resourceType: "aws-public-subnet",
  configuration: {
    awsPublicSubnetId: "public-subnet-1",
    cidrBlock: "10.0.1.0/24",
    awsVpcId: "vpc-1",
    awsAvailabilityZone: "us-east-1a",
    mapPublicIpOnLaunch: true,
  }
}

// Before (v1) - Private Subnet
{
  id: "subnet-2",
  resourceType: "aws-private-subnet",
  configuration: {
    awsPrivateSubnetId: "private-subnet-1",
    cidrBlock: "10.0.2.0/24",
    awsVpcId: "vpc-1",
    awsAvailabilityZone: "us-east-1a",
    mapPublicIpOnLaunch: false,
    enableNatGateway: true,
  }
}

// After (v2) - Unified Subnet
{
  id: "subnet-1",
  resource_type: "subnet",
  configuration: {
    subnet_type: "public",
    cidr_block: "10.0.1.0/24",
    vpc_id: "vpc-1",
    availability_zone: "us-east-1a",
    map_public_ip_on_launch: true,
    tags: {
      ResourceId: "subnet-1",
      SubnetType: "public",
    }
  }
}

{
  id: "subnet-2",
  resource_type: "subnet",
  configuration: {
    subnet_type: "private",
    cidr_block: "10.0.2.0/24",
    vpc_id: "vpc-1",
    availability_zone: "us-east-1a",
    map_public_ip_on_launch: false,
    enable_nat_gateway: true,
    tags: {
      ResourceId: "subnet-2",
      SubnetType: "private",
    }
  }
}
```

### Security Group
```typescript
// Before (v1)
{
  configuration: {
    awsSecurityGroupId: "web-sg",
    name: "web-security-group",
    awsVpcId: "vpc-1",
    ingressRules: [
      {
        protocol: "tcp",
        fromPort: 80,
        toPort: 80,
        cidrBlocks: ["0.0.0.0/0"],
      }
    ],
    egressRules: [
      {
        protocol: "all",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"],
      }
    ],
  }
}

// After (v2)
{
  configuration: {
    name: "web-security-group",
    vpc_id: "vpc-1",
    ingress_rules: [
      {
        protocol: "tcp",
        from_port: 80,
        to_port: 80,
        cidr_blocks: ["0.0.0.0/0"],
      }
    ],
    egress_rules: [
      {
        protocol: "all",
        from_port: 0,
        to_port: 0,
        cidr_blocks: ["0.0.0.0/0"],
      }
    ],
    tags: {
      ResourceId: "sg-1",
      Name: "web-security-group",
    }
  }
}
```

---

## Questions & Considerations

### 1. Migration Strategy
**Decision**: Support old format for 2 releases (v2.0.0, v2.1.0), deprecate in v2.2.0

### 2. API Version Headers
**Decision**: Yes, include `X-Architecture-Format-Version` header to help backend transition

### 3. Data Export Format
**Decision**: Provide dual export option during transition (both v1 and v2 formats)

### 4. Tag Generation
**Decision**: Always include `ResourceId` tag at creation time for backend mapping

### 5. Route Table Structure
**Decision**: Migrate from arrays to object maps for better key-based management

---

## Support & Resources

- **Migration Issues**: Create GitHub issue with `migration` label
- **Documentation**: See updated docs in `docs/` folder
- **Examples**: Check `examples/migrations/` for sample migrations
- **Testing**: Use `scripts/test-migration.ts` to validate migrations

---

## Timeline

| Week | Phase | Tasks |
|------|-------|-------|
| 1 | Preparation | Documentation, backward compatibility, type updates |
| 2 | Core Migration | Stores, state management, validation |
| 3 | Component Updates | Forms, handlers, UI components |
| 4 | Testing & Rollout | Testing, notifications, deployment |
| +8 weeks | Deprecation Notice | Announce old format deprecation |
| +16 weeks | Removal | Remove old format support |

---

**Last Updated**: December 20, 2025
**Version**: 1.0.0
**Status**: In Progress
