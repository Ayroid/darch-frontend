"use client";

import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { VPCConfiguration } from "@/lib/types/aws-resources";

const awsRegions = [
	"us-east-1", "us-east-2", "us-west-1", "us-west-2",
	"eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1", "eu-north-1",
	"ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2", "ap-south-1",
	"ca-central-1", "sa-east-1", "af-south-1", "me-south-1",
];

interface VPCConfigurationFormProps {
	config: Record<string, unknown>;
	onChange: (config: Record<string, unknown>) => void;
}

// Validation functions
const validateCIDRBlock = (cidr: string): string | null => {
	if (!cidr) return "CIDR block is required";

	const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
	if (!cidrRegex.test(cidr)) return "Invalid CIDR format (e.g., 10.0.0.0/16)";

	const [ip, mask] = cidr.split('/');
	const maskNum = parseInt(mask, 10);

	if (maskNum < 16 || maskNum > 28) {
		return "VPC CIDR mask must be between /16 and /28";
	}

	// Validate IP octets
	const octets = ip.split('.').map(num => parseInt(num, 10));
	if (octets.some(octet => octet < 0 || octet > 255)) {
		return "Invalid IP address in CIDR block";
	}

	return null;
};

const validateVPCName = (name: string): string | null => {
	if (!name.trim()) return "VPC name is required";
	if (name.length > 255) return "VPC name must be less than 255 characters";
	return null;
};

const validateTags = (tags: string): string | null => {
	// Ensure tags is a string and handle empty/undefined cases
	if (!tags || typeof tags !== 'string' || !tags.trim()) return null;

	const tagPairs = tags.split(',').map(tag => tag.trim());
	for (const pair of tagPairs) {
		if (!pair.includes('=')) {
			return "Tags must be in format: key=value, separated by commas";
		}
		const [key, value] = pair.split('=');
		if (!key.trim() || !value.trim()) {
			return "Tag keys and values cannot be empty";
		}
	}
	return null;
};

const VPCConfigurationForm: React.FC<VPCConfigurationFormProps> = ({
	config,
	onChange,
}) => {
	// Type-safe access to config properties with defaults
	const vpcConfig = config as unknown as VPCConfiguration;

	// Validation state
	const validationErrors = useMemo(() => {
		const errors: Record<string, string> = {};

		const nameError = validateVPCName(String(vpcConfig.name || ""));
		if (nameError) errors.name = nameError;

		const cidrError = validateCIDRBlock(String(vpcConfig.cidrBlock || ""));
		if (cidrError) errors.cidrBlock = cidrError;

		const tagsError = validateTags(String(vpcConfig.tags || ""));
		if (tagsError) errors.tags = tagsError;

		if (!vpcConfig.region) errors.region = "Region is required";

		return errors;
	}, [vpcConfig]);

	const updateConfig = (key: keyof VPCConfiguration, value: VPCConfiguration[keyof VPCConfiguration]) => {
		onChange({ ...config, [key]: value });
	};

	const hasErrors = Object.keys(validationErrors).length > 0;

	return (
		<div className="space-y-4">
			{/* Status indicator */}
			{hasErrors && (
				<div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
					<p className="text-sm text-amber-800">
						Please fix the validation errors below
					</p>
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="vpc-name" className={validationErrors.name ? "text-red-600" : ""}>
					VPC Name *
				</Label>
				<Input
					id="vpc-name"
					placeholder="Enter VPC name"
					value={String(vpcConfig.name || "")}
					onChange={(e) => updateConfig("name", e.target.value)}
					className={validationErrors.name ? "border-red-300 focus:border-red-500" : ""}
				/>
				{validationErrors.name && (
					<p className="text-sm text-red-600">{validationErrors.name}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="cidr-block" className={validationErrors.cidrBlock ? "text-red-600" : ""}>
					CIDR Block *
				</Label>
				<Input
					id="cidr-block"
					placeholder="10.0.0.0/16"
					value={String(vpcConfig.cidrBlock || "")}
					onChange={(e) => updateConfig("cidrBlock", e.target.value)}
					className={validationErrors.cidrBlock ? "border-red-300 focus:border-red-500" : ""}
				/>
				{validationErrors.cidrBlock && (
					<p className="text-sm text-red-600">{validationErrors.cidrBlock}</p>
				)}
				<p className="text-xs text-gray-500">
					Recommended: 10.0.0.0/16, 172.16.0.0/16, or 192.168.0.0/16
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="region" className={validationErrors.region ? "text-red-600" : ""}>
					Region *
				</Label>
				<Select
					value={String(vpcConfig.region || "")}
					onValueChange={(value) => updateConfig("region", value)}
				>
					<SelectTrigger className={validationErrors.region ? "border-red-300 focus:border-red-500" : ""}>
						<SelectValue placeholder="Select region" />
					</SelectTrigger>
					<SelectContent>
						{awsRegions.map((region) => (
							<SelectItem key={region} value={region}>
								{region}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{validationErrors.region && (
					<p className="text-sm text-red-600">{validationErrors.region}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="VPC description (optional)"
					value={String(vpcConfig.description || "")}
					onChange={(e) => updateConfig("description", e.target.value)}
					rows={3}
				/>
			</div>

			<div className="space-y-3">
				<h4 className="text-sm font-medium text-gray-900">DNS Settings</h4>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="dns-support"
						checked={(vpcConfig.enableDnsSupport as boolean) ?? true}
						onCheckedChange={(checked) => updateConfig("enableDnsSupport", checked)}
					/>
					<Label htmlFor="dns-support" className="text-sm">
						Enable DNS Support
					</Label>
				</div>
				<p className="text-xs text-gray-500 ml-6">
					Required for DNS resolution within the VPC
				</p>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="dns-hostnames"
						checked={(vpcConfig.enableDnsHostnames as boolean) ?? true}
						onCheckedChange={(checked) => updateConfig("enableDnsHostnames", checked)}
					/>
					<Label htmlFor="dns-hostnames" className="text-sm">
						Enable DNS Hostnames
					</Label>
				</div>
				<p className="text-xs text-gray-500 ml-6">
					Assigns public DNS hostnames to instances with public IP addresses
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="tags" className={validationErrors.tags ? "text-red-600" : ""}>
					Tags
				</Label>
				<Textarea
					id="tags"
					placeholder="Environment=Production, Owner=TeamA, Project=WebApp"
					value={String(vpcConfig.tags || "")}
					onChange={(e) => updateConfig("tags", e.target.value)}
					className={validationErrors.tags ? "border-red-300 focus:border-red-500" : ""}
					rows={2}
				/>
				{validationErrors.tags && (
					<p className="text-sm text-red-600">{validationErrors.tags}</p>
				)}
				<p className="text-xs text-gray-500">
					Format: key=value, separated by commas
				</p>
			</div>
		</div>
	);
}

export default VPCConfigurationForm;

// Re-export the type for backward compatibility
export type { VPCConfiguration } from "@/lib/types/aws-resources";