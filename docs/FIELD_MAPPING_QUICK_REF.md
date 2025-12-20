# Quick Field Mapping Reference

Quick lookup table for converting field names between v1 (camelCase) and v2 (snake_case).

## Common Patterns

```
camelCase → snake_case
enableDnsSupport → enable_dns_support
awsVpcId → vpc_id (also removed ID prefix)
instanceType → instance_type
```

## Resource-Specific ID Fields

### **REMOVED in v2** (Backend generates these)
- `awsVpcId` → *removed*
- `awsEc2Id` → *removed*
- `awsPublicSubnetId` → *removed*
- `awsPrivateSubnetId` → *removed*
- `awsSecurityGroupId` → *removed*
- `awsInternetGatewayId` → *removed*
- `awsNatGatewayId` → *removed*
- `awsRouteTableId` → *removed*
- `awsRegionId` → *removed* (field renamed to `region`)
- `awsAvailabilityZoneId` → *removed*

## VPC Fields

| v1 (Old) | v2 (New) |
|----------|----------|
| `awsVpcId` | *removed* |
| `cidrBlock` | `cidr_block` |
| `awsRegionId` | `region` |
| `enableDnsSupport` | `enable_dns_support` |
| `enableDnsHostnames` | `enable_dns_hostnames` |
| `instanceTenancy` | `instance_tenancy` |
| `assignGeneratedIpv6CidrBlock` | `assign_generated_ipv6_cidr_block` |
| `ipv6CidrBlock` | `ipv6_cidr_block` |
| `ipv6IpamPoolId` | `ipv6_ipam_pool_id` |
| `ipv6NetmaskLength` | `ipv6_netmask_length` |

## EC2 Fields

| v1 (Old) | v2 (New) |
|----------|----------|
| `awsEc2Id` | *removed* |
| `instanceType` | `instance_type` |
| `amiId` | `ami_id` |
| `keyPairName` | `key_pair_name` |
| `awsRegionId` | `region` |
| `awsAvailabilityZone` | `availability_zone` |
| `subnetId` | `subnet_id` |
| `securityGroups` | `security_groups` |
| `iamInstanceProfile` | `iam_instance_profile` |
| `rootVolumeSize` | `root_volume_size` |
| `rootVolumeType` | `root_volume_type` |
| `deleteOnTermination` | `delete_on_termination` |
| `ebsOptimized` | `ebs_optimized` |
| `kmsKeyId` | `kms_key_id` |
| `detailedMonitoring` | `detailed_monitoring` |
| `terminationProtection` | `termination_protection` |
| `autoRecovery` | `auto_recovery` |
| `shutdownBehavior` | `shutdown_behavior` |
| `userData` | `user_data` |
| `userDataReplaceOnChange` | `user_data_replace_on_change` |
| `associatePublicIpAddress` | `associate_public_ip_address` |
| `enhancedNetworking` | `enhanced_networking` |
| `privateIp` | `private_ip` |
| `ipv6Addresses` | `ipv6_addresses` |
| `ipv6AddressCount` | `ipv6_address_count` |
| `hostId` | `host_id` |
| `placementGroup` | `placement_group` |
| `metadataOptions.httpEndpoint` | `metadata_options.http_endpoint` |
| `metadataOptions.httpTokens` | `metadata_options.http_tokens` |
| `metadataOptions.httpPutResponseHopLimit` | `metadata_options.http_put_response_hop_limit` |
| `metadataOptions.instanceMetadataTags` | `metadata_options.instance_metadata_tags` |
| `cpuCredits` | `cpu_credits` |
| `volumeTags` | `volume_tags` |

## Subnet Fields

### Resource Type Change
- v1: `aws-public-subnet` OR `aws-private-subnet` → v2: `subnet`
- **NEW field**: `subnet_type: "public" | "private"`

| v1 (Old) | v2 (New) |
|----------|----------|
| `awsPublicSubnetId` / `awsPrivateSubnetId` | *removed* |
| *N/A* | `subnet_type` (**NEW - Required**) |
| `cidrBlock` | `cidr_block` |
| `awsVpcId` | `vpc_id` |
| `awsRegionId` | `region` |
| `awsAvailabilityZone` | `availability_zone` |
| `availabilityZoneId` | `availability_zone_id` |
| `mapPublicIpOnLaunch` | `map_public_ip_on_launch` |
| `assignIpv6AddressOnCreation` | `assign_ipv6_address_on_creation` |
| `ipv6CidrBlock` | `ipv6_cidr_block` |
| `ipv6Native` | `ipv6_native` |
| `enableDns64` | `enable_dns64` |
| `enableResourceNameDnsARecordOnLaunch` | `enable_resource_name_dns_a_record_on_launch` |
| `enableResourceNameDnsAAAARecordOnLaunch` | `enable_resource_name_dns_aaaa_record_on_launch` |
| `privateDnsHostnameTypeOnLaunch` | `private_dns_hostname_type_on_launch` |
| `customerOwnedIpv4Pool` | `customer_owned_ipv4_pool` |
| `outpostArn` | `outpost_arn` |
| `enableNatGateway` | `enable_nat_gateway` |

## Security Group Fields

| v1 (Old) | v2 (New) |
|----------|----------|
| `awsSecurityGroupId` | *removed* |
| `awsVpcId` | `vpc_id` |
| `ingressRules` | `ingress_rules` |
| `egressRules` | `egress_rules` |
| `revokeRulesOnDelete` | `revoke_rules_on_delete` |

### Security Group Rule Fields

| v1 (Old) | v2 (New) |
|----------|----------|
| `fromPort` | `from_port` |
| `toPort` | `to_port` |
| `cidrBlocks` | `cidr_blocks` |
| `ipv6CidrBlocks` | `ipv6_cidr_blocks` |
| `sourceSecurityGroupId` | `source_security_group_id` |
| `selfReference` | `self_reference` |
| `prefixListIds` | `prefix_list_ids` |

