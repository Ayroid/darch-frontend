"use client";

import React from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EC2Configuration } from "@/lib/types/aws-resources";
import { ec2InstanceTypes, ebsVolumeTypes } from "@/lib/data/aws_ec2"
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/hooks/use-auto-configuration";

interface EC2ConfigurationFormProps {
	config: EC2Configuration;
	onChange: (config: EC2Configuration) => void;
}

const EC2ConfigurationForm: React.FC<EC2ConfigurationFormProps> = ({
	config,
	onChange,
}) => {
	const { nodeId } = useConfigurationContext();
	const { isFieldDisabled, getFieldInfo } = useAutoConfiguration({
		nodeId: nodeId || "",
		resourceType: "aws-ec2",
	});

	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);
	};

	// Get auto-configuration info for fields
	const availabilityZoneInfo = getFieldInfo("availabilityZone");
	const subnetIdInfo = getFieldInfo("subnetId");

	// const handleTagChange = (key: string, value: string) => {
	// 	const currentTags = config.tags || {};
	// 	if (value === "") {
	// 		const newTags = { ...currentTags };
	// 		delete newTags[key];
	// 		onChange({ ...config, tags: newTags });
	// 	} else {
	// 		onChange({
	// 			...config,
	// 			tags: { ...currentTags, [key]: value },
	// 		});
	// 	}
	// };

	// const addTag = () => {
	// 	const currentTags = config.tags || {};
	// 	const key = `Tag${Object.keys(currentTags).length + 1}`;
	// 	onChange({
	// 		...config,
	// 		tags: { ...currentTags, [key]: "" },
	// 	});
	// };

	return (
		<TooltipProvider>
			<div className="space-y-6">
			{/* Basic Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Basic Configuration
				</h3>

				<div className="space-y-2">
					<Label htmlFor="ec2-name">Instance Name<span className="text-red-600">*</span></Label>
					<Input
						id="ec2-name"
						value={config.resourceName || ""}
						onChange={(e) => handleFieldChange("resourceName", e.target.value)}
						placeholder="e.g., Web Server"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="instanceType">Instance Type<span className="text-red-600">*</span></Label>
					<Select
						value={config.instanceType || ""}
						onValueChange={(value) => handleFieldChange("instanceType", value)}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select instance type" />
						</SelectTrigger>
						<SelectContent>
							{ec2InstanceTypes.map((type) => (
								<SelectItem key={type} value={type}>
									{type}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="amiId">AMI ID<span className="text-red-600">*</span></Label>
					<Input
						id="amiId"
						value={config.amiId || ""}
						onChange={(e) => handleFieldChange("amiId", e.target.value)}
						placeholder="e.g., ami-0abcdef1234567890"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="keyPairName">Key Pair Name</Label>
					<Input
						id="keyPairName"
						value={config.keyPairName || ""}
						onChange={(e) => handleFieldChange("keyPairName", e.target.value)}
						placeholder="e.g., my-key-pair"
					/>
				</div>
			</div>

			{/* Instance Details */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Instance Details
				</h3>

				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Label htmlFor="availabilityZone">Availability Zone<span className="text-red-600">*</span></Label>
						{availabilityZoneInfo?.isAutoConfigured && (
							<Tooltip>
								<TooltipTrigger>
									<Badge variant="secondary" className="text-xs">
										Auto
									</Badge>
								</TooltipTrigger>
								<TooltipContent>
									<p>Auto-configured from {availabilityZoneInfo.sourceName} ({availabilityZoneInfo.sourceType})</p>
								</TooltipContent>
							</Tooltip>
						)}
					</div>
					<Input
						id="availabilityZone"
						value={config.availabilityZone || ""}
						onChange={(e) => handleFieldChange("availabilityZone", e.target.value)}
						placeholder="e.g., us-east-1a"
						disabled={isFieldDisabled("availabilityZone")}
					/>
					{isFieldDisabled("availabilityZone") && (
						<p className="text-xs text-muted-foreground">
							This field is automatically configured based on the container hierarchy.
						</p>
					)}
				</div>

				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Label htmlFor="subnetId">Subnet ID<span className="text-red-600">*</span></Label>
						{subnetIdInfo?.isAutoConfigured && (
							<Tooltip>
								<TooltipTrigger>
									<Badge variant="secondary" className="text-xs">
										Auto
									</Badge>
								</TooltipTrigger>
								<TooltipContent>
									<p>Auto-configured from {subnetIdInfo.sourceName} ({subnetIdInfo.sourceType})</p>
								</TooltipContent>
							</Tooltip>
						)}
					</div>
					<Input
						id="subnetId"
						value={config.subnetId || ""}
						onChange={(e) => handleFieldChange("subnetId", e.target.value)}
						placeholder="e.g., subnet-12345678"
						disabled={isFieldDisabled("subnetId")}
					/>
					{isFieldDisabled("subnetId") && (
						<p className="text-xs text-muted-foreground">
							This field is automatically configured based on the container hierarchy.
						</p>
					)}
				</div>

				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Label htmlFor="securityGroups">Security Groups<span className="text-red-600">*</span></Label>
						{getFieldInfo("securityGroups")?.isAutoConfigured && (
							<Tooltip>
								<TooltipTrigger>
									<Badge variant="secondary" className="text-xs">
										Auto
									</Badge>
								</TooltipTrigger>
								<TooltipContent>
									<p>Auto-configured from Security Group containers</p>
								</TooltipContent>
							</Tooltip>
						)}
					</div>
					<Textarea
						id="securityGroups"
						value={(config.securityGroups || []).join(", ")}
						onChange={(e) =>
							handleFieldChange(
								"securityGroups",
								e.target.value.split(", ").filter(Boolean)
							)
						}
						placeholder="sg-12345678, sg-87654321"
						className="min-h-[60px]"
						disabled={isFieldDisabled("securityGroups")}
					/>
					{isFieldDisabled("securityGroups") && (
						<p className="text-xs text-muted-foreground">
							This field is automatically configured from Security Group containers.
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="iamInstanceProfile">IAM Instance Profile<span className="text-red-600">*</span></Label>
					<Input
						id="iamInstanceProfile"
						value={config.iamInstanceProfile || ""}
						onChange={(e) => handleFieldChange("iamInstanceProfile", e.target.value)}
						placeholder="e.g., EC2-Instance-Profile"
					/>
				</div>
			</div>

			{/* Storage */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Storage
				</h3>

				<div className="space-y-2">
					<Label htmlFor="rootVolumeSize">Root Volume Size (GB)<span className="text-red-600">*</span></Label>
					<Input
						id="rootVolumeSize"
						type="number"
						value={config.rootVolumeSize || 8}
						onChange={(e) =>
							handleFieldChange("rootVolumeSize", parseInt(e.target.value) || 8)
						}
						placeholder="8"
						min="8"
						max="16384"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="rootVolumeType">Root Volume Type<span className="text-red-600">*</span></Label>
					<Select
						value={config.rootVolumeType || ""}
						onValueChange={(value) => handleFieldChange("rootVolumeType", value)}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select volume type" />
						</SelectTrigger>
						<SelectContent>
							{ebsVolumeTypes.map((type) => (
								<SelectItem key={type} value={type}>
									{type.toUpperCase()}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* <div className="flex items-center space-x-2">
					<Checkbox
						id="deleteOnTermination"
						checked={config.deleteOnTermination ?? false}
						onCheckedChange={(checked) =>
							handleFieldChange("deleteOnTermination", !!checked)
						}
					/>
					<Label htmlFor="deleteOnTermination">Delete on Termination</Label>
				</div> */}

				{/* <div className="flex items-center space-x-2">
					<Checkbox
						id="encrypted"
						checked={config.encrypted ?? false}
						onCheckedChange={(checked) => handleFieldChange("encrypted", !!checked)}
					/>
					<Label htmlFor="encrypted">Encrypted</Label>
				</div> */}
			</div>

			{/* Monitoring & Management */}
			{/* <div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Monitoring & Management
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="detailedMonitoring"
						checked={config.detailedMonitoring ?? false}
						onCheckedChange={(checked) =>
							handleFieldChange("detailedMonitoring", !!checked)
						}
					/>
					<Label htmlFor="detailedMonitoring">Detailed Monitoring</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="terminationProtection"
						checked={config.terminationProtection ?? false}
						onCheckedChange={(checked) =>
							handleFieldChange("terminationProtection", !!checked)
						}
					/>
					<Label htmlFor="terminationProtection">Termination Protection</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="autoRecovery"
						checked={config.autoRecovery ?? false}
						onCheckedChange={(checked) =>
							handleFieldChange("autoRecovery", !!checked)
						}
					/>
					<Label htmlFor="autoRecovery">Auto Recovery</Label>
				</div>
			</div> */}

			{/* User Data */}
			{/* <div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					User Data
				</h3>

				<div className="space-y-2">
					<Label htmlFor="userData">User Data Script</Label>
					<Textarea
						id="userData"
						value={config.userData || ""}
						onChange={(e) => handleFieldChange("userData", e.target.value)}
						placeholder="#!/bin/bash&#10;# Your bootstrap script here"
						className="min-h-[120px] font-mono text-sm"
					/>
				</div>
			</div> */}

			{/* Network Settings */}
			{/* <div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Network Settings
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="associatePublicIpAddress"
						checked={config.associatePublicIpAddress ?? false}
						onCheckedChange={(checked) =>
							handleFieldChange("associatePublicIpAddress", !!checked)
						}
					/>
					<Label htmlFor="associatePublicIpAddress">
						Associate Public IP Address
					</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="enhancedNetworking"
						checked={config.enhancedNetworking ?? false}
						onCheckedChange={(checked) =>
							handleFieldChange("enhancedNetworking", !!checked)
						}
					/>
					<Label htmlFor="enhancedNetworking">Enhanced Networking</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="sriovNetSupport"
						checked={config.sriovNetSupport ?? false}
						onCheckedChange={(checked) =>
							handleFieldChange("sriovNetSupport", !!checked)
						}
					/>
					<Label htmlFor="sriovNetSupport">SR-IOV Net Support</Label>
				</div>
			</div> */}

			{/* Placement */}
			{/* <div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Placement
				</h3>

				<div className="space-y-2">
					<Label htmlFor="tenancy">Tenancy</Label>
					<Select
						value={config.tenancy || ""}
						onValueChange={(value) => handleFieldChange("tenancy", value)}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select tenancy" />
						</SelectTrigger>
						<SelectContent>
							{tenancyOptions.map((option) => (
								<SelectItem key={option} value={option}>
									{option.charAt(0).toUpperCase() + option.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{config.tenancy === "host" && (
					<div className="space-y-2">
						<Label htmlFor="hostId">Host ID</Label>
						<Input
							id="hostId"
							value={config.hostId || ""}
							onChange={(e) => handleFieldChange("hostId", e.target.value)}
							placeholder="h-1234567890abcdef0"
						/>
					</div>
				)}
			</div> */}

			{/* Tags */}
			{/* <div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Tags
				</h3>

				<div className="space-y-2">
					{Object.entries(config.tags || {}).map(([key, value]) => (
						<div key={key} className="flex space-x-2">
							<Input
								value={key}
								onChange={(e) => {
									const currentTags = config.tags || {};
									const newKey = e.target.value;
									const newTags = { ...currentTags };
									delete newTags[key];
									if (newKey) {
										newTags[newKey] = value;
									}
									onChange({ ...config, tags: newTags });
								}}
								placeholder="Key"
								className="flex-1"
							/>
							<Input
								value={value}
								onChange={(e) => handleTagChange(key, e.target.value)}
								placeholder="Value"
								className="flex-1"
							/>
						</div>
					))}
					<button
						type="button"
						onClick={addTag}
						className="text-sm text-blue-600 hover:text-blue-800"
					>
						+ Add Tag
					</button>
				</div>
			</div> */}
			</div>
		</TooltipProvider>
	);
};

export default EC2ConfigurationForm;

// Export the configuration type
export type { EC2Configuration };
