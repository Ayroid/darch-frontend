"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrivateSubnetConfiguration } from "@/lib/types/aws-resources";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/hooks/use-auto-configuration";
import AutoConfigurationTooltip from "@/components/utilities/AutoConfigurationTooltip";
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";
import { TbSettingsSpark, TbSettings } from "react-icons/tb";
import { FiGlobe } from "react-icons/fi";

interface PrivateSubnetConfigurationFormProps {
	config: PrivateSubnetConfiguration;
	onChange: (config: PrivateSubnetConfiguration) => void;
}

const PrivateSubnetConfigurationForm: React.FC<
	PrivateSubnetConfigurationFormProps
> = ({ config, onChange }) => {
	const { nodeId } = useConfigurationContext();
	const { isFieldDisabled } = useAutoConfiguration({
		nodeId: nodeId || "",
		resourceType: "aws-private-subnet",
	});

	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);
	};

	return (
		<div className="space-y-4 py-4">
			{/* Auto Configured Fields */}
			{(isFieldDisabled("awsVpcId") ||
				isFieldDisabled("awsRegionId") ||
				isFieldDisabled("awsAvailabilityZone")) && (
				<CollapsibleSection
					title="Auto Configured Fields"
					icon={<TbSettingsSpark className="w-6 h-6 text-gray-600" />}
					defaultOpen={true}
				>
					<div className="space-y-4">
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
					</div>
				</CollapsibleSection>
			)}

			{/* Subnet Configuration */}
			<CollapsibleSection
				title="Subnet Configuration"
				icon={<FiGlobe className="w-6 h-6 text-gray-600" />}
				defaultOpen={true}
				borderbottom={false}
			>
				<div className="space-y-4">
					{/* Subnet Name */}
					<div className="space-y-2">
						<Label htmlFor="subnet-name">
							Subnet Name <span className="text-red-600">*</span>
						</Label>
						<Input
							id="subnet-name"
							placeholder="Enter private subnet name"
							value={config.awsPrivateSubnetId || ""}
							onChange={(e) =>
								handleFieldChange("awsPrivateSubnetId", e.target.value)
							}
						/>
					</div>

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
				</div>
			</CollapsibleSection>

			{/* Tags section */}
			<CollapsibleSection
				title="Tags"
				defaultOpen={false}
				icon={<TbSettings className="w-6 h-6 text-gray-600" />}
			>
				<div className="space-y-2">
					<Label htmlFor="tags">Tags</Label>
					<Input
						id="tags"
						placeholder="key1=value1,key2=value2"
						value={config.tags || ""}
						onChange={(e) => handleFieldChange("tags", e.target.value)}
					/>
					<p className="text-sm text-gray-500">
						Enter comma-separated key=value pairs
					</p>
				</div>
			</CollapsibleSection>
		</div>
	);
};

export default PrivateSubnetConfigurationForm;
