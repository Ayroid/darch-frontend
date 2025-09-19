"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrivateSubnetConfiguration } from "@/lib/types/aws-resources";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/hooks/use-auto-configuration";
import AutoConfigurationTooltip from "@/components/utilities/AutoConfigurationTooltip";
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";
import {
	addTag,
	handleTagChange,
	removeTag,
} from "@/components/utilities/ConfigurationSidebarUtils";
import { Button } from "@/components/ui/button";
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
				<div className="space-y-4">
					<div className="flex justify-end">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => addTag(config, (updatedConfig) => onChange(updatedConfig as PrivateSubnetConfiguration))}
						>
							+ Add Tag
						</Button>
					</div>

					{Object.entries(config.tags || {}).map(([key, value]) => (
						<div key={key} className="grid grid-cols-2 gap-3 p-3 border rounded-md">
							<div className="space-y-2">
								<Label>Key</Label>
								<Input
									value={key}
									onChange={(e) => {
										const oldKey = key;
										const newKey = e.target.value;
										if (newKey !== oldKey) {
											const newTags = { ...config.tags };
											delete newTags[oldKey];
											if (newKey.trim() !== "") {
												newTags[newKey] = value;
											}
											onChange({ ...config, tags: newTags });
										}
									}}
									placeholder="Tag key"
								/>
							</div>
							<div className="space-y-2">
								<Label>Value</Label>
								<Input
									value={value}
									onChange={(e) => handleTagChange(config, key, e.target.value, (updatedConfig) => onChange(updatedConfig as PrivateSubnetConfiguration))}
									placeholder="Tag value"
								/>
							</div>
							<div className="col-span-2 flex justify-end">
								<Button
									type="button"
									variant="ghost"
									onClick={() => removeTag(config, (updatedConfig) => onChange(updatedConfig as PrivateSubnetConfiguration), key)}
								>
									Remove
								</Button>
							</div>
						</div>
					))}

					{Object.keys(config.tags || {}).length === 0 && (
						<div className="text-center py-4 text-gray-500">
							<p>No tags configured. Click &quot;Add Tag&quot; to create your first tag.</p>
						</div>
					)}
				</div>
			</CollapsibleSection>
		</div>
	);
};

export default PrivateSubnetConfigurationForm;
