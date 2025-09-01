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
import { Checkbox } from "@/components/ui/checkbox";
import { EC2Configuration } from "@/lib/types/aws-resources";

interface EC2ConfigurationFormProps {
	config: EC2Configuration;
	onChange: (config: EC2Configuration) => void;
}

const instanceTypes = [
	// General Purpose
	"t2.nano",
	"t2.micro",
	"t2.small",
	"t2.medium",
	"t2.large",
	"t2.xlarge",
	"t2.2xlarge",
	"t3.nano",
	"t3.micro",
	"t3.small",
	"t3.medium",
	"t3.large",
	"t3.xlarge",
	"t3.2xlarge",
	"t3a.nano",
	"t3a.micro",
	"t3a.small",
	"t3a.medium",
	"t3a.large",
	"t3a.xlarge",
	"t3a.2xlarge",
	"t4g.nano",
	"t4g.micro",
	"t4g.small",
	"t4g.medium",
	"t4g.large",
	"t4g.xlarge",
	"t4g.2xlarge",
	"m5.large",
	"m5.xlarge",
	"m5.2xlarge",
	"m5.4xlarge",
	"m5.8xlarge",
	"m5.12xlarge",
	"m5.16xlarge",
	"m5.24xlarge",
	"m5a.large",
	"m5a.xlarge",
	"m5a.2xlarge",
	"m5a.4xlarge",
	"m5a.8xlarge",
	"m5a.12xlarge",
	"m5a.16xlarge",
	"m5a.24xlarge",

	// Compute Optimized
	"c5.large",
	"c5.xlarge",
	"c5.2xlarge",
	"c5.4xlarge",
	"c5.9xlarge",
	"c5.12xlarge",
	"c5.18xlarge",
	"c5.24xlarge",
	"c5n.large",
	"c5n.xlarge",
	"c5n.2xlarge",
	"c5n.4xlarge",
	"c5n.9xlarge",
	"c5n.18xlarge",

	// Memory Optimized
	"r5.large",
	"r5.xlarge",
	"r5.2xlarge",
	"r5.4xlarge",
	"r5.8xlarge",
	"r5.12xlarge",
	"r5.16xlarge",
	"r5.24xlarge",
	"x1.16xlarge",
	"x1.32xlarge",
	"x1e.xlarge",
	"x1e.2xlarge",
	"x1e.4xlarge",
	"x1e.8xlarge",
	"x1e.16xlarge",
	"x1e.32xlarge",

	// Storage Optimized
	"i3.large",
	"i3.xlarge",
	"i3.2xlarge",
	"i3.4xlarge",
	"i3.8xlarge",
	"i3.16xlarge",
	"d2.xlarge",
	"d2.2xlarge",
	"d2.4xlarge",
	"d2.8xlarge",
] as const;

const volumeTypes = [
	"gp2",
	"gp3",
	"io1",
	"io2",
	"st1",
	"sc1",
	"standard",
] as const;
const tenancyOptions = ["default", "dedicated", "host"] as const;

