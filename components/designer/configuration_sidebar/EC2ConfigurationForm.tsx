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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { EC2Configuration } from "@/lib/types/aws-resources";
import { ec2InstanceTypes, ebsVolumeTypes } from "@/lib/data/aws_ec2";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/hooks/use-auto-configuration";
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";
import AutoConfigurationTooltip from "@/components/utilities/AutoConfigurationTooltip";
import { TbSettings } from "react-icons/tb";
import { FiCpu, FiDatabase } from "react-icons/fi";

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
	const regionInfo = getFieldInfo("awsRegionId");
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
			<div className="space-y-6 py-4">
				{/* Auto-configured fields section */}
				{(isFieldDisabled("awsRegionId") ||
					isFieldDisabled("awsAvailabilityZone") ||
					isFieldDisabled("subnetId") ||
					isFieldDisabled("securityGroups")) && (
					<CollapsibleSection title="Auto Configured Fields" defaultOpen={true}>
						{/* AWS Region */}
						{isFieldDisabled("awsRegionId") && (
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="region">
										AWS Region <span className="text-red-600">*</span>
									</Label>
								</div>
								<div className="relative">
									<Input
										id="region"
										placeholder="Enter AWS region"
										value={config.awsRegionId || ""}
										onChange={(e) =>
											handleFieldChange("awsRegionId", e.target.value)
										}
										disabled={isFieldDisabled("awsRegionId")}
									/>
									{isFieldDisabled("awsRegionId") && (
										<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
											<AutoConfigurationTooltip parentContainer="Region" />
										</div>
									)}
								</div>
							</div>
						)}

						{/* Availability Zone - auto-configured */}
						{isFieldDisabled("awsAvailabilityZone") && (
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="availability-zone">
										AWS Availability Zone{" "}
										<span className="text-red-600">*</span>
									</Label>
								</div>
								<div className="relative">
									<Input
										id="availability-zone"
										placeholder="Enter AWS availability zone"
										value={config.awsAvailabilityZone || ""}
										onChange={(e) =>
											handleFieldChange("awsAvailabilityZone", e.target.value)
										}
										disabled={isFieldDisabled("awsAvailabilityZone")}
									/>
									{isFieldDisabled("awsAvailabilityZone") && (
										<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
											<AutoConfigurationTooltip parentContainer="Availability Zone" />
										</div>
									)}
								</div>
							</div>
						)}

						{/* Subnet ID */}
						{isFieldDisabled("subnetId") && (
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="subnetId">
										Subnet ID <span className="text-red-600">*</span>
									</Label>
								</div>
								<div className="relative">
									<Input
										id="subnetId"
										placeholder="e.g., subnet-12345678"
										value={config.subnetId || ""}
										onChange={(e) =>
											handleFieldChange("subnetId", e.target.value)
										}
										disabled={isFieldDisabled("subnetId")}
									/>
									{isFieldDisabled("subnetId") && (
										<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
											<AutoConfigurationTooltip parentContainer="Subnet" />
										</div>
									)}
								</div>
							</div>
						)}

						{/* Security Groups */}
						{isFieldDisabled("securityGroups") && (
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="securityGroups">
										Security Groups<span className="text-red-600">*</span>
									</Label>
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
										This field is automatically configured from Security Group
										containers.
									</p>
								)}
							</div>
						)}
					</CollapsibleSection>
				)}

				{/* Basic Configuration */}
				<div className="space-y-4 px-4 pb-4 border-b">
					<div className="flex items-center space-x-2 pb-2">
						<TbSettings className="w-6 h-6 text-gray-600" />
						<h3 className="font-medium text-gray-900">Basic Configuration</h3>
					</div>

					<div className="space-y-2">
						<Label htmlFor="ec2-name">
							Instance Name<span className="text-red-600">*</span>
						</Label>
						<Input
							id="ec2-name"
							value={config.awsEc2Id || ""}
							onChange={(e) => handleFieldChange("awsEc2Id", e.target.value)}
							placeholder="e.g., Web Server"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="instanceType">
							Instance Type<span className="text-red-600">*</span>
						</Label>
						<Select
							value={config.instanceType || ""}
							onValueChange={(value) =>
								handleFieldChange("instanceType", value)
							}
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
						<Label htmlFor="amiId">
							AMI ID<span className="text-red-600">*</span>
						</Label>
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
				<div className="space-y-4 px-4 pb-4 border-b">
					<div className="flex items-center space-x-2 pb-2">
						<FiCpu className="w-6 h-6 text-gray-600" />
						<h3 className="font-medium text-gray-900">Instance Details</h3>
					</div>

					{/* AWS Region - only show if not auto-configured */}
					{!isFieldDisabled("awsRegionId") && (
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Label htmlFor="region">
									AWS Region<span className="text-red-600">*</span>
								</Label>
								{regionInfo?.isAutoConfigured && (
									<Tooltip>
										<TooltipTrigger>
											<Badge variant="secondary" className="text-xs">
												Auto
											</Badge>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												Auto-configured from {regionInfo.sourceName} (
												{regionInfo.sourceType})
											</p>
										</TooltipContent>
									</Tooltip>
								)}
							</div>
							<Input
								id="region"
								value={config.awsRegionId || ""}
								onChange={(e) =>
									handleFieldChange("awsRegionId", e.target.value)
								}
								placeholder="e.g., us-east-1"
								disabled={isFieldDisabled("awsRegionId")}
							/>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="iamInstanceProfile">
							IAM Instance Profile<span className="text-red-600">*</span>
						</Label>
						<Input
							id="iamInstanceProfile"
							value={config.iamInstanceProfile || ""}
							onChange={(e) =>
								handleFieldChange("iamInstanceProfile", e.target.value)
							}
							placeholder="e.g., EC2-Instance-Profile"
						/>
					</div>
				</div>

				{/* Storage */}
				<div className="space-y-4 px-4 pb-4">
					<div className="flex items-center space-x-2 pb-2">
						<FiDatabase className="w-6 h-6 text-gray-600" />
						<h3 className="font-medium text-gray-900">Storage</h3>
					</div>

					<div className="space-y-2">
						<Label htmlFor="rootVolumeSize">
							Root Volume Size (GB)<span className="text-red-600">*</span>
						</Label>
						<Input
							id="rootVolumeSize"
							type="number"
							value={config.rootVolumeSize || 8}
							onChange={(e) =>
								handleFieldChange(
									"rootVolumeSize",
									parseInt(e.target.value) || 8
								)
							}
							placeholder="8"
							min="8"
							max="16384"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="rootVolumeType">
							Root Volume Type<span className="text-red-600">*</span>
						</Label>
						<Select
							value={config.rootVolumeType || ""}
							onValueChange={(value) =>
								handleFieldChange("rootVolumeType", value)
							}
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
				</div>
			</div>
		</TooltipProvider>
	);
};

export default EC2ConfigurationForm;

// Export the configuration type
export type { EC2Configuration };
