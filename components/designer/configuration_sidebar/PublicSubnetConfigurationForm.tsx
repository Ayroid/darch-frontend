"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicSubnetConfiguration } from "@/lib/types/aws-resources";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/hooks/use-auto-configuration";
import AutoConfigurationTooltip from "@/components/utilities/AutoConfigurationTooltip";
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";

interface PublicSubnetConfigurationFormProps {
	config: PublicSubnetConfiguration;
	onChange: (config: PublicSubnetConfiguration) => void;
}

const PublicSubnetConfigurationForm: React.FC<
	PublicSubnetConfigurationFormProps
> = ({ config, onChange }) => {
	const { nodeId } = useConfigurationContext();
	const { isFieldDisabled } = useAutoConfiguration({
		nodeId: nodeId || "",
		resourceType: "aws-public-subnet",
	});

	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);
	};

	return (
		<div className="space-y-6">
			{/* Auto-configured fields section */}
			{(isFieldDisabled("awsVpcId") ||
				isFieldDisabled("awsRegionId") ||
				isFieldDisabled("awsAvailabilityZone")) && (
				<CollapsibleSection title="Auto Configured Fields" defaultOpen={true}>
					{/* VPC ID - auto-configured */}
					{isFieldDisabled("awsVpcId") && (
						<div className="space-y-2">
							<Label htmlFor="vpc-id">
								VPC ID <span className="text-red-600">*</span>
							</Label>
							<div className="relative">
								<Input
									id="vpc-id"
									placeholder="e.g., vpc-0abc123def456"
									value={config.awsVpcId || ""}
									onChange={(e) =>
										handleFieldChange("awsVpcId", e.target.value)
									}
									disabled={isFieldDisabled("awsVpcId")}
								/>
								{isFieldDisabled("awsVpcId") && (
									<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
										<AutoConfigurationTooltip parentContainer="VPC" />
									</div>
								)}
							</div>
						</div>
					)}

					{/* Region - auto-configured */}
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
									AWS Availability Zone <span className="text-red-600">*</span>
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
				</CollapsibleSection>
			)}

			{/* Manual configuration fields */}
			<div className="space-y-4">
				<h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
					Subnet Configuration
				</h3>

				{/* Subnet Name */}
				<div className="space-y-2">
					<Label htmlFor="subnet-name">
						Subnet Name <span className="text-red-600">*</span>
					</Label>
					<Input
						id="subnet-name"
						placeholder="Enter public subnet name"
						value={config.awsPublicSubnetId || ""}
						onChange={(e) =>
							handleFieldChange("awsPublicSubnetId", e.target.value)
						}
					/>
				</div>

				{/* VPC ID - only show if not auto-configured */}
				{!isFieldDisabled("awsVpcId") && (
					<div className="space-y-2">
						<Label htmlFor="vpc-id">
							VPC ID <span className="text-red-600">*</span>
						</Label>
						<div className="relative">
							<Input
								id="vpc-id"
								placeholder="e.g., vpc-0abc123def456"
								value={config.awsVpcId || ""}
								onChange={(e) => handleFieldChange("awsVpcId", e.target.value)}
								disabled={isFieldDisabled("awsVpcId")}
							/>
							{isFieldDisabled("awsVpcId") && (
								<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
									<AutoConfigurationTooltip parentContainer="VPC" />
								</div>
							)}
						</div>
					</div>
				)}

				{/* CIDR Block */}
				<div className="space-y-2">
					<Label htmlFor="cidr-block">
						CIDR Block <span className="text-red-600">*</span>
					</Label>
					<Input
						id="cidr-block"
						placeholder="10.0.0.0/24"
						value={config.cidrBlock || ""}
						onChange={(e) => handleFieldChange("cidrBlock", e.target.value)}
					/>
				</div>

				{/* Region - only show if not auto-configured */}
				{!isFieldDisabled("awsRegionId") && (
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

				{/* Availability Zone - only show if not auto-configured */}
				{!isFieldDisabled("awsAvailabilityZone") && (
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label htmlFor="availability-zone">
								AWS Availability Zone <span className="text-red-600">*</span>
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
			</div>
		</div>
	);
};

export default PublicSubnetConfigurationForm;
