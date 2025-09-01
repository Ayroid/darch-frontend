"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { VPCConfiguration } from "@/lib/types/aws-resources";
import { AWS_REGIONS_WITH_NAMES } from "@/lib/data/aws_regions";
import { useFormValidation } from "@/lib/stores/hooks/use-form-validation";
import { useConfigurationContext } from "@/lib/stores";

interface VPCConfigurationFormProps {
	config: VPCConfiguration;
	onChange: (config: VPCConfiguration) => void;
}

const VPCConfigurationForm: React.FC<VPCConfigurationFormProps> = ({
	config,
	onChange,
}) => {
	// Get context and validation
	const { nodeId, serviceId } = useConfigurationContext();
	const { validateField } = useFormValidation(nodeId, serviceId || "", config);

	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);

		// Validate the field on change
		validateField(field, value);
	};

	return (
		<div className="space-y-4">
			{/* Status indicator */}

			<div className="space-y-2">
				<Label htmlFor="vpc-name">
					VPC Name <span className="text-red-600">*</span>
				</Label>
				<Input
					id="vpc-name"
					placeholder="Enter VPC name"
					value={config.serviceName || ""}
					onChange={(e) => handleFieldChange("serviceName", e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="region">
					Region <span className="text-red-600">*</span>
				</Label>
				<Select
					value={config.region || ""}
					onValueChange={(value) => handleFieldChange("region", value)}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select region" />
					</SelectTrigger>
					<SelectContent>
						{AWS_REGIONS_WITH_NAMES.map((region) => (
							<SelectItem key={region.region} value={region.region}>
								{region.region}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="cidr-block">
					CIDR Block <span className="text-red-600">*</span>
				</Label>
				<Input
					id="cidr-block"
					placeholder="10.0.0.0/16"
					value={config.cidrBlock || ""}
					onChange={(e) => handleFieldChange("cidrBlock", e.target.value)}
				/>
			</div>

			{/* <div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="VPC description (optional)"
					value={config.description || ""}
					onChange={(e) => updateConfig("description", e.target.value)}
					rows={3}
				/>
			</div> */}

			{/* <div className="space-y-3">
				<h4 className="text-sm font-medium text-gray-900">DNS Settings</h4>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="dns-support"
						checked={config.enableDnsSupport ?? true}
						onCheckedChange={(checked) =>
							updateConfig("enableDnsSupport", !!checked)
						}
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
						checked={config.enableDnsHostnames ?? true}
						onCheckedChange={(checked) =>
							updateConfig("enableDnsHostnames", !!checked)
						}
					/>
					<Label htmlFor="dns-hostnames" className="text-sm">
						Enable DNS Hostnames
					</Label>
				</div>
				<p className="text-xs text-gray-500 ml-6">
					Assigns public DNS hostnames to instances with public IP addresses
				</p>
			</div> */}

			{/* <div className="space-y-2">
				<Label
					htmlFor="tags"
					className={validationErrors.tags ? "text-red-600" : ""}
				>
					Tags
				</Label>
				<Textarea
					id="tags"
					placeholder="Environment=Production, Owner=TeamA, Project=WebApp"
					value={config.tags || ""}
					onChange={(e) => updateConfig("tags", e.target.value)}
					className={
						validationErrors.tags ? "border-red-300 focus:border-red-500" : ""
					}
					rows={2}
				/>
				{validationErrors.tags && (
					<p className="text-sm text-red-600">{validationErrors.tags}</p>
				)}
				<p className="text-xs text-gray-500">
					Format: key=value, separated by commas
				</p>
			</div> */}
		</div>
	);
};

export default VPCConfigurationForm;

// Export the configuration type
export type { VPCConfiguration };
