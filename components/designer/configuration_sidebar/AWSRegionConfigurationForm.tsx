"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
import { useConfigurationContext } from "@/lib/stores";
import {
	AWSRegionConfiguration,
} from "@/lib/types/aws-resources";

const awsRegions = [
	{ code: "us-east-1", name: "US East (N. Virginia)" },
	{ code: "us-east-2", name: "US East (Ohio)" },
	{ code: "us-west-1", name: "US West (N. California)" },
	{ code: "us-west-2", name: "US West (Oregon)" },
	{ code: "af-south-1", name: "Africa (Cape Town)" },
	{ code: "ap-east-1", name: "Asia Pacific (Hong Kong)" },
	{ code: "ap-south-1", name: "Asia Pacific (Mumbai)" },
	{ code: "ap-south-2", name: "Asia Pacific (Hyderabad)" },
	{ code: "ap-southeast-1", name: "Asia Pacific (Singapore)" },
	{ code: "ap-southeast-2", name: "Asia Pacific (Sydney)" },
	{ code: "ap-southeast-3", name: "Asia Pacific (Jakarta)" },
	{ code: "ap-southeast-4", name: "Asia Pacific (Melbourne)" },
	{ code: "ap-northeast-1", name: "Asia Pacific (Tokyo)" },
	{ code: "ap-northeast-2", name: "Asia Pacific (Seoul)" },
	{ code: "ap-northeast-3", name: "Asia Pacific (Osaka)" },
	{ code: "ca-central-1", name: "Canada (Central)" },
	{ code: "eu-central-1", name: "Europe (Frankfurt)" },
	{ code: "eu-central-2", name: "Europe (Zurich)" },
	{ code: "eu-north-1", name: "Europe (Stockholm)" },
	{ code: "eu-south-1", name: "Europe (Milan)" },
	{ code: "eu-south-2", name: "Europe (Spain)" },
	{ code: "eu-west-1", name: "Europe (Ireland)" },
	{ code: "eu-west-2", name: "Europe (London)" },
	{ code: "eu-west-3", name: "Europe (Paris)" },
	{ code: "il-central-1", name: "Israel (Tel Aviv)" },
	{ code: "me-central-1", name: "Middle East (UAE)" },
	{ code: "me-south-1", name: "Middle East (Bahrain)" },
	{ code: "sa-east-1", name: "South America (São Paulo)" },
	{ code: "us-gov-east-1", name: "AWS GovCloud (US-East)" },
	{ code: "us-gov-west-1", name: "AWS GovCloud (US-West)" },
	{ code: "cn-north-1", name: "China (Beijing)" },
	{ code: "cn-northwest-1", name: "China (Ningxia)" },
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
		const selectedRegion = awsRegions.find((region) => region.code === regionCode);
		if (selectedRegion) {
			const updatedConfig = {
				...config,
				regionCode: regionCode,
				name: selectedRegion.name,
				displayName: `${selectedRegion.name} (${regionCode})`,
			};
			onChange(updatedConfig);
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="region">AWS Region</Label>
				<Select
					value={config.regionCode || ""}
					onValueChange={handleRegionChange}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select AWS region" />
					</SelectTrigger>
					<SelectContent>
						{awsRegions.map((region) => (
							<SelectItem key={region.code} value={region.code}>
								{region.name} ({region.code})
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
					value={config.name || ""}
					onChange={(e) => handleFieldChange("name", e.target.value)}
				/>
			</div>
			{/* Region Display Name */}
			<div className="space-y-2">
				<Label htmlFor="display-name">Display Name</Label>
				<Input
					id="display-name"
					placeholder="Auto-filled from region selection"
					value={config.displayName || ""}
					onChange={(e) => handleFieldChange("displayName", e.target.value)}
				/>
			</div>
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
			<div className="space-y-2">
				<Label htmlFor="tags">Tags (key=value, separated by commas)</Label>
				<Textarea
					id="tags"
					placeholder="Environment=Production, Owner=TeamA"
					value={config.tags || ""}
					onChange={(e) => handleFieldChange("tags", e.target.value)}
				/>
			</div>
		</div>
	);
};

export default AWSRegionConfigurationForm;