## Internet Gateway Fields

| v1 (Old) | v2 (New) |
|----------|----------|
| `awsInternetGatewayId` | *removed* |
| `awsVpcId` | `vpc_id` |

## NAT Gateway Fields

| v1 (Old) | v2 (New) |
|----------|----------|
| `awsNatGatewayId` | *removed* |
| `awsSubnetId` | `subnet_id` |
| `allocationId` | `allocation_id` |
| `connectivityType` | `connectivity_type` |
| `privateIp` | `private_ip` |
| `secondaryAllocationIds` | `secondary_allocation_ids` |
| `secondaryPrivateIpAddresses` | `secondary_private_ip_addresses` |
| `secondaryPrivateIpAddressCount` | `secondary_private_ip_address_count` |
| `createEip` | `create_eip` |

## Route Table Fields

| v1 (Old) | v2 (New) |
|----------|----------|
| `awsRouteTableId` | *removed* |
| `awsVpcId` | `vpc_id` |
| `awsInternetGatewayId` | `internet_gateway_id` |
| `awsSubnetId` | `subnet_id` |
| `routes: []` | `routes: {}` (**Array → Object**) |
| `associations: []` | `associations: {}` (**Array → Object**) |
| `propagatingVgws` | `propagating_vgws` |

### Route Fields (in Route Table)

| v1 (Old) | v2 (New) |
|----------|----------|
| `destinationCidrBlock` | `destination_cidr_block` |
| `destinationIpv6CidrBlock` | `destination_ipv6_cidr_block` |
| `destinationPrefixListId` | `destination_prefix_list_id` |
| `gatewayId` | `gateway_id` |
| `egressOnlyGatewayId` | `egress_only_gateway_id` |
| `instanceId` | `instance_id` |
| `natGatewayId` | `nat_gateway_id` |
| `localGatewayId` | `local_gateway_id` |
| `networkInterfaceId` | `network_interface_id` |
| `transitGatewayId` | `transit_gateway_id` |
| `vpcEndpointId` | `vpc_endpoint_id` |
| `vpcPeeringConnectionId` | `vpc_peering_connection_id` |
| `carrierGatewayId` | `carrier_gateway_id` |
| `coreNetworkArn` | `core_network_arn` |

### Route Table Association Fields

| v1 (Old) | v2 (New) |
|----------|----------|
| `associationId` | `association_id` |
| `subnetId` | `subnet_id` |
| `gatewayId` | `gateway_id` |

## Region & AZ Fields

| v1 (Old) | v2 (New) |
|----------|----------|
| `awsRegionId` | *removed* |
| `region` | `region` |
| `regionName` | `region_name` |
| `isEnabled` | `is_enabled` |
| `isDefault` | `is_default` |
| `awsAvailabilityZoneId` | *removed* |
| `awsAvailabilityZone` | `availability_zone` |
| `isPreferred` | `is_preferred` |

## Architecture Root Fields

| v1 (Old) | v2 (New) |
|----------|----------|
| `resources` | `nodes` |
| `metadata.createdAt` | `metadata.created_at` |
| `metadata.lastModified` | `metadata.last_modified` |
| *N/A* | `format_version: "2.0.0"` (**NEW**) |

## Node/Resource Fields

| v1 (Old) | v2 (New) |
|----------|----------|
| `nodeType` | `node_type` |
| `awsService` | `aws_service` |
| `awsContainer` | `aws_container` |
| `resourceType` | `resource_type` |
| `aws-vpc` | `vpc` |
| `aws-ec2` | `ec2` |
| `aws-public-subnet` | `subnet` (+ `subnet_type: "public"`) |
| `aws-private-subnet` | `subnet` (+ `subnet_type: "private"`) |
| `aws-security-group` | `security-group` |
| `aws-internet-gateway` | `internet-gateway` |
| `aws-nat-gateway` | `nat-gateway` |
| `aws-route-table` | `route-table` |
| `aws-region` | `region` |
| `aws-availability-zone` | `availability-zone` |
| `parentId` | `parent_id` |

## Connection Fields

| v1 (Old) | v2 (New) |
|----------|----------|
| `sourceHandle` | `source_handle` |
| `targetHandle` | `target_handle` |

## Programmatic Conversion

```typescript
// camelCase → snake_case
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// snake_case → camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Example usage
camelToSnake('enableDnsSupport') // 'enable_dns_support'
snakeToCamel('enable_dns_support') // 'enableDnsSupport'
```

## Usage in Code

```typescript
// Old (v1)
const vpc: VPCConfiguration = {
  awsVpcId: "main-vpc",
  cidrBlock: "10.0.0.0/16",
  enableDnsSupport: true,
  enableDnsHostnames: false,
};

// New (v2)
const vpc: VPCConfigurationV2 = {
  cidr_block: "10.0.0.0/16",
  enable_dns_support: true,
  enable_dns_hostnames: false,
  tags: {
    ResourceId: "vpc-1",
    Name: "Main VPC",
  }
};
```

## Quick Checklist for Updating Forms

- [ ] Change all input `name` attributes to snake_case
- [ ] Update `value` prop bindings to use snake_case
- [ ] Update `onChange` handlers to use snake_case
- [ ] Remove ID field inputs
- [ ] Add `subnet_type` selector for subnet forms
- [ ] Convert route table arrays to object inputs
- [ ] Update validation error messages with new field names
- [ ] Test form submission with new format

---

**Tip**: Use Find & Replace with regex:
- Find: `([a-z])([A-Z])`
- Replace: `$1_$2` (then lowercase)

This will help convert most camelCase to snake_case automatically.
