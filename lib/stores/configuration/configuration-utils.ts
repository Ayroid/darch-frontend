import { AWSResourceConfiguration } from "@/lib/types/aws-resources";

/**
 * Utility functions for configuration management
 */

// Define allowed fields for each resource type
const RESOURCE_TYPE_FIELDS: Record<string, Set<string>> = {
	"aws-vpc": new Set([
		"resourceName",
		"cidrBlock",
		"region",
		"description",
		"enableDnsSupport",
		"enableDnsHostnames",
		"tags",
	]),
	"aws-ec2": new Set([
		"resourceName",
		"instanceType",
		"amiId",
		"keyPairName",
		"availabilityZone",
		"subnetId",
		"securityGroups",
		"iamInstanceProfile",
		"rootVolumeSize",
		"rootVolumeType",
		"deleteOnTermination",
		"encrypted",
		"detailedMonitoring",
		"terminationProtection",
		"autoRecovery",
		"userData",
		"associatePublicIpAddress",
		"enhancedNetworking",
		"sriovNetSupport",
		"tenancy",
		"hostId",
		"tags",
	]),
	"aws-region": new Set([
		"resourceName",
		"region",
		"regionName",
		"description",
		"isEnabled",
		"isDefault",
		"tags",
	]),
	"aws-availability-zone": new Set([
		"resourceName",
		"region",
		"availabilityZone",
		"description",
		"isEnabled",
		"isPreferred",
		"tags",
	]),
	"aws-private-subnet": new Set([
		"resourceName",
		"cidrBlock",
		"vpcId",
		"region",
		"availabilityZone",
		"description",
		"mapPublicIpOnLaunch",
		"enableNatGateway",
		"tags",
	]),
	"aws-public-subnet": new Set([
		"resourceName",
		"cidrBlock",
		"vpcId",
		"region",
		"availabilityZone",
		"description",
		"mapPublicIpOnLaunch",
		"tags",
	]),
	"aws-security-group": new Set([
		"resourceName",
		"groupId",
		"vpcId",
		"description",
		"ingressRules",
		"egressRules",
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
