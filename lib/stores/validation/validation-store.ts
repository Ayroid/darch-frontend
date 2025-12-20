import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AWSResourceConfiguration, SecurityGroupRule } from "@/lib/types/aws-resources";

// Comprehensive validation functions
const validateCIDRBlock = (cidr: string, context: "vpc" | "subnet" = "subnet"): string | null => {
	if (!cidr) return "CIDR block is required";

	const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
	if (!cidrRegex.test(cidr)) return "Invalid CIDR format (e.g., 10.0.0.0/16)";

	const [ip, mask] = cidr.split("/");
	const maskNum = parseInt(mask, 10);

	// Different mask requirements for VPC vs Subnet
	if (context === "vpc") {
		if (maskNum < 16 || maskNum > 28) {
			return "VPC CIDR mask must be between /16 and /28";
		}
	} else {
		if (maskNum < 16 || maskNum > 28) {
			return "Subnet CIDR mask must be between /16 and /28";
		}
	}

	// Validate IP octets
	const octets = ip.split(".").map((num) => parseInt(num, 10));
	if (octets.some((octet) => octet < 0 || octet > 255)) {
		return "Invalid IP address in CIDR block";
	}

	return null;
};

const validateTags = (tags: string): string | null => {
	if (!tags || typeof tags !== "string" || !tags.trim()) return null;

	const tagPairs = tags.split(",").map((tag) => tag.trim());
	for (const pair of tagPairs) {
		if (!pair.includes("=")) {
			return "Tags must be in format: key=value, separated by commas";
		}
		const [key, value] = pair.split("=");
		if (!key.trim() || !value.trim()) {
			return "Tag keys and values cannot be empty";
		}
	}
	return null;
};

const validateResourceName = (name: string, resourceType: string): string | null => {
	if (!name) return `${resourceType} name is required`;
	if (name.length > 255) return `${resourceType} name must be less than 255 characters`;
	if (name.length < 1) return `${resourceType} name cannot be empty`;

	// AWS naming rules - alphanumeric, hyphens, underscores
	const validNameRegex = /^[a-zA-Z0-9\-_]+$/;
	if (!validNameRegex.test(name)) {
		return `${resourceType} name can only contain letters, numbers, hyphens, and underscores`;
	}

	return null;
};

const validateAMIId = (amiId: string): string | null => {
	if (!amiId) return "AMI ID is required";
	const amiRegex = /^ami-[a-f0-9]{8,17}$/;
	if (!amiRegex.test(amiId)) {
		return "Invalid AMI ID format (e.g., ami-00ca570c1b6d79f36)";
	}
	return null;
};

const validateInstanceType = (instanceType: string): string | null => {
	if (!instanceType) return "Instance type is required";
	// Basic instance type validation - should match AWS patterns
	const instanceTypeRegex = /^[a-z0-9]+\.[a-z0-9]+$/;
	if (!instanceTypeRegex.test(instanceType)) {
		return "Invalid instance type format (e.g., t3.micro)";
	}
	return null;
};

const validateRegion = (region: string): string | null => {
	if (!region) return "Region is required";
	// AWS region format validation
	const regionRegex = /^[a-z]{2}-[a-z]+-\d{1}$/;
	if (!regionRegex.test(region)) {
		return "Invalid AWS region format (e.g., us-east-1)";
	}
	return null;
};

const validateAvailabilityZone = (az: string): string | null => {
	if (!az) return "Availability zone is required";
	// AWS AZ format validation
	const azRegex = /^[a-z]{2}-[a-z]+-\d{1}[a-z]$/;
	if (!azRegex.test(az)) {
		return "Invalid availability zone format (e.g., us-east-1a)";
	}
	return null;
};

// Helper function to get user-friendly resource type names
function getResourceTypeName(serviceId: string): string {
	switch (serviceId) {
		case "aws-vpc": return "VPC";
		case "aws-ec2": return "EC2 Instance";
		case "aws-private-subnet": return "Private Subnet";
		case "aws-public-subnet": return "Public Subnet";
		case "aws-region": return "Region";
		case "aws-availability-zone": return "Availability Zone";
		case "aws-security-group": return "Security Group";
		default: return "Resource";
	}
}

// Validation state
interface ValidationState {
	// Form validation state
	validationErrors: Record<string, string[]>;

	// Field-level validation
	fieldErrors: Record<string, Record<string, string>>;

	// Validation rules
	validationRules: Record<string, ValidationRule[]>;
}

// Validation rule interface
interface ValidationRule {
	field: string;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
	custom?: (value: unknown) => string | null;
}

// Validation actions
interface ValidationActions {
	// Error management
	setValidationErrors: (nodeId: string, errors: string[]) => void;
	clearValidationErrors: (nodeId: string) => void;
	setFieldError: (nodeId: string, field: string, error: string) => void;
	clearFieldError: (nodeId: string, field: string) => void;
	clearAllErrors: () => void;

