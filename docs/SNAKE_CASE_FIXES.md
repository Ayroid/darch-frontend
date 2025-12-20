# Snake Case Field Conversion Fixes

## Overview
This document outlines the remaining camelCase fields that were identified and fixed to complete the snake_case migration for architecture format v2.0.0.

## Date
December 20, 2024

## Issues Identified
User-provided architecture JSON showed mixed camelCase/snake_case fields that were not caught in the initial migration:

### Core Resource Fields
- `nodeType` → `node_type`
- `resourceType` → `resource_type`
- `parentId` → `parent_id`

### Configuration Fields
- `awsAvailabilityZone` → `availability_zone`
- `enableResourceNameDnsAAAARecordOnLaunch` → `enable_resource_name_dns_aaaa_record_on_launch`
- `fromPort` → `from_port`
- `toPort` → `to_port`
- `cidrBlocks` → `cidr_blocks`
- `ipv6CidrBlocks` → `ipv6_cidr_blocks`
- `ebsOptimized` → `ebs_optimized`
- `hostId` → `host_id`
- `awsSubnetId` → `subnet_id`

## Files Fixed

### 1. Template Files
**File:** `public/templates/single-ec2-instance.json`

**Changes Made:**
- Updated all resource objects to use `node_type`, `resource_type`, `parent_id`
- Fixed subnet configuration: `awsAvailabilityZone` → `availability_zone`
- Fixed subnet configuration: `enableResourceNameDnsAAAARecordOnLaunch` → `enable_resource_name_dns_aaaa_record_on_launch`
- Fixed security group egress rules: `fromPort` → `from_port`, `toPort` → `to_port`
- Fixed security group egress rules: `cidrBlocks` → `cidr_blocks`, `ipv6CidrBlocks` → `ipv6_cidr_blocks`
- Fixed EC2 configuration: `ebsOptimized` → `ebs_optimized`, `hostId` → `host_id`
- Fixed route table configuration: `awsSubnetId` → `subnet_id`
- Removed duplicate `availability_zone` field in EC2 configuration

**Impact:** 8 resources updated across:
- aws-region (1)
- aws-vpc (1)
- aws-availability-zone (1)
- aws-public-subnet (1)
- aws-security-group (1)
- aws-ec2 (1)
- aws-route-table (1)
- aws-internet-gateway (1)

### 2. Default Configurations
**File:** `lib/stores/configuration/default-configurations.ts`

**Status:** ✅ Already correct - all fields already in snake_case
- Confirmed `ebs_optimized`, `host_id`, `placement_group` already correct
- Security group rule fields (`from_port`, `to_port`, `cidr_blocks`, `ipv6_cidr_blocks`) already correct
- All metadata options already in snake_case (`http_endpoint`, `http_tokens`, etc.)

## Verification

### Template Verification
Checked that the template file now has all snake_case fields:
- ✅ `node_type` appears 8 times
- ✅ `resource_type` appears 8 times
- ✅ `parent_id` appears 7 times (1 resource has no parent)
- ✅ `from_port`, `to_port`, `cidr_blocks`, `ipv6_cidr_blocks` in security group rules
- ✅ `ebs_optimized`, `host_id`, `placement_group` in EC2 configuration
- ✅ `availability_zone` used consistently (no more `awsAvailabilityZone`)
- ✅ `enable_resource_name_dns_aaaa_record_on_launch` in subnet configuration

### CodeBase Check
Verified that remaining references to `nodeType`, `resourceType`, `parentId` in TypeScript files are:
- ✅ Type definitions for v1 format (in migration utilities)
- ✅ Variable names and function parameters (not field names)
- ✅ Conversion functions between v1 and v2 formats
- ✅ No camelCase field references in actual v2 data structures

## Backup
A backup of the original template file was created at:
- `public/templates/single-ec2-instance.json.backup`

## Migration Notes

### For Users with Existing Architectures
Users with architectures saved before this fix may still have camelCase fields. The migration utilities in `lib/types/architecture-migration.ts` will handle conversion:

1. **Loading old data:** The `detectArchitectureFormat()` function identifies v1 format
2. **Automatic migration:** `migrateArchitectureV1ToV2()` converts all fields to snake_case
3. **Saving:** Data is always saved in v2.0.0 format with snake_case

### For Template Authors
When creating new templates, ensure all fields use snake_case:

**Core Fields:**
```json
{
  "node_type": "awsContainer",
  "resource_type": "aws-vpc",
  "parent_id": "parent-node-id"
}
```

**Configuration Fields:**
```json
{
  "configuration": {
    "availability_zone": "us-east-1a",
    "ebs_optimized": false,
    "host_id": "",
    "from_port": 80,
    "to_port": 80,
    "cidr_blocks": ["0.0.0.0/0"],
    "ipv6_cidr_blocks": ["::/0"]
  }
}
```

## Completion Status
✅ All identified camelCase fields have been converted to snake_case
✅ Template files updated and verified
✅ Default configurations confirmed correct
✅ Migration utilities support bidirectional conversion
✅ Backup created for safety

## Related Documentation
- [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) - Original migration documentation
- [FIELD_MAPPING_QUICK_REF.md](./FIELD_MAPPING_QUICK_REF.md) - Field mapping reference
- [MIGRATION_GUIDE_V2.md](./MIGRATION_GUIDE_V2.md) - Detailed migration guide