const EC2ConfigurationForm: React.FC<EC2ConfigurationFormProps> = ({
	config,
	onChange,
}) => {
	const updateConfig = (
		key: keyof EC2Configuration,
		value: EC2Configuration[keyof EC2Configuration]
	) => {
		const updatedConfig = { ...config, [key]: value };
		onChange(updatedConfig);
	};

	const handleTagChange = (key: string, value: string) => {
		const currentTags = config.tags || {};
		if (value === "") {
			const newTags = { ...currentTags };
			delete newTags[key];
			onChange({ ...config, tags: newTags });
		} else {
			onChange({
				...config,
				tags: { ...currentTags, [key]: value },
			});
		}
	};

	const addTag = () => {
		const currentTags = config.tags || {};
		const key = `Tag${Object.keys(currentTags).length + 1}`;
		onChange({
			...config,
			tags: { ...currentTags, [key]: "" },
		});
	};

	return (
		<div className="space-y-6">
			{/* Basic Configuration */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Basic Configuration
				</h3>

				<div className="space-y-2">
					<Label htmlFor="ec2-name">Name</Label>
					<Input
						id="ec2-name"
						value={config.serviceName || ""}
						onChange={(e) => updateConfig("serviceName", e.target.value)}
						placeholder="e.g., Web Server"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="instanceType">Instance Type</Label>
					<Select
						value={config.instanceType || ""}
						onValueChange={(value) => updateConfig("instanceType", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select instance type" />
						</SelectTrigger>
						<SelectContent>
							{instanceTypes.map((type) => (
								<SelectItem key={type} value={type}>
									{type}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="amiId">AMI ID</Label>
					<Input
						id="amiId"
						value={config.amiId || ""}
						onChange={(e) => updateConfig("amiId", e.target.value)}
						placeholder="e.g., ami-0abcdef1234567890"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="keyPairName">Key Pair Name</Label>
					<Input
						id="keyPairName"
						value={config.keyPairName || ""}
						onChange={(e) => updateConfig("keyPairName", e.target.value)}
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
					<Label htmlFor="availabilityZone">Availability Zone</Label>
					<Input
						id="availabilityZone"
						value={config.availabilityZone || ""}
						onChange={(e) => updateConfig("availabilityZone", e.target.value)}
						placeholder="e.g., us-east-1a"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="subnetId">Subnet ID</Label>
					<Input
						id="subnetId"
						value={config.subnetId || ""}
						onChange={(e) => updateConfig("subnetId", e.target.value)}
						placeholder="e.g., subnet-12345678"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="securityGroups">Security Groups</Label>
					<Textarea
						id="securityGroups"
						value={(config.securityGroups || []).join(", ")}
						onChange={(e) =>
							updateConfig(
								"securityGroups",
								e.target.value.split(", ").filter(Boolean)
							)
						}
						placeholder="sg-12345678, sg-87654321"
						className="min-h-[60px]"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="iamInstanceProfile">IAM Instance Profile</Label>
					<Input
						id="iamInstanceProfile"
						value={config.iamInstanceProfile || ""}
						onChange={(e) => updateConfig("iamInstanceProfile", e.target.value)}
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
					<Label htmlFor="rootVolumeSize">Root Volume Size (GB)</Label>
					<Input
						id="rootVolumeSize"
						type="number"
						value={config.rootVolumeSize || 8}
						onChange={(e) =>
							updateConfig("rootVolumeSize", parseInt(e.target.value) || 8)
						}
						placeholder="8"
						min="8"
						max="16384"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="rootVolumeType">Root Volume Type</Label>
					<Select
						value={config.rootVolumeType || ""}
						onValueChange={(value) => updateConfig("rootVolumeType", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select volume type" />
						</SelectTrigger>
						<SelectContent>
							{volumeTypes.map((type) => (
								<SelectItem key={type} value={type}>
									{type.toUpperCase()}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="deleteOnTermination"
						checked={config.deleteOnTermination ?? false}
						onCheckedChange={(checked) =>
							updateConfig("deleteOnTermination", !!checked)
						}
					/>
					<Label htmlFor="deleteOnTermination">Delete on Termination</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="encrypted"
						checked={config.encrypted ?? false}
						onCheckedChange={(checked) => updateConfig("encrypted", !!checked)}
					/>
					<Label htmlFor="encrypted">Encrypted</Label>
				</div>
			</div>

			{/* Monitoring & Management */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Monitoring & Management
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="detailedMonitoring"
						checked={config.detailedMonitoring ?? false}
						onCheckedChange={(checked) =>
							updateConfig("detailedMonitoring", !!checked)
						}
					/>
					<Label htmlFor="detailedMonitoring">Detailed Monitoring</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="terminationProtection"
						checked={config.terminationProtection ?? false}
						onCheckedChange={(checked) =>
							updateConfig("terminationProtection", !!checked)
						}
					/>
					<Label htmlFor="terminationProtection">Termination Protection</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="autoRecovery"
						checked={config.autoRecovery ?? false}
						onCheckedChange={(checked) =>
							updateConfig("autoRecovery", !!checked)
						}
					/>
					<Label htmlFor="autoRecovery">Auto Recovery</Label>
				</div>
			</div>

			{/* User Data */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					User Data
				</h3>

				<div className="space-y-2">
					<Label htmlFor="userData">User Data Script</Label>
					<Textarea
						id="userData"
						value={config.userData || ""}
						onChange={(e) => updateConfig("userData", e.target.value)}
						placeholder="#!/bin/bash&#10;# Your bootstrap script here"
						className="min-h-[120px] font-mono text-sm"
					/>
				</div>
			</div>

			{/* Network Settings */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Network Settings
				</h3>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="associatePublicIpAddress"
						checked={config.associatePublicIpAddress ?? false}
						onCheckedChange={(checked) =>
							updateConfig("associatePublicIpAddress", !!checked)
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
							updateConfig("enhancedNetworking", !!checked)
						}
					/>
					<Label htmlFor="enhancedNetworking">Enhanced Networking</Label>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="sriovNetSupport"
						checked={config.sriovNetSupport ?? false}
						onCheckedChange={(checked) =>
							updateConfig("sriovNetSupport", !!checked)
						}
					/>
					<Label htmlFor="sriovNetSupport">SR-IOV Net Support</Label>
				</div>
			</div>

			{/* Placement */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Placement
				</h3>

				<div className="space-y-2">
					<Label htmlFor="tenancy">Tenancy</Label>
					<Select
						value={config.tenancy || ""}
						onValueChange={(value) => updateConfig("tenancy", value)}
					>
						<SelectTrigger>
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
							onChange={(e) => updateConfig("hostId", e.target.value)}
							placeholder="h-1234567890abcdef0"
						/>
					</div>
				)}
			</div>

			{/* Tags */}
			<div className="space-y-4">
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
			</div>
		</div>
	);
};

export default EC2ConfigurationForm;

// Export the configuration type
export type { EC2Configuration };
