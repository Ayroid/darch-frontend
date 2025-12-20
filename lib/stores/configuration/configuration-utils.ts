import { AWSResourceConfiguration } from "../../types/aws-resources";

/**
 * Utility functions for configuration management
 */

// Define allowed fields for each resource type
// Supports both v1 (camelCase, with ID fields) and v2 (snake_case, no ID fields)
const RESOURCE_TYPE_FIELDS: Record<string, Set<string>> = {
	// V2 format (preferred - snake_case, no ID fields)
	"vpc": new Set([
		"cidr_block",
		"region",
		"description",
		"enable_dns_support",
		"enable_dns_hostnames",
		"instance_tenancy",
		"assign_generated_ipv6_cidr_block",
		"ipv6_cidr_block",
		"ipv6_ipam_pool_id",
		"ipv6_netmask_length",
		"enable_network_address_usage_metrics",
		"tags",
	]),
	"ec2": new Set([
		"instance_type",
		"ami_id",
		"key_pair_name",
		"region",
		"availability_zone",
		"subnet_id",
		"security_groups",
		"iam_instance_profile",
		"root_volume_size",
		"root_volume_type",
		"delete_on_termination",
		"encrypted",
		"ebs_optimized",
		"kms_key_id",
		"detailed_monitoring",
		"termination_protection",
		"auto_recovery",
		"shutdown_behavior",
		"user_data",
		"user_data_replace_on_change",
		"associate_public_ip_address",
		"enhanced_networking",
		"private_ip",
		"ipv6_addresses",
		"ipv6_address_count",
		"tenancy",
		"host_id",
		"placement_group",
		"metadata_options",
		"cpu_credits",
		"capacity_reservation_specification",
		"credit_specification",
		"volume_tags",
		"tags",
	]),
	"subnet": new Set([
		"subnet_type", // NEW - Required: "public" | "private"
		"cidr_block",
		"vpc_id",
		"region",
		"availability_zone",
		"availability_zone_id",
		"description",
		"map_public_ip_on_launch",
		"assign_ipv6_address_on_creation",
		"ipv6_cidr_block",
		"ipv6_native",
		"enable_dns64",
		"enable_resource_name_dns_a_record_on_launch",
		"enable_resource_name_dns_aaaa_record_on_launch",
		"private_dns_hostname_type_on_launch",
		"customer_owned_ipv4_pool",
		"outpost_arn",
		"enable_nat_gateway",
		"tags",
	]),
	"region": new Set([
		"region",
		"region_name",
		"description",
		"is_enabled",
		"is_default",
		"tags",
	]),
	"availability-zone": new Set([
		"region",
		"availability_zone",
		"description",
		"is_enabled",
		"is_preferred",
		"tags",
	]),
	"security-group": new Set([
		"name",
		"vpc_id",
		"description",
		"ingress_rules",
		"egress_rules",
		"revoke_rules_on_delete",
		"tags",
	]),
	"internet-gateway": new Set([
		"vpc_id",
		"description",
		"tags",
	]),
	"nat-gateway": new Set([
		"subnet_id",
		"allocation_id",
		"connectivity_type",
		"private_ip",
		"secondary_allocation_ids",
		"secondary_private_ip_addresses",
		"secondary_private_ip_address_count",
		"create_eip",
		"description",
		"tags",
	]),
	"route-table": new Set([
		"vpc_id",
		"internet_gateway_id",
		"subnet_id",
		"routes", // Now an object, not array
		"associations", // Now an object, not array
		"propagating_vgws",
		"description",
		"tags",
	]),
};


/**
 * Filters configuration updates to only include fields valid for the resource type
 * @param resourceType - The resource type (serviceId)
 * @param updates - The configuration updates to filter
 * @returns Filtered updates containing only valid fields
 */
export function filterValidFields(
	resourceType: string,
	updates: Partial<AWSResourceConfiguration>
): Partial<AWSResourceConfiguration> {
	const allowedFields = RESOURCE_TYPE_FIELDS[resourceType];

	if (!allowedFields) {
		console.warn(
			`Unknown resource type: ${resourceType}. Allowing all fields.`
		);
		return updates;
	}

	const filtered: Partial<AWSResourceConfiguration> = {};

	Object.entries(updates).forEach(([key, value]) => {
		if (allowedFields.has(key)) {
			(filtered as Record<string, unknown>)[key] = value;
		} else {
			console.warn(
				`Field '${key}' is not valid for resource type '${resourceType}'. Ignoring.`
			);
		}
	});

	return filtered;
}

/**
 * Validates that a configuration object only contains valid fields for its resource type
 * @param config - The configuration to validate
 * @param resourceType - The resource type to validate against
 * @returns True if valid, false otherwise
 */
export function validateConfigurationFields(
	config: AWSResourceConfiguration,
	resourceType: string
): boolean {
	const allowedFields = RESOURCE_TYPE_FIELDS[resourceType];

	if (!allowedFields) {
		console.warn(`Unknown resource type: ${resourceType}`);
		return false;
	}

	const configKeys = Object.keys(config);
	const invalidFields = configKeys.filter((key) => !allowedFields.has(key));

	if (invalidFields.length > 0) {
		console.warn(
			`Invalid fields for resource type '${resourceType}':`,
			invalidFields
		);
		return false;
	}

	return true;
}

/**
 * Creates a scoped update function that ensures only valid fields are updated
 * @param resourceType - The resource type to scope updates for
 * @returns A function that filters updates to only valid fields
 */
export function createScopedUpdater(resourceType: string) {
	return (updates: Partial<AWSResourceConfiguration>) =>
		filterValidFields(resourceType, updates);
}