	// Validation rules
	setValidationRules: (serviceId: string, rules: ValidationRule[]) => void;
	addValidationRule: (serviceId: string, rule: ValidationRule) => void;
	removeValidationRule: (serviceId: string, field: string) => void;

	// Validation execution
	validateConfiguration: (
		serviceId: string,
		config: AWSResourceConfiguration
	) => string[];
	validateField: (
		serviceId: string,
		field: string,
		value: unknown
	) => string | null;
}

// Create the validation store
export const useValidationStore = create<ValidationState & ValidationActions>()(
	devtools(
		immer((set, get) => ({
			// Initial state
			validationErrors: {},
			fieldErrors: {},
			validationRules: {},

			// Actions
			setValidationErrors: (nodeId, errors) =>
				set((state) => {
					state.validationErrors[nodeId] = errors;
				}),

			clearValidationErrors: (nodeId) =>
				set((state) => {
					delete state.validationErrors[nodeId];
				}),

			setFieldError: (nodeId, field, error) =>
				set((state) => {
					if (!state.fieldErrors[nodeId]) {
						state.fieldErrors[nodeId] = {};
					}
					state.fieldErrors[nodeId][field] = error;
				}),

			clearFieldError: (nodeId, field) =>
				set((state) => {
					if (state.fieldErrors[nodeId]) {
						delete state.fieldErrors[nodeId][field];
						if (Object.keys(state.fieldErrors[nodeId]).length === 0) {
							delete state.fieldErrors[nodeId];
						}
					}
				}),

			clearAllErrors: () =>
				set((state) => {
					state.validationErrors = {};
					state.fieldErrors = {};
				}),

			setValidationRules: (serviceId, rules) =>
				set((state) => {
					state.validationRules[serviceId] = rules;
				}),

			addValidationRule: (serviceId, rule) =>
				set((state) => {
					if (!state.validationRules[serviceId]) {
						state.validationRules[serviceId] = [];
					}
					state.validationRules[serviceId].push(rule);
				}),

			removeValidationRule: (serviceId, field) =>
				set((state) => {
					if (state.validationRules[serviceId]) {
						state.validationRules[serviceId] = state.validationRules[
							serviceId
						].filter((rule) => rule.field !== field);
					}
				}),

			validateConfiguration: (serviceId, config) => {
				const rules = get().validationRules[serviceId] || [];
				const errors: string[] = [];

				// Type-safe property access helper
				const getConfigProperty = (key: string): string | undefined => {
					return (config as Record<string, unknown>)[key] as string | undefined;
				};

				// Enhanced validation for all AWS resources
				switch (serviceId) {
					case "aws-vpc": {
				const vpc_id = getConfigProperty("vpc_id") || "";
				const cidr_block = getConfigProperty("cidr_block") || "";
				const region = getConfigProperty("region") || "";
				const tags = getConfigProperty("tags") || "";

				const nameError = validateResourceName(vpc_id, "VPC");
				if (nameError) errors.push(nameError);

				const cidrError = validateCIDRBlock(cidr_block, "vpc");

						const regionError = validateRegion(region);
						if (regionError) errors.push(regionError);

						const tagsError = validateTags(tags);
						if (tagsError) errors.push(tagsError);
						break;
					}

					case "aws-security-group": {
				const security_group_id = getConfigProperty("security_group_id") || "";
				const vpc_id = getConfigProperty("vpc_id") || "";
				const nameError = validateResourceName(security_group_id, "Security Group");
				if (nameError) errors.push(nameError);
				if (!vpc_id || !/^vpc-[a-z0-9]{8,}$/.test(vpc_id)) {
						}

						// Validate rules
						const cfgObj = config as unknown as Record<string, unknown>;
				const ingress_rules = cfgObj["ingress_rules"] as unknown[] | undefined;
				const egress_rules = cfgObj["egress_rules"] as unknown[] | undefined;
						const validateRuleArray = (rules: unknown[] | undefined, type: "ingress" | "egress") => {
							if (!rules) return;
							rules.forEach((r, idx) => {
							const rule = r as SecurityGroupRule;
								const protocol = (rule.protocol ?? "").toString();
								if (!["tcp", "udp", "icmp", "all"].includes(protocol)) {
									errors.push(`${type} rule #${idx + 1}: invalid protocol`);
								}
								const portVal = rule.port as unknown;
								if (typeof portVal === "string") {
									if (portVal.toLowerCase() !== "all") {
										errors.push(`${type} rule #${idx + 1}: port must be a number or 'all'`);
									}
								} else if (typeof portVal === "number") {
									if (portVal < 0 || portVal > 65535) {
										errors.push(`${type} rule #${idx + 1}: port must be between 0 and 65535`);
									}
								}
								if (type === "ingress") {
									const source = (rule.source ?? "") as string;
									if (!source || (!source.includes("/") && !source.startsWith("sg-"))) {
										errors.push(`${type} rule #${idx + 1}: source must be CIDR or SG ID`);
									}
								} else {
									const dest = (rule.destination ?? "") as string;
									if (!dest || (!dest.includes("/") && !dest.startsWith("sg-"))) {
										errors.push(`${type} rule #${idx + 1}: destination must be CIDR or SG ID`);
									}
								}
							});
						};

validateRuleArray(ingress_rules, "ingress");
				validateRuleArray(egress_rules, "egress");
						break;
					}

					case "aws-ec2": {
				const instance_type = getConfigProperty("instance_type") || "";
				const ami_id = getConfigProperty("ami_id") || "";
				const availability_zone = getConfigProperty("availability_zone") || "";

				const instanceTypeError = validateInstanceType(instance_type);
				if (instanceTypeError) errors.push(instanceTypeError);

				const amiError = validateAMIId(ami_id);
				if (amiError) errors.push(amiError);

				if (availability_zone) {
					const azError = validateAvailabilityZone(availability_zone);
						}
						break;
					}

case "aws-subnet": {
				const cidr_block = getConfigProperty("cidr_block") || "";
				const availability_zone = getConfigProperty("availability_zone") || "";
				const tags = getConfigProperty("tags") || "";

				const cidrError = validateCIDRBlock(cidr_block, "subnet");
				if (cidrError) errors.push(cidrError);

				const azError = validateAvailabilityZone(availability_zone);
						if (azError) errors.push(azError);

						const tagsError = validateTags(tags);
						if (tagsError) errors.push(tagsError);
						break;
					}

					case "aws-region": {
				const region = getConfigProperty("region") || "";
				const region_name = getConfigProperty("region_name") || "";

				const regionError = validateRegion(region);
				if (regionError) errors.push(regionError);

				if (!region_name.trim()) errors.push("Region name is required");
					}

					case "aws-availability-zone": {
				const region = getConfigProperty("region") || "";
				const availability_zone = getConfigProperty("availability_zone") || "";

				const regionError = validateRegion(region);
				if (regionError) errors.push(regionError);

				const azError = validateAvailabilityZone(availability_zone);
						break;
					}

					default:
						// Generic validation for unknown resource types
						const awsResourceId = getConfigProperty("awsResourceId") || "";
						if (!awsResourceId.trim()) errors.push("Resource ID is required");
						break;
				}

				// Apply custom validation rules
				rules.forEach((rule) => {
					const value = (config as Record<string, unknown>)[rule.field];

					if (rule.required && (!value || value === "")) {
						errors.push(`${rule.field} is required`);
						return;
					}

					if (value && typeof value === "string") {
						if (rule.minLength && value.length < rule.minLength) {
							errors.push(
								`${rule.field} must be at least ${rule.minLength} characters`
							);
						}

						if (rule.maxLength && value.length > rule.maxLength) {
							errors.push(
								`${rule.field} must be no more than ${rule.maxLength} characters`
							);
						}

						if (rule.pattern && !rule.pattern.test(value)) {
							errors.push(`${rule.field} format is invalid`);
						}
					}

					if (rule.custom) {
						const customError = rule.custom(value);
						if (customError) {
							errors.push(customError);
						}
					}
				});

				return errors;
			},

			validateField: (serviceId, field, value) => {
				const rules = get().validationRules[serviceId] || [];
				const rule = rules.find((r) => r.field === field);

				// First check custom rules
				if (rule) {
					if (rule.required && (!value || value === "")) {
						return `${field} is required`;
					}

					if (value && typeof value === "string") {
						if (rule.minLength && value.length < rule.minLength) {
							return `${field} must be at least ${rule.minLength} characters`;
						}

						if (rule.maxLength && value.length > rule.maxLength) {
							return `${field} must be no more than ${rule.maxLength} characters`;
						}

						if (rule.pattern && !rule.pattern.test(value)) {
							return `${field} format is invalid`;
						}
					}

					if (rule.custom) {
						return rule.custom(value);
					}
				}

				// Apply built-in field-specific validation
				const stringValue = value as string || "";

				switch (field) {
					// Removed v1 cases
						// Removed
					case "cidr_block":
						const context = serviceId === "aws-vpc" ? "vpc" : "subnet";
						return validateCIDRBlock(stringValue, context);
					case "region":
						return validateRegion(stringValue);
					case "availability_zone":
						return validateAvailabilityZone(stringValue);
					case "instance_type":
						return validateInstanceType(stringValue);
					case "ami_id":
						return validateAMIId(stringValue);
					case "tags":
						return validateTags(stringValue);
					default:
						return null;
				}
			},
		})),
		{
			name: "validation-store",
		}
	)
);

export type { ValidationRule };
