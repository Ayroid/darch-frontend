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
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
import { PrivateSubnetConfiguration } from "@/lib/types/aws-resources";
import { AWS_REGIONS_WITH_AZS } from "@/lib/data/aws_data";

interface PrivateSubnetConfigurationFormProps {
	config: PrivateSubnetConfiguration;
	onChange: (config: PrivateSubnetConfiguration) => void;
}

const PrivateSubnetConfigurationForm: React.FC<
	PrivateSubnetConfigurationFormProps
> = ({ config, onChange }) => {
	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);
	};

	const selectedRegion = config.region;
	const availableAZs = AWS_REGIONS_WITH_AZS[config.region] || [];
	console.log("Available Zones: ", availableAZs);

	return (
		<div className="space-y-4">
			{/* Subnet Name */}
			<div className="space-y-2">
				<Label htmlFor="subnet-name">
					Subnet Name <span className="text-red-600">*</span>
				</Label>
				<Input
					id="subnet-name"
					placeholder="Enter private subnet name"
					value={config.serviceName || ""}
					onChange={(e) => handleFieldChange("serviceName", e.target.value)}
				/>
			</div>

			{/* VPC ID */}
			<div className="space-y-2">
				<Label htmlFor="vpc-id">
					VPC ID <span className="text-red-600">*</span>
				</Label>
				<Input
					id="vpc-id"
					placeholder="vpc-xxxxxxxxx"
					value={config.vpcId || ""}
					onChange={(e) => handleFieldChange("vpcId", e.target.value)}
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

			{/* Region */}
			<div className="space-y-2">
				<Label htmlFor="region">
					AWS Region <span className="text-red-600">*</span>
				</Label>
				<Select
					value={config.region}
					onValueChange={(value) => handleFieldChange("region", value)}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select AWS Region" />
					</SelectTrigger>
					<SelectContent>
						{Object.keys(AWS_REGIONS_WITH_AZS).map((region) => (
							<SelectItem key={region} value={region}>
								{region}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Availability Zone */}
			<div className="space-y-2">
				<Label htmlFor="availability-zone">
					Availability Zone <span className="text-red-600">*</span>
				</Label>
				<Select
					value={config.availabilityZone || ""}
					onValueChange={(value) =>
						handleFieldChange("availabilityZone", value)
					}
					disabled={!selectedRegion}
				>
					<SelectTrigger className="w-full">
						<SelectValue
							placeholder={
								selectedRegion
									? "Select availability zone"
									: "Select region first"
							}
						/>
					</SelectTrigger>
					<SelectContent>
						{availableAZs.map((az) => (
							<SelectItem key={az} value={az}>
								{az}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Description */}
			{/* <div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="Private subnet description"
					value={(config.description as string) || ""}
					onChange={(e) => handleFieldChange("description", e.target.value)}
					rows={3}
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
				<Label htmlFor="nat-gateway">
					Enable NAT Gateway for internet access
				</Label>
			</div> */}

			{/* Tags */}
			{/* <div className="space-y-2">
				<Label htmlFor="tags">Tags (key=value, separated by commas)</Label>
				<Textarea
					id="tags"
					placeholder="Environment=Production, Type=Private"
					value={(config.tags as string) || ""}
					onChange={(e) => handleFieldChange("tags", e.target.value)}
					rows={2}
				/>
			</div> */}
		</div>
	);
};

export default PrivateSubnetConfigurationForm;
