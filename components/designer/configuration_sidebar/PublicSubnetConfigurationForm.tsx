"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicSubnetConfiguration } from "@/lib/types/aws-resources";
import { useConfigurationContext } from "@/lib/stores";
import { useAutoConfiguration } from "@/hooks/use-auto-configuration";
import AutoConfigurationTooltip from "@/components/utilities/AutoConfigurationTooltip";

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
		<div className="space-y-4">
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

			{/* VPC ID */}
			<div className="space-y-2">
				<Label htmlFor="vpc-id">
					VPC ID <span className="text-red-600">*</span>
				</Label>
				<div className="relative">
					<Input
						id="vpc-id"
						placeholder="vpc-xxxxxxxxx"
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

			{/* Region */}
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
						onChange={(e) => handleFieldChange("awsRegionId", e.target.value)}
						disabled={isFieldDisabled("awsRegionId")}
					/>
					{isFieldDisabled("awsRegionId") && (
						<div className="absolute top-1/2 right-2 transform -translate-y-1/2">
							<AutoConfigurationTooltip parentContainer="Region" />
						</div>
					)}
				</div>
			</div>

			{/* Availability Zone */}
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

			{/* Description */}
			{/* <div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="Subnet description"
					value={(config.description as string) || ""}
					onChange={(e) => handleFieldChange("description", e.target.value)}
				/>
			</div> */}

			{/* NAT Gateway */}
			{/* <div className="flex items-center space-x-2">
				<Checkbox
					id="nat-gateway"
					checked={(config.enableNatGateway as boolean) ?? false}
					onCheckedChange={(checked) =>
						handleFieldChange("enableNatGateway", checked)
					}
				/>
				<Label htmlFor="nat-gateway">Enable NAT Gateway</Label>
			</div> */}

			{/* Tags */}
			{/* <div className="space-y-2">
				<Label htmlFor="tags">Tags (key=value, separated by commas)</Label>
				<Textarea
					id="tags"
					placeholder="Environment=Production, Type=Public"
					value={(config.tags as string) || ""}
					onChange={(e) => handleFieldChange("tags", e.target.value)}
				/>
			</div> */}
		</div>
	);
};

export default PublicSubnetConfigurationForm;
