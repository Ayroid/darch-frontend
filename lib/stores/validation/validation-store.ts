import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AWSResourceConfiguration } from "@/lib/types/aws-resources";

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

const validateServiceName = (name: string, resourceType: string): string | null => {
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
		return "Invalid AMI ID format (e.g., ami-0c55b159cbfafe1d0)";
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
						const serviceName = getConfigProperty("serviceName") || "";
						const cidrBlock = getConfigProperty("cidrBlock") || "";
						const region = getConfigProperty("region") || "";
						const tags = getConfigProperty("tags") || "";

						const nameError = validateServiceName(serviceName, "VPC");
						if (nameError) errors.push(nameError);

						const cidrError = validateCIDRBlock(cidrBlock, "vpc");
						if (cidrError) errors.push(cidrError);

						const regionError = validateRegion(region);
						if (regionError) errors.push(regionError);

						const tagsError = validateTags(tags);
						if (tagsError) errors.push(tagsError);
						break;
					}

					case "aws-ec2": {
						const serviceName = getConfigProperty("serviceName") || "";
						const instanceType = getConfigProperty("instanceType") || "";
						const amiId = getConfigProperty("amiId") || "";
						const availabilityZone = getConfigProperty("availabilityZone") || "";

						const nameError = validateServiceName(serviceName, "EC2 Instance");
						if (nameError) errors.push(nameError);

						const instanceTypeError = validateInstanceType(instanceType);
						if (instanceTypeError) errors.push(instanceTypeError);

						const amiError = validateAMIId(amiId);
						if (amiError) errors.push(amiError);

						if (availabilityZone) {
							const azError = validateAvailabilityZone(availabilityZone);
							if (azError) errors.push(azError);
						}
						break;
					}

					case "aws-private-subnet":
					case "aws-public-subnet": {
						const serviceName = getConfigProperty("serviceName") || "";
						const cidrBlock = getConfigProperty("cidrBlock") || "";
						const availabilityZone = getConfigProperty("availabilityZone") || "";
						const tags = getConfigProperty("tags") || "";

						const resourceType = serviceId === "aws-private-subnet" ? "Private Subnet" : "Public Subnet";

						const nameError = validateServiceName(serviceName, resourceType);
						if (nameError) errors.push(nameError);

						const cidrError = validateCIDRBlock(cidrBlock, "subnet");
						if (cidrError) errors.push(cidrError);

						const azError = validateAvailabilityZone(availabilityZone);
						if (azError) errors.push(azError);

						const tagsError = validateTags(tags);
						if (tagsError) errors.push(tagsError);
						break;
					}

					case "aws-region": {
						const serviceName = getConfigProperty("serviceName") || "";
						const region = getConfigProperty("region") || "";
						const regionName = getConfigProperty("regionName") || "";

						const nameError = validateServiceName(serviceName, "Region");
						if (nameError) errors.push(nameError);

						const regionError = validateRegion(region);
						if (regionError) errors.push(regionError);

						if (!regionName.trim()) errors.push("Region name is required");
						break;
					}

					case "aws-availability-zone": {
						const serviceName = getConfigProperty("serviceName") || "";
						const region = getConfigProperty("region") || "";
						const availabilityZone = getConfigProperty("availabilityZone") || "";

						const nameError = validateServiceName(serviceName, "Availability Zone");
						if (nameError) errors.push(nameError);

						const regionError = validateRegion(region);
						if (regionError) errors.push(regionError);

						const azError = validateAvailabilityZone(availabilityZone);
						if (azError) errors.push(azError);
						break;
					}

					default:
						// Generic validation for unknown resource types
						const serviceName = getConfigProperty("serviceName") || "";
						if (!serviceName.trim()) errors.push("Service name is required");
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
					case "serviceName":
						return validateServiceName(stringValue, getResourceTypeName(serviceId));
					case "cidrBlock":
						const context = serviceId === "aws-vpc" ? "vpc" : "subnet";
						return validateCIDRBlock(stringValue, context);
					case "region":
						return validateRegion(stringValue);
					case "availabilityZone":
						return validateAvailabilityZone(stringValue);
					case "instanceType":
						return validateInstanceType(stringValue);
					case "amiId":
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
