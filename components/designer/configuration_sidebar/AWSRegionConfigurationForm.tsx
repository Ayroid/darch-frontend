"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
import { useConfigurationContext } from "@/lib/stores";
import { AWSRegionConfiguration } from "@/lib/types/aws-resources";

const awsRegions = [
	{ regionCode: "us-east-1", regionName: "US East (N. Virginia)" },
	{ regionCode: "us-east-2", regionName: "US East (Ohio)" },
	{ regionCode: "us-west-1", regionName: "US West (N. California)" },
	{ regionCode: "us-west-2", regionName: "US West (Oregon)" },
	{ regionCode: "af-south-1", regionName: "Africa (Cape Town)" },
	{ regionCode: "ap-east-1", regionName: "Asia Pacific (Hong Kong)" },
	{ regionCode: "ap-south-1", regionName: "Asia Pacific (Mumbai)" },
	{ regionCode: "ap-south-2", regionName: "Asia Pacific (Hyderabad)" },
	{ regionCode: "ap-southeast-1", regionName: "Asia Pacific (Singapore)" },
	{ regionCode: "ap-southeast-2", regionName: "Asia Pacific (Sydney)" },
	{ regionCode: "ap-southeast-3", regionName: "Asia Pacific (Jakarta)" },
	{ regionCode: "ap-southeast-4", regionName: "Asia Pacific (Melbourne)" },
	{ regionCode: "ap-northeast-1", regionName: "Asia Pacific (Tokyo)" },
	{ regionCode: "ap-northeast-2", regionName: "Asia Pacific (Seoul)" },
	{ regionCode: "ap-northeast-3", regionName: "Asia Pacific (Osaka)" },
	{ regionCode: "ca-central-1", regionName: "Canada (Central)" },
	{ regionCode: "eu-central-1", regionName: "Europe (Frankfurt)" },
	{ regionCode: "eu-central-2", regionName: "Europe (Zurich)" },
	{ regionCode: "eu-north-1", regionName: "Europe (Stockholm)" },
	{ regionCode: "eu-south-1", regionName: "Europe (Milan)" },
	{ regionCode: "eu-south-2", regionName: "Europe (Spain)" },
	{ regionCode: "eu-west-1", regionName: "Europe (Ireland)" },
	{ regionCode: "eu-west-2", regionName: "Europe (London)" },
	{ regionCode: "eu-west-3", regionName: "Europe (Paris)" },
	{ regionCode: "il-central-1", regionName: "Israel (Tel Aviv)" },
	{ regionCode: "me-central-1", regionName: "Middle East (UAE)" },
	{ regionCode: "me-south-1", regionName: "Middle East (Bahrain)" },
	{ regionCode: "sa-east-1", regionName: "South America (São Paulo)" },
	{ regionCode: "us-gov-east-1", regionName: "AWS GovCloud (US-East)" },
	{ regionCode: "us-gov-west-1", regionName: "AWS GovCloud (US-West)" },
	{ regionCode: "cn-north-1", regionName: "China (Beijing)" },
	{ regionCode: "cn-northwest-1", regionName: "China (Ningxia)" },
] as const;

interface AWSRegionConfigurationFormProps {
	config: AWSRegionConfiguration;
	onChange: (config: AWSRegionConfiguration) => void;
}

const AWSRegionConfigurationForm: React.FC<AWSRegionConfigurationFormProps> = ({
	config,
	onChange,
}) => {
	const { nodeId, serviceId } = useConfigurationContext();
	console.log("Node ID:", nodeId);
	console.log("Service ID:", serviceId);

	const handleFieldChange = (field: string, value: unknown) => {
		const updatedConfig = {
			...config,
			[field]: value,
		};
		onChange(updatedConfig);
	};

	const handleRegionChange = (regionCode: string) => {
		const selectedRegion = awsRegions.find(
			(region) => region.regionCode === regionCode
		);
		if (selectedRegion) {
			const updatedConfig = {
				...config,
				regionCode: regionCode,
				regionName: selectedRegion.regionName,
				displayName: `${selectedRegion.regionName} (${regionCode})`,
			};
			onChange(updatedConfig);
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="region">
					AWS Region<span className="text-red-600">*</span>
				</Label>
				<Select
					value={config.regionCode || ""}
					onValueChange={handleRegionChange}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select AWS region" />
					</SelectTrigger>
					<SelectContent>
						{awsRegions.map((region) => (
							<SelectItem key={region.regionCode} value={region.regionCode}>
								{region.regionCode}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			{/* Region Name */}
			<div className="space-y-2">
				<Label htmlFor="region-name">Region Name</Label>
				<Input
					id="region-name"
					placeholder="Enter region name"
					value={config.regionName || ""}
					disabled
					onChange={(e) => handleFieldChange("regionName", e.target.value)}
				/>
			</div>
			{/* Region Display Name */}
			{/* <div className="space-y-2">
				<Label htmlFor="display-name">Display Name</Label>
				<Input
					id="display-name"
					placeholder="Auto-filled from region selection"
					value={config.displayName || ""}
					onChange={(e) => handleFieldChange("displayName", e.target.value)}
				/>
			</div> */}
			{/* Region Description */}
			{/* <div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					placeholder="Region description"
					value={config.description || ""}
					onChange={(e) => handleFieldChange("description", e.target.value)}
				/>
			</div> */}
			{/* Enable Region */}
			{/* <div className="flex items-center space-x-2">
				<Checkbox
					id="enabled"
					checked={config.isEnabled ?? true}
					onCheckedChange={(checked) => handleFieldChange("isEnabled", checked)}
				/>
				<Label htmlFor="enabled">Enable Region</Label>
			</div> */}
			{/* Default Region */}
			{/* <div className="flex items-center space-x-2">
				<Checkbox
					id="default-region"
					checked={config.isDefault ?? false}
					onCheckedChange={(checked) => handleFieldChange("isDefault", checked)}
				/>
				<Label htmlFor="default-region">Set as Default Region</Label>
			</div> */}

			{/* Tags */}
			{/* <div className="space-y-2">
				<Label htmlFor="tags">Tags (key=value, separated by commas)</Label>
				<Textarea
					id="tags"
					placeholder="Environment=Production, Owner=TeamA"
					value={config.tags || ""}
					onChange={(e) => handleFieldChange("tags", e.target.value)}
				/>
			</div> */}
		</div>
	);
};

export default AWSRegionConfigurationForm;