import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AWSResourceConfiguration } from "@/lib/types/aws-resources";

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

				// Default validation for common AWS resources
				switch (serviceId) {
					case "aws-vpc":
						if (!getConfigProperty("name")?.trim()) errors.push("VPC name is required");
						if (!getConfigProperty("cidrBlock")?.trim()) errors.push("CIDR block is required");
						if (!getConfigProperty("region")?.trim()) errors.push("Region is required");
						break;

					case "aws-ec2":
						if (!getConfigProperty("name")?.trim()) errors.push("Instance name is required");
						if (!getConfigProperty("instanceType")?.trim())
							errors.push("Instance type is required");
						if (!getConfigProperty("amiId")?.trim()) errors.push("AMI ID is required");
						break;

					case "aws-private-subnet":
					case "aws-public-subnet":
						if (!getConfigProperty("name")?.trim()) errors.push("Subnet name is required");
						if (!getConfigProperty("cidrBlock")?.trim()) errors.push("CIDR block is required");
						if (!getConfigProperty("availabilityZone")?.trim())
							errors.push("Availability zone is required");
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

				if (!rule) return null;

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

				return null;
			},
		})),
		{
			name: "validation-store",
		}
	)
);

export type { ValidationRule };